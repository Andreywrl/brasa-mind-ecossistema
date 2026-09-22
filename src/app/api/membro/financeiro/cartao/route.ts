import { jsonError, jsonOk, requireMember } from "@/lib/api";
import {
  asaasConfigured,
  updateSubscriptionCreditCard,
} from "@/lib/asaas";
import { holderFromProfile } from "@/lib/asaas-holder";
import { creditCardSchema, onlyDigits, zodErrorMessage } from "@/lib/br";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  creditCard: creditCardSchema,
});

export async function PATCH(req: Request) {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile, session } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));
  const { creditCard } = parsed.data;
  const last4 = onlyDigits(creditCard.number).slice(-4);

  if (!asaasConfigured() || !profile.subscription?.asaasSubscriptionId) {
    await prisma.memberProfile.update({
      where: { id: profile.id },
      data: { cardLast4: last4, cardBrand: "card" },
    });
    return jsonOk({
      ok: true,
      cardLast4: last4,
      asaasSkipped: true,
      message: "Cartão salvo localmente (Asaas desligado).",
    });
  }

  const holder = holderFromProfile(profile, {
    name: session.user.name,
    email: session.user.email!,
  });
  if ("error" in holder) return jsonError(holder.error);

  const updated = await updateSubscriptionCreditCard(
    profile.subscription.asaasSubscriptionId,
    {
      creditCard: { ...creditCard, number: onlyDigits(creditCard.number) },
      creditCardHolderInfo: holder,
    },
  );
  if (!updated.ok) return jsonError(updated.error);

  await prisma.memberProfile.update({
    where: { id: profile.id },
    data: { cardLast4: last4, cardBrand: "card" },
  });

  return jsonOk({
    ok: true,
    cardLast4: last4,
    message: `Cartão final ${last4} atualizado no Asaas.`,
  });
}
