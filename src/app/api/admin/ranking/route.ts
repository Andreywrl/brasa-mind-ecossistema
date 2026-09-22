import { jsonOk, requireSession } from "@/lib/api";
import { rankingForPeriod } from "@/lib/ranking";
import { prisma } from "@/lib/db";

export async function GET() {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const [rank, rules, negatives, prizes] = await Promise.all([
    rankingForPeriod("geral"),
    prisma.pointRule.findMany(),
    prisma.negativeRule.findMany({ orderBy: { order: "asc" } }),
    prisma.prize.findMany({ orderBy: { order: "asc" } }),
  ]);

  return jsonOk({ rank, rules, negatives, prizes });
}

export async function PATCH(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    rules?: { id: string; pontos: number; label: string }[];
    negatives?: { id?: string; texto: string }[];
  };

  if (body.rules) {
    for (const r of body.rules) {
      await prisma.pointRule.update({
        where: { id: r.id },
        data: { pontos: r.pontos, label: r.label },
      });
    }
  }

  if (body.negatives) {
    await prisma.negativeRule.deleteMany();
    await prisma.negativeRule.createMany({
      data: body.negatives.map((n, i) => ({ texto: n.texto, order: i })),
    });
  }

  return jsonOk({ ok: true });
}
