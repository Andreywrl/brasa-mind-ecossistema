import { jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export async function GET() {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const invoices = await prisma.invoice.findMany({
    orderBy: { dueDate: "desc" },
    take: 100,
    include: {
      member: { include: { user: { select: { name: true } } } },
      guest: true,
    },
  });

  const pending = invoices.filter((i) =>
    ["PENDING", "OVERDUE"].includes(i.status),
  );

  const mrr =
    (await prisma.subscription.count({ where: { status: "ACTIVE" } })) * 9700;

  return jsonOk({
    kpis: {
      mrr: formatCurrency(mrr),
      pendencias: pending.length,
    },
    transactions: invoices.map((i) => ({
      id: i.id,
      nome: i.member?.user.name ?? i.guest?.nome ?? "—",
      tipo:
        i.kind === "MEMBERSHIP"
          ? "Mensalidade"
          : i.kind === "GUEST_TICKET"
            ? "Ingresso convidado"
            : "Ingresso evento",
      data: i.dueDate,
      valor: formatCurrency(i.amountCents),
      status: i.status,
    })),
  });
}
