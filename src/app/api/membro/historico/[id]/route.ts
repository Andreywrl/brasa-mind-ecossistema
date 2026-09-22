import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { prisma } from "@/lib/db";
import { mapsEmbedUrl } from "@/lib/checkin";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const { id } = await ctx.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        where: {
          OR: [
            { memberId: profile.id },
            {
              guest: { invite: { hostId: profile.id } },
            },
          ],
        },
        include: {
          guest: true,
          member: { include: { user: { select: { name: true } } } },
        },
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

  if (!event) return jsonError("Evento não encontrado", 404);

  const myReg = event.registrations.find((r) => r.memberId === profile.id);
  const myGuests = event.registrations
    .filter((r) => r.guestId)
    .map((r) => ({
      id: r.id,
      nome: r.guest?.nome ?? "—",
      empresa: r.guest?.empresa,
      status: r.status,
    }));

  const present =
    myReg?.status === "CHECKED_IN" ||
    (myReg?.status === "CONFIRMED" && event.data < new Date());

  return jsonOk({
    event: {
      id: event.id,
      nome: event.nome,
      data: event.data,
      hora: event.hora,
      local: event.local,
      localShort: event.localShort,
      descricao: event.descricao,
      palestrante: event.palestrante,
      palestranteBio: event.palestranteBio,
      capaUrl: event.capaUrl,
      cronograma: event.cronograma,
      confirmedCount: event._count.registrations,
      mapsUrl: mapsEmbedUrl(event.local),
    },
    registration: myReg
      ? {
          id: myReg.id,
          status: myReg.status,
          checkinAt: myReg.checkinAt,
          ticketCents: myReg.ticketCents,
          label: !myReg
            ? "Não inscrito"
            : myReg.status === "NO_SHOW"
              ? "Faltou"
              : present || myReg.status === "CHECKED_IN"
                ? "Presente"
                : myReg.status === "CANCELED"
                  ? "Cancelado"
                  : "Confirmado",
        }
      : null,
    guests: myGuests,
  });
}
