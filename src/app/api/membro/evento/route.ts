import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { prisma } from "@/lib/db";
import { TICKET_PRICES } from "@/lib/utils";
import type { MemberCategory } from "@prisma/client";

export async function GET() {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const event = await prisma.event.findFirst({
    where: { ativo: true },
    include: {
      prices: true,
      _count: { select: { registrations: true } },
      registrations: {
        where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } },
        take: 12,
        include: {
          member: { include: { user: { select: { name: true, image: true } } } },
          guest: true,
        },
      },
    },
  });

  if (!event) return jsonOk({ event: null, registration: null, priceCents: null });

  const registration = await prisma.registration.findFirst({
    where: {
      eventId: event.id,
      memberId: profile.id,
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_PAYMENT"] },
    },
    include: { invoice: true },
  });

  const cat = profile.categoria as MemberCategory;
  const priceCents =
    event.prices.find((p) => p.tier === cat)?.amountCents ??
    TICKET_PRICES[cat] ??
    TICKET_PRICES.MEMBRO;

  return jsonOk({
    event: {
      ...event,
      confirmedCount: event._count.registrations,
    },
    registration,
    priceCents,
    category: cat,
  });
}
