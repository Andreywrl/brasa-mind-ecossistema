import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";
import { memberPointsTotal } from "@/lib/ranking";
import { formatCurrency } from "@/lib/utils";

export async function GET() {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const members = await prisma.memberProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      subscription: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const rows = await Promise.all(
    members.map(async (m) => {
      const pontos = await memberPointsTotal(m.id);
      return {
        id: m.id,
        userId: m.userId,
        nome: m.user.name,
        email: m.user.email,
        empresa: m.empresa,
        categoria: m.categoria,
        cidade: m.cidade,
        especialidade: m.especialidade,
        fotoUrl: m.fotoUrl ?? m.user.image,
        whatsapp: m.whatsapp,
        telefone: m.telefone,
        instagram: m.instagram,
        linkedin: m.linkedin,
        site: m.site,
        endereco: m.endereco,
        youtube: m.youtube,
        descricao: m.descricao,
        pontos,
        mensalidade: formatCurrency(m.subscription?.amountCents ?? 9700),
        status: m.subscription?.status ?? "PENDING",
      };
    }),
  );

  return jsonOk({ members: rows, total: rows.length });
}

export async function POST(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  // Admin creates membership invite link instead of creating member directly
  return jsonError("Use /api/admin/membership-invites para gerar link de cadastro");
}
