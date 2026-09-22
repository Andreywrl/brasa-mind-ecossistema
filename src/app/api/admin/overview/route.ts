import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { rankingForPeriod } from "@/lib/ranking";

export async function GET() {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const [
    memberCount,
    activeSubs,
    pendingInvoices,
    event,
    rank,
    invoicesPaidMonth,
  ] = await Promise.all([
    prisma.memberProfile.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.invoice.count({ where: { status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.event.findFirst({
      where: { ativo: true },
      include: { _count: { select: { registrations: true } } },
    }),
    rankingForPeriod("geral"),
    prisma.invoice.findMany({
      where: {
        status: "PAID",
        kind: "MEMBERSHIP",
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  const byCat = await prisma.memberProfile.groupBy({
    by: ["categoria"],
    _count: true,
  });

  const mrr = activeSubs * 9700;
  const eventRevenue = await prisma.invoice.aggregate({
    where: {
      status: "PAID",
      kind: { in: ["EVENT_TICKET", "GUEST_TICKET"] },
    },
    _sum: { amountCents: true },
  });

  return jsonOk({
    kpis: [
      { label: "Membros", value: String(memberCount) },
      { label: "Ativos", value: String(activeSubs) },
      { label: "MRR", value: formatCurrency(mrr) },
      {
        label: "Receita eventos",
        value: formatCurrency(eventRevenue._sum.amountCents ?? 0),
      },
      {
        label: "Participantes (ativo)",
        value: String(event?._count.registrations ?? 0),
      },
      { label: "Pendências", value: String(pendingInvoices) },
    ],
    byCategory: byCat.map((c) => ({
      categoria: c.categoria,
      total: c._count,
    })),
    topPont: rank.slice(0, 4).map((r, i) => ({
      pos: String(i + 1),
      nome: r.nome,
      val: r.pontos.toLocaleString("pt-BR"),
    })),
    event,
    paidThisMonth: invoicesPaidMonth.length,
  });
}
