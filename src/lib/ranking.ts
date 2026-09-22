import { prisma } from "@/lib/db";
import { startOfMonth, startOfYear, endOfMonth, endOfYear } from "date-fns";

export type RankPeriod = "mensal" | "anual" | "geral";

export async function rankingForPeriod(period: RankPeriod) {
  const now = new Date();
  let from: Date | undefined;
  let to: Date | undefined;
  if (period === "mensal") {
    from = startOfMonth(now);
    to = endOfMonth(now);
  } else if (period === "anual") {
    from = startOfYear(now);
    to = endOfYear(now);
  }

  const members = await prisma.memberProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      pointEntries: from
        ? { where: { occurredAt: { gte: from, lte: to! } } }
        : true,
      subscription: true,
    },
  });

  const excluded = new Set<string>();
  for (const m of members) {
    if (
      m.subscription?.status === "BLOCKED" ||
      m.subscription?.status === "PAST_DUE"
    ) {
      // Negative rule: overdue > 30 days removes from dispute
      if (
        m.subscription.overdueSince &&
        Date.now() - m.subscription.overdueSince.getTime() > 30 * 86400000
      ) {
        excluded.add(m.id);
      }
    }
  }

  const rows = members
    .filter((m) => !excluded.has(m.id))
    .map((m) => {
      const pontos = m.pointEntries.reduce((s, e) => s + e.pontos, 0);
      return {
        id: m.id,
        userId: m.userId,
        nome: m.user.name ?? m.empresa,
        empresa: m.empresa,
        especialidade: m.especialidade,
        cidade: m.cidade,
        categoria: m.categoria,
        fotoUrl: m.fotoUrl ?? m.user.image,
        pontos,
        whatsapp: m.whatsapp,
        instagram: m.instagram,
        linkedin: m.linkedin,
        site: m.site,
        telefone: m.telefone,
        youtube: m.youtube,
        descricao: m.descricao,
        endereco: m.endereco,
        email: m.user.email,
      };
    })
    .sort((a, b) => b.pontos - a.pontos)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return rows;
}

export async function memberPointsTotal(memberId: string) {
  const agg = await prisma.pointEntry.aggregate({
    where: { memberId },
    _sum: { pontos: true },
  });
  return agg._sum.pontos ?? 0;
}
