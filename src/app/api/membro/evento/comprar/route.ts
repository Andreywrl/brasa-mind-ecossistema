import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { asaasConfigured, createPayment, getPixQrCode } from "@/lib/asaas";
import { holderFromProfile } from "@/lib/asaas-holder";
import { creditCardSchema, onlyDigits, zodErrorMessage } from "@/lib/br";
import { newCheckinCode } from "@/lib/checkin";
import { prisma } from "@/lib/db";
import { emailTicketConfirmed } from "@/lib/email-templates";
import { TICKET_PRICES } from "@/lib/utils";
import type { MemberCategory } from "@prisma/client";
import { z } from "zod";

const bodySchema = z.object({
  paymentMethod: z.enum(["CREDIT_CARD", "PIX", "BOLETO"]).default("PIX"),
  creditCard: creditCardSchema.optional(),
});

export async function POST(req: Request) {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile, session } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));
  const body = parsed.data;

  const event = await prisma.event.findFirst({
    where: { ativo: true },
    include: { prices: true },
  });
  if (!event) return jsonError("Nenhum evento ativo");

  const existing = await prisma.registration.findFirst({
    where: {
      eventId: event.id,
      memberId: profile.id,
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_PAYMENT"] },
    },
  });
  if (existing?.status === "CONFIRMED" || existing?.status === "CHECKED_IN") {
    return jsonError("Você já tem ingresso para este evento");
  }

  const cat = profile.categoria as MemberCategory;
  const priceCents =
    event.prices.find((p) => p.tier === cat)?.amountCents ??
    TICKET_PRICES[cat];

  const method = body.paymentMethod;

  if (priceCents === 0) {
    const reg = await prisma.registration.create({
      data: {
        eventId: event.id,
        memberId: profile.id,
        type: "MEMBER",
        status: "CONFIRMED",
        ticketCents: 0,
        checkinCode: newCheckinCode(),
      },
    });
    void emailTicketConfirmed({
      to: session.user.email!,
      eventName: event.nome,
      checkinCode: reg.checkinCode,
    });
    return jsonOk({ registration: reg, free: true });
  }

  if (method === "CREDIT_CARD" && asaasConfigured() && !body.creditCard) {
    return jsonError("Preencha os dados do cartão");
  }

  if (!asaasConfigured()) {
    const reg = await prisma.registration
      .upsert({
        where: { id: existing?.id ?? "___none___" },
        create: {
          eventId: event.id,
          memberId: profile.id,
          type: "MEMBER",
          status: "CONFIRMED",
          ticketCents: priceCents,
          checkinCode: newCheckinCode(),
          invoice: {
            create: {
              memberId: profile.id,
              kind: "EVENT_TICKET",
              status: "PAID",
              amountCents: priceCents,
              dueDate: new Date(),
              paidAt: new Date(),
              paymentMethod: method,
            },
          },
        },
        update: { status: "CONFIRMED", ticketCents: priceCents },
        include: { invoice: true },
      })
      .catch(async () => {
        return prisma.registration.create({
          data: {
            eventId: event.id,
            memberId: profile.id,
            type: "MEMBER",
            status: "CONFIRMED",
            ticketCents: priceCents,
            checkinCode: newCheckinCode(),
            invoice: {
              create: {
                memberId: profile.id,
                kind: "EVENT_TICKET",
                status: "PAID",
                amountCents: priceCents,
                dueDate: new Date(),
                paidAt: new Date(),
                paymentMethod: method,
              },
            },
          },
          include: { invoice: true },
        });
      });
    void emailTicketConfirmed({
      to: session.user.email!,
      eventName: event.nome,
      checkinCode: reg.checkinCode,
    });
    return jsonOk({
      registration: reg,
      asaasSkipped: true,
      message: "Asaas não configurado: ingresso confirmado em modo local.",
    });
  }

  if (!profile.asaasCustomerId) {
    return jsonError("Cliente Asaas ausente. Atualize o cadastro financeiro.");
  }

  const billingType =
    method === "CREDIT_CARD" ? "CREDIT_CARD" : method === "BOLETO" ? "BOLETO" : "PIX";

  let holder;
  if (body.creditCard) {
    const h = holderFromProfile(profile, {
      name: session.user.name,
      email: session.user.email!,
    });
    if ("error" in h) return jsonError(h.error);
    holder = h;
  }

  const pay = await createPayment({
    customer: profile.asaasCustomerId,
    value: priceCents / 100,
    dueDate: new Date().toISOString().slice(0, 10),
    billingType,
    description: `Ingresso · ${event.nome}`,
    creditCard: body.creditCard
      ? { ...body.creditCard, number: onlyDigits(body.creditCard.number) }
      : undefined,
    creditCardHolderInfo: holder,
  });

  if (!pay.ok) return jsonError(pay.error);

  const status =
    pay.data.status === "CONFIRMED" || pay.data.status === "RECEIVED"
      ? "CONFIRMED"
      : "PENDING_PAYMENT";

  const reg = await prisma.registration.create({
    data: {
      eventId: event.id,
      memberId: profile.id,
      type: "MEMBER",
      status: status as "CONFIRMED" | "PENDING_PAYMENT",
      ticketCents: priceCents,
      checkinCode: newCheckinCode(),
      invoice: {
        create: {
          memberId: profile.id,
          kind: "EVENT_TICKET",
          status: status === "CONFIRMED" ? "PAID" : "PENDING",
          amountCents: priceCents,
          dueDate: new Date(),
          paidAt: status === "CONFIRMED" ? new Date() : null,
          paymentMethod: method,
          asaasPaymentId: pay.data.id,
          boletoUrl: pay.data.bankSlipUrl ?? pay.data.invoiceUrl,
        },
      },
    },
    include: { invoice: true },
  });

  let pix: { encodedImage?: string; payload?: string } | null = null;
  if (billingType === "PIX") {
    const qr = await getPixQrCode(pay.data.id);
    if (qr.ok) {
      pix = qr.data;
      if (reg.invoice) {
        await prisma.invoice.update({
          where: { id: reg.invoice.id },
          data: {
            pixQrCode: qr.data.encodedImage,
            pixCopyPaste: qr.data.payload,
          },
        });
      }
    }
  }

  if (status === "CONFIRMED") {
    void emailTicketConfirmed({
      to: session.user.email!,
      eventName: event.nome,
      checkinCode: reg.checkinCode,
    });
  }

  return jsonOk({
    registration: reg,
    pix,
    payment: pay.data,
    boletoUrl: pay.data.bankSlipUrl ?? pay.data.invoiceUrl,
  });
}
