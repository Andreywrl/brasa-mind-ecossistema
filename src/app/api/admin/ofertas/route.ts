import { jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      member: { include: { user: { select: { name: true, image: true } } } },
    },
  });

  return jsonOk({
    offers,
    totals: {
      count: offers.length,
      ativas: offers.filter((o) => o.ativo).length,
      views: offers.reduce((s, o) => s + o.views, 0),
      clicks: offers.reduce((s, o) => s + o.clicks, 0),
    },
  });
}
