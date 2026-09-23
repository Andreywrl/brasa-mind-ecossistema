import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const events = await prisma.event.findMany({
    where: { ativo: false },
    orderBy: { data: "desc" },
    include: {
      registrations: {
        where: { memberId: profile.id },
        take: 1,
      },
      _count: {
        select: {
          registrations: {
            where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } },
          },
        },
      },
    },
  });

  const eventIds = events.map((e) => e.id);
  const pointRows =
    eventIds.length === 0
      ? []
      : await prisma.pointEntry.groupBy({
          by: ["eventId"],
          where: {
            memberId: profile.id,
            eventId: { in: eventIds },
          },
          _sum: { pontos: true },
        });
  const pontosByEvent = new Map(
    pointRows.map((r) => [r.eventId ?? "", r._sum.pontos ?? 0]),
  );

  const rows = events.map((e) => {
    const reg = e.registrations[0];
    const present =
      reg?.status === "CHECKED_IN" ||
      (reg?.status === "CONFIRMED" && e.data < new Date());
    return {
      id: e.id,
      nome: e.nome,
      data: e.data,
      local: e.localShort ?? e.local,
      capaUrl: e.capaUrl,
      status: !reg
        ? "Não inscrito"
        : reg.status === "NO_SHOW"
          ? "Faltou"
          : present || reg.status === "CHECKED_IN"
            ? "Presente"
            : reg.status === "CANCELED"
              ? "Cancelado"
              : "Confirmado",
      badgeVar:
        !reg || reg.status === "NO_SHOW" || reg.status === "CANCELED"
          ? "destructive"
          : "success",
      participantes: e._count.registrations,
      pontos: pontosByEvent.get(e.id) ?? 0,
      checkinAt: reg?.checkinAt,
      ticketCents: reg?.ticketCents,
    };
  });

  return jsonOk({ events: rows });
}
