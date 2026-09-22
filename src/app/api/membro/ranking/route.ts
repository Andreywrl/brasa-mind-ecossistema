import { jsonOk, requireSession } from "@/lib/api";
import { rankingForPeriod, type RankPeriod } from "@/lib/ranking";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const result = await requireSession(["MEMBRO", "ADMIN"]);
  if (!result.ok) return result.error;

  const period = (new URL(req.url).searchParams.get("period") ??
    "geral") as RankPeriod;

  const [rank, rules, negatives, prizes, achievements] = await Promise.all([
    rankingForPeriod(period),
    prisma.pointRule.findMany({ where: { active: true } }),
    prisma.negativeRule.findMany({ orderBy: { order: "asc" } }),
    prisma.prize.findMany({ orderBy: { order: "asc" } }),
    prisma.achievement.findMany(),
  ]);

  return jsonOk({
    period,
    rank,
    rules,
    negatives,
    prizes,
    achievements,
  });
}
