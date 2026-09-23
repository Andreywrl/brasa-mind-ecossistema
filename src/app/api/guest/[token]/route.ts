import { jsonError, jsonOk } from "@/lib/api";
import {
  asaasConfigured,
  createCustomer,
  createPayment,
  getPixQrCode,
} from "@/lib/asaas";
import { holderFromGuest } from "@/lib/asaas-holder";
import { guestPayBodySchema, onlyDigits, zodErrorMessage } from "@/lib/br";
import { newCheckinCode } from "@/lib/checkin";
import { prisma } from "@/lib/db";
import { emailGuestTicketConfirmed } from "@/lib/email-templates";
import { TICKET_PRICES } from "@/lib/utils";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      event: { include: { prices: true } },
      host: { include: { user: { select: { name: true, image: true } } } },
    },
  });
  if (!invite) return jsonError("Convite inválido", 404);

  const price =
    invite.event.prices.find((p) => p.tier === "CONVIDADO")?.amountCents ??
    TICKET_PRICES.CONVIDADO;

  const pastEvents = await prisma.event.findMany({
    where: { ativo: false },
    orderBy: { data: "desc" },
    take: 4,
    select: { id: true, nome: true, data: true, localShort: true, capaUrl: true },
  });

  return jsonOk({
    invite: {
      token: invite.token,
      message: invite.message,
      hostName: invite.host.user.name,
      hostFoto: invite.host.fotoUrl ?? invite.host.user.image,
      hostEmpresa: invite.host.empresa,
    },
    event: invite.event,
    priceCents: price,
    pastEvents,
    asaasConfigured: asaasConfigured(),
  });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      event: { include: { prices: true } },
      host: { include: { user: { select: { name: true } } } },
    },
  });
  if (!invite) return jsonError("Convite inválido", 404);

  const parsed = guestPayBodySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));
  const body = parsed.data;

  if (body.paymentMethod === "CREDIT_CARD" && asaasConfigured() && !body.creditCard) {
    return jsonError("Preencha os dados do cartão");
  }

  const priceCents =
    invite.event.prices.find((p) => p.tier === "CONVIDADO")?.amountCents ??
    TICKET_PRICES.CONVIDADO;

  const guest = await prisma.guest.create({
    data: {
      inviteId: invite.id,
      nome: body.nome,
      empresa: body.empresa || null,
      email: body.email,
      whatsapp: body.whatsapp ? onlyDigits(body.whatsapp) : null,
      cpf: onlyDigits(body.cpf),
      cep: onlyDigits(body.cep),
      addressNumber: body.addressNumber,
    },
  });

  const holder = holderFromGuest({
    nome: body.nome,
    email: body.email,
    cpf: body.cpf,
    cep: body.cep,
    addressNumber: body.addressNumber,
    whatsapp: body.whatsapp,
  });

  if (!asaasConfigured()) {
    const checkinCode = newCheckinCode();
    const reg = await prisma.registration.create({
      data: {
        eventId: invite.eventId,
        guestId: guest.id,
        type: "GUEST",
        status: "CONFIRMED",
        ticketCents: priceCents,
        checkinCode,
        invoice: {
          create: {
            guestId: guest.id,
            kind: "GUEST_TICKET",
            status: "PAID",
            amountCents: priceCents,
            dueDate: new Date(),
            paidAt: new Date(),
            paymentMethod: body.paymentMethod,
          },
        },
      },
      include: { invoice: true },
    });

    await prisma.pointEntry.create({
      data: {
        memberId: invite.hostId,
        action: "CONVITE_CONVERTIDO",
        pontos: 50,
        note: `Indicação de ${guest.nome}`,
        eventId: invite.eventId,
      },
    });

    void emailGuestTicketConfirmed({
      to: body.email,
      eventName: invite.event.nome,
      checkinCode,
      hostName: invite.host.user.name ?? null,
    });

    return jsonOk({
      ok: true,
      registration: reg,
      asaasSkipped: true,
      code: checkinCode,
    });
  }

  const customer = await createCustomer({
    name: body.nome,
    email: body.email,
    cpfCnpj: onlyDigits(body.cpf),
    mobilePhone: body.whatsapp,
  });
  if (!customer.ok) return jsonError(customer.error);

  const billingType =
    body.paymentMethod === "CREDIT_CARD"
      ? "CREDIT_CARD"
      : body.paymentMethod === "BOLETO"
        ? "BOLETO"
        : "PIX";

  const pay = await createPayment({
    customer: customer.data.id,
    value: priceCents / 100,
    dueDate: new Date().toISOString().slice(0, 10),
    billingType,
    description: `Ingresso convidado · ${invite.event.nome}`,
    creditCard: body.creditCard
      ? { ...body.creditCard, number: onlyDigits(body.creditCard.number) }
      : undefined,
    creditCardHolderInfo: body.creditCard ? holder : undefined,
  });
  if (!pay.ok) return jsonError(pay.error);

  const paid =
    pay.data.status === "CONFIRMED" || pay.data.status === "RECEIVED";

  let pix = null;
  if (billingType === "PIX") {
    const qr = await getPixQrCode(pay.data.id);
    if (qr.ok) pix = qr.data;
  }

  const checkinCode = newCheckinCode();
  const reg = await prisma.registration.create({
    data: {
      eventId: invite.eventId,
      guestId: guest.id,
      type: "GUEST",
      status: paid ? "CONFIRMED" : "PENDING_PAYMENT",
      ticketCents: priceCents,
      checkinCode,
      invoice: {
        create: {
          guestId: guest.id,
          kind: "GUEST_TICKET",
          status: paid ? "PAID" : "PENDING",
          amountCents: priceCents,
          dueDate: new Date(),
          paidAt: paid ? new Date() : null,
          paymentMethod: body.paymentMethod,
          asaasPaymentId: pay.data.id,
          boletoUrl: pay.data.bankSlipUrl ?? pay.data.invoiceUrl,
          pixQrCode: pix?.encodedImage,
          pixCopyPaste: pix?.payload,
        },
      },
    },
    include: { invoice: true },
  });

  if (paid) {
    await prisma.pointEntry.create({
      data: {
        memberId: invite.hostId,
        action: "CONVITE_CONVERTIDO",
        pontos: 50,
        note: `Indicação de ${guest.nome}`,
        eventId: invite.eventId,
      },
    });
    void emailGuestTicketConfirmed({
      to: body.email,
      eventName: invite.event.nome,
      checkinCode,
      hostName: invite.host.user.name ?? null,
    });
  }

  return jsonOk({
    ok: true,
    registration: reg,
    pix,
    paid,
    code: checkinCode,
  });
}
