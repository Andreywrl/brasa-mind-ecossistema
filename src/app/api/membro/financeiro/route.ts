import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { asaasConfigured, createPayment, getPixQrCode } from "@/lib/asaas";
import { holderFromProfile } from "@/lib/asaas-holder";
import { creditCardSchema, onlyDigits, zodErrorMessage } from "@/lib/br";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { z } from "zod";

export async function GET() {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const invoices = await prisma.invoice.findMany({
    where: { memberId: profile.id, kind: "MEMBERSHIP" },
    orderBy: { dueDate: "desc" },
  });

  const paid = invoices.filter((i) => i.status === "PAID");
  const totalPago = paid.reduce((s, i) => s + i.amountCents, 0);
  const open = invoices.find((i) => i.status === "PENDING" || i.status === "OVERDUE");
  const emDia = !open && profile.subscription?.status === "ACTIVE";

  return jsonOk({
    subscription: profile.subscription,
    cardLast4: profile.cardLast4,
    cardBrand: profile.cardBrand,
    emDia,
    totalPago,
    totalPagoFmt: formatCurrency(totalPago),
    nextDue: profile.subscription?.nextDueDate,
    invoices: invoices.map((i) => ({
      ...i,
      valor: formatCurrency(i.amountCents),
    })),
    asaasConfigured: asaasConfigured(),
    addressComplete: Boolean(profile.cep && profile.addressNumber && profile.cnpj),
  });
}

const paySchema = z.object({
  invoiceId: z.string().min(1),
  paymentMethod: z.enum(["CREDIT_CARD", "PIX", "BOLETO"]).default("PIX"),
  creditCard: creditCardSchema.optional(),
});

export async function POST(req: Request) {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile, session } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const parsed = paySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));
  const body = parsed.data;

  if (body.paymentMethod === "CREDIT_CARD" && asaasConfigured() && !body.creditCard) {
    return jsonError("Preencha os dados do cartão");
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: body.invoiceId, memberId: profile.id },
  });
  if (!invoice) return jsonError("Cobrança não encontrada", 404);
  if (invoice.status === "PAID") return jsonError("Já está paga");

  const method = body.paymentMethod;

  if (!asaasConfigured()) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentMethod: method,
      },
    });
    await prisma.subscription.update({
      where: { memberId: profile.id },
      data: { status: "ACTIVE", overdueSince: null },
    });
    return jsonOk({
      ok: true,
      asaasSkipped: true,
      message: "Asaas não configurado: mensalidade marcada como paga em modo local.",
    });
  }

  if (!profile.asaasCustomerId) {
    return jsonError("Cliente Asaas ausente");
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
    value: invoice.amountCents / 100,
    dueDate: new Date().toISOString().slice(0, 10),
    billingType,
    description: `Mensalidade · ${invoice.competencia ?? "Brasamind"}`,
    creditCard: body.creditCard
      ? { ...body.creditCard, number: onlyDigits(body.creditCard.number) }
      : undefined,
    creditCardHolderInfo: holder,
  });

  if (!pay.ok) return jsonError(pay.error);

  let pix = null;
  if (billingType === "PIX") {
    const qr = await getPixQrCode(pay.data.id);
    if (qr.ok) pix = qr.data;
  }

  const paid =
    pay.data.status === "CONFIRMED" || pay.data.status === "RECEIVED";

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      asaasPaymentId: pay.data.id,
      status: paid ? "PAID" : "PENDING",
      paidAt: paid ? new Date() : null,
      paymentMethod: method,
      boletoUrl: pay.data.bankSlipUrl ?? pay.data.invoiceUrl,
      pixQrCode: pix?.encodedImage,
      pixCopyPaste: pix?.payload,
    },
  });

  if (paid) {
    await prisma.subscription.update({
      where: { memberId: profile.id },
      data: { status: "ACTIVE", overdueSince: null },
    });
  }

  return jsonOk({
    ok: true,
    pix,
    payment: pay.data,
    paid,
    boletoUrl: pay.data.bankSlipUrl ?? pay.data.invoiceUrl,
  });
}
