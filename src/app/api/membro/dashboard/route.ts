import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { prisma } from "@/lib/db";
import { memberPointsTotal, rankingForPeriod } from "@/lib/ranking";
import { labelPointAction } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";

export async function GET() {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile, session } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const [event, pontos, rank, openInvoice, recentPoints, activeOffers, notifs] =
    await Promise.all([
      prisma.event.findFirst({
        where: { ativo: true },
        include: { prices: true, _count: { select: { registrations: true } } },
      }),
      memberPointsTotal(profile.id),
      rankingForPeriod("geral"),
      prisma.invoice.findFirst({
        where: { memberId: profile.id, status: { in: ["PENDING", "OVERDUE"] } },
        orderBy: { dueDate: "asc" },
      }),
      prisma.pointEntry.findMany({
        where: { memberId: profile.id },
        orderBy: { occurredAt: "desc" },
        take: 5,
      }),
      prisma.offer.findMany({
        where: { ativo: true },
        orderBy: { updatedAt: "desc" },
        include: {
          member: { include: { user: { select: { name: true, image: true } } } },
        },
      }),
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const myRank = rank.find((r) => r.id === profile.id);
  const mensalidadeEmDia =
    !openInvoice && profile.subscription?.status === "ACTIVE";

  return jsonOk({
    greetingName: session.user.name?.split(" ")[0] ?? "Membro",
    event,
    confirmedCount: event?._count.registrations ?? 0,
    pontos,
    rank: myRank?.rank ?? null,
    rankTop: rank.slice(0, 4),
    mensalidadeEmDia,
    openInvoice: openInvoice
      ? {
          ...openInvoice,
          valor: formatCurrency(openInvoice.amountCents),
        }
      : null,
    subscriptionStatus: profile.subscription?.status ?? "PENDING",
    nextDue: profile.subscription?.nextDueDate,
    activity: recentPoints.map((p) => ({
      titulo: p.note?.trim() || labelPointAction(p.action),
      quando: p.occurredAt,
      valor: `+${p.pontos}`,
    })),
    activeOffer: activeOffers[0] ?? null,
    activeOffers,
    notifications: notifs,
    unread: notifs.filter((n) => !n.read).length,
  });
}
