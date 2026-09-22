import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

export async function GET() {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const event = await prisma.event.findFirst({ where: { ativo: true } });
  if (!event) return jsonOk({ event: null, invite: null, guests: [], stats: null });

  let invite = await prisma.invite.findFirst({
    where: { eventId: event.id, hostId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  if (!invite) {
    invite = await prisma.invite.create({
      data: {
        token: nanoid(16),
        eventId: event.id,
        hostId: profile.id,
        message: `Fala! Estou te chamando para o próximo encontro do Brasamind: "${event.nome}", dia ${event.data.toLocaleDateString("pt-BR")} às ${event.hora}, em ${event.localShort ?? event.local}.`,
      },
    });
  }

  const guests = await prisma.guest.findMany({
    where: { inviteId: invite.id },
    include: {
      registrations: {
        where: { eventId: event.id },
        include: { invoice: true },
      },
    },
  });

  const confirmed = guests.filter((g) =>
    g.registrations.some((r) =>
      ["CONFIRMED", "CHECKED_IN"].includes(r.status),
    ),
  ).length;

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return jsonOk({
    event,
    invite: {
      ...invite,
      link: `${base}/convite/${invite.token}`,
    },
    guests,
    stats: {
      enviados: guests.length,
      confirmados: confirmed,
    },
  });
}

export async function PATCH(req: Request) {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const { message } = (await req.json()) as { message?: string };
  const event = await prisma.event.findFirst({ where: { ativo: true } });
  if (!event) return jsonError("Sem evento ativo");

  const invite = await prisma.invite.findFirst({
    where: { eventId: event.id, hostId: profile.id },
  });
  if (!invite) return jsonError("Convite não encontrado", 404);

  const updated = await prisma.invite.update({
    where: { id: invite.id },
    data: { message },
  });
  return jsonOk({ invite: updated });
}
