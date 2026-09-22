import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const [categories, counts] = await Promise.all([
    prisma.category.findMany(),
    prisma.memberProfile.groupBy({ by: ["categoria"], _count: true }),
  ]);

  const rows = categories.map((c) => ({
    ...c,
    total: counts.find((x) => x.categoria === c.nome)?._count ?? 0,
  }));

  return jsonOk({ categories: rows });
}

export async function PATCH(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    id: string;
    descricao?: string;
    entradaLabel?: string;
    entradaCents?: number;
  };
  if (!body.id) return jsonError("id obrigatório");

  const cat = await prisma.category.update({
    where: { id: body.id },
    data: {
      descricao: body.descricao,
      entradaLabel: body.entradaLabel,
      entradaCents: body.entradaCents,
    },
  });
  return jsonOk({ category: cat });
}
