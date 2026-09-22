import { jsonError, jsonOk } from "@/lib/api";
import {
  asaasConfigured,
  createCustomer,
  createSubscription,
} from "@/lib/asaas";
import { holderFromGuest } from "@/lib/asaas-holder";
import { onlyDigits, signupBodySchema, zodErrorMessage } from "@/lib/br";
import { prisma } from "@/lib/db";
import { MEMBERSHIP_CENTS } from "@/lib/utils";
import bcrypt from "bcryptjs";
import type { MemberCategory } from "@prisma/client";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const invite = await prisma.membershipInvite.findUnique({
    where: { token },
  });
  if (!invite || !invite.active) {
    return jsonError("Link de cadastro inválido ou expirado", 404);
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return jsonError("Link de cadastro expirado", 410);
  }
  if (invite.usedCount >= invite.maxUses) {
    return jsonError("Este link já atingiu o limite de usos", 410);
  }

  const pastEvents = await prisma.event.findMany({
    where: { ativo: false },
    orderBy: { data: "desc" },
    take: 4,
    select: {
      id: true,
      nome: true,
      data: true,
      localShort: true,
      capaUrl: true,
    },
  });

  return jsonOk({
    invite: {
      token: invite.token,
      categoria: invite.categoria,
    },
    pastEvents,
    membershipCents: MEMBERSHIP_CENTS,
    asaasConfigured: asaasConfigured(),
  });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const invite = await prisma.membershipInvite.findUnique({
    where: { token },
  });
  if (!invite || !invite.active) return jsonError("Link inválido", 404);
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return jsonError("Link expirado", 410);
  }
  if (invite.usedCount >= invite.maxUses) {
    return jsonError("Limite de usos atingido", 410);
  }

  const parsed = signupBodySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));
  const body = parsed.data;

  if (body.paymentMethod === "CREDIT_CARD" && asaasConfigured()) {
    if (!body.creditCard) {
      return jsonError("Preencha os dados do cartão");
    }
  }

  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) return jsonError("E-mail já cadastrado");

  const passwordHash = await bcrypt.hash(body.password, 10);
  const categoria = invite.categoria as MemberCategory;
  const cnpjDigits = onlyDigits(body.cnpj);
  const cepDigits = onlyDigits(body.cep);

  let asaasCustomerId: string | null = null;
  let asaasSubscriptionId: string | null = null;
  let cardLast4: string | null = null;
  let cardBrand: string | null = null;

  const holder = holderFromGuest({
    nome: body.name,
    email: body.email,
    cpf: body.cnpj,
    cep: body.cep,
    addressNumber: body.addressNumber,
    whatsapp: body.whatsapp,
  });

  if (asaasConfigured()) {
    const customer = await createCustomer({
      name: body.name,
      email: body.email,
      cpfCnpj: cnpjDigits,
      mobilePhone: body.whatsapp,
    });
    if (!customer.ok) return jsonError(customer.error);
    asaasCustomerId = customer.data.id;

    const billingType = body.paymentMethod as "CREDIT_CARD" | "PIX" | "BOLETO";
    const sub = await createSubscription({
      customer: asaasCustomerId,
      value: MEMBERSHIP_CENTS / 100,
      nextDueDate: new Date().toISOString().slice(0, 10),
      billingType,
      creditCard: body.creditCard
        ? {
            ...body.creditCard,
            number: onlyDigits(body.creditCard.number),
          }
        : undefined,
      creditCardHolderInfo: body.creditCard ? holder : undefined,
    });
    if (!sub.ok) return jsonError(sub.error);
    asaasSubscriptionId = sub.data.id;

    if (body.creditCard?.number) {
      cardLast4 = onlyDigits(body.creditCard.number).slice(-4);
      cardBrand = "card";
    }
  } else if (body.creditCard?.number) {
    cardLast4 = onlyDigits(body.creditCard.number).slice(-4);
    cardBrand = "card";
  }

  const docs = await prisma.legalDocument.findMany({
    where: { published: true },
    select: { id: true },
  });

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      role: "MEMBRO",
      profile: {
        create: {
          empresa: body.empresa,
          cnpj: cnpjDigits,
          especialidade: body.especialidade || null,
          cidade: body.cidade || null,
          categoria,
          whatsapp: onlyDigits(body.whatsapp),
          endereco: body.endereco,
          cep: cepDigits,
          addressNumber: body.addressNumber,
          addressComplement: body.addressComplement || null,
          bairro: body.bairro,
          asaasCustomerId,
          cardLast4,
          cardBrand,
          subscription: {
            create: {
              status: asaasConfigured() ? "PENDING" : "ACTIVE",
              amountCents: MEMBERSHIP_CENTS,
              asaasSubscriptionId,
              nextDueDate: new Date(),
            },
          },
        },
      },
      consents: {
        create: docs.map((d) => ({ documentId: d.id })),
      },
    },
    include: { profile: true },
  });

  await prisma.membershipInvite.update({
    where: { id: invite.id },
    data: { usedCount: { increment: 1 } },
  });

  return jsonOk({
    ok: true,
    userId: user.id,
    asaasSkipped: !asaasConfigured(),
  });
}
