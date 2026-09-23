import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const result = await requireMember();
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    id?: string;
    type?: "view" | "click";
  };

  if (!body.id || (body.type !== "view" && body.type !== "click")) {
    return jsonError("Dados inválidos", 400);
  }

  const offer = await prisma.offer.findFirst({
    where: { id: body.id, ativo: true },
  });
  if (!offer) return jsonError("Oferta não encontrada", 404);

  const updated = await prisma.offer.update({
    where: { id: offer.id },
    data:
      body.type === "view"
        ? { views: { increment: 1 } }
        : { clicks: { increment: 1 } },
  });

  return jsonOk({
    id: updated.id,
    views: updated.views,
    clicks: updated.clicks,
  });
}
