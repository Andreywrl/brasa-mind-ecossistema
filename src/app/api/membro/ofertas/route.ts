import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const canOffer =
    profile.categoria === "FUNDADOR" || profile.categoria === "PATROCINADOR";

  const mine = await prisma.offer.findMany({
    where: { memberId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  const active = await prisma.offer.findFirst({
    where: { ativo: true },
    include: {
      member: { include: { user: { select: { name: true, image: true } } } },
    },
  });

  return jsonOk({
    canOffer,
    mine,
    active,
    totals: {
      views: mine.reduce((s, o) => s + o.views, 0),
      clicks: mine.reduce((s, o) => s + o.clicks, 0),
      count: mine.length,
    },
  });
}

export async function POST(req: Request) {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  if (
    profile.categoria !== "FUNDADOR" &&
    profile.categoria !== "PATROCINADOR"
  ) {
    return jsonError("Só Fundador e Patrocinador cadastram ofertas", 403);
  }

  const count = await prisma.offer.count({ where: { memberId: profile.id } });
  if (count >= 3) return jsonError("Limite de 3 ofertas");

  const body = (await req.json()) as {
    titulo: string;
    tipoDestino: "WHATSAPP" | "SITE" | "HUB_PROFILE";
    destino: string;
    destRotulo?: string;
    bannerUrl?: string;
    ativo?: boolean;
  };

  if (body.ativo) {
    await prisma.offer.updateMany({
      where: { memberId: profile.id, ativo: true },
      data: { ativo: false },
    });
  }

  const offer = await prisma.offer.create({
    data: {
      memberId: profile.id,
      titulo: body.titulo,
      tipoDestino: body.tipoDestino,
      destino: body.destino,
      destRotulo: body.destRotulo,
      bannerUrl: body.bannerUrl,
      ativo: Boolean(body.ativo),
    },
  });

  return jsonOk({ offer });
}

export async function PATCH(req: Request) {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const body = (await req.json()) as {
    id: string;
    titulo?: string;
    tipoDestino?: "WHATSAPP" | "SITE" | "HUB_PROFILE";
    destino?: string;
    destRotulo?: string;
    bannerUrl?: string;
    ativo?: boolean;
  };

  const offer = await prisma.offer.findFirst({
    where: { id: body.id, memberId: profile.id },
  });
  if (!offer) return jsonError("Oferta não encontrada", 404);

  if (body.ativo) {
    await prisma.offer.updateMany({
      where: { memberId: profile.id, ativo: true },
      data: { ativo: false },
    });
  }

  const updated = await prisma.offer.update({
    where: { id: offer.id },
    data: {
      titulo: body.titulo ?? offer.titulo,
      tipoDestino: body.tipoDestino ?? offer.tipoDestino,
      destino: body.destino ?? offer.destino,
      destRotulo: body.destRotulo ?? offer.destRotulo,
      bannerUrl: body.bannerUrl ?? offer.bannerUrl,
      ativo: body.ativo ?? offer.ativo,
    },
  });

  return jsonOk({ offer: updated });
}
