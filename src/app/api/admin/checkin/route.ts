import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";

async function attachHosts(
  results: {
    id: string;
    hostName: string | null;
  }[],
  registrations: { id: string; guestId: string | null }[],
) {
  for (const r of registrations) {
    if (!r.guestId) continue;
    const guest = await prisma.guest.findUnique({
      where: { id: r.guestId },
      include: {
        invite: {
          include: { host: { include: { user: { select: { name: true } } } } },
        },
      },
    });
    const row = results.find((x) => x.id === r.id);
    if (row && guest) row.hostName = guest.invite.host.user.name ?? null;
  }
}

function mapReg(r: {
  id: string;
  type: string;
  status: string;
  checkinAt: Date | null;
  checkinCode: string;
  member: {
    empresa: string;
    fotoUrl: string | null;
    user: { name: string | null; email: string; image: string | null };
  } | null;
  guest: { nome: string; empresa: string | null; email: string } | null;
}) {
  return {
    id: r.id,
    tipo: r.type,
    nome: r.member?.user.name ?? r.guest?.nome ?? "—",
    empresa: r.member?.empresa ?? r.guest?.empresa ?? "",
    email: r.member?.user.email ?? r.guest?.email ?? "",
    fotoUrl: r.member?.fotoUrl ?? r.member?.user.image,
    status: r.status,
    checkinAt: r.checkinAt,
    checkinCode: r.checkinCode,
    hostName: null as string | null,
  };
}

export async function GET(req: Request) {
  const result = await requireSession(["ADMIN", "PORTARIA"]);
  if (!result.ok) return result.error;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.toLowerCase() ?? "";
  const code = url.searchParams.get("code")?.trim().toUpperCase() ?? "";

  const event = await prisma.event.findFirst({
    where: { ativo: true },
    include: {
      registrations: {
        include: {
          member: {
            include: {
              user: { select: { name: true, email: true, image: true } },
            },
          },
          guest: true,
        },
      },
    },
  });

  if (!event) return jsonOk({ event: null, results: [] });

  let results = event.registrations.map(mapReg);
  await attachHosts(results, event.registrations);

  if (code) {
    results = results.filter((r) => r.checkinCode.toUpperCase() === code);
  } else if (q) {
    results = results.filter(
      (r) =>
        r.nome.toLowerCase().includes(q) ||
        r.empresa.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.checkinCode.toLowerCase().includes(q),
    );
  }

  return jsonOk({
    event: {
      id: event.id,
      nome: event.nome,
      data: event.data,
      hora: event.hora,
      local: event.local,
    },
    results,
  });
}

export async function POST(req: Request) {
  const result = await requireSession(["ADMIN", "PORTARIA"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    registrationId?: string;
    code?: string;
  };

  let registrationId = body.registrationId;
  if (!registrationId && body.code) {
    const byCode = await prisma.registration.findFirst({
      where: {
        checkinCode: body.code.trim().toUpperCase(),
        event: { ativo: true },
      },
    });
    if (!byCode) return jsonError("Código não encontrado neste evento", 404);
    registrationId = byCode.id;
  }

  if (!registrationId) return jsonError("registrationId ou code obrigatório");

  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      member: { include: { user: { select: { name: true } } } },
      guest: true,
      event: { select: { ativo: true, nome: true } },
    },
  });
  if (!reg) return jsonError("Inscrição não encontrada", 404);
  if (!reg.event.ativo) return jsonError("Evento não está ativo");
  if (reg.status === "CANCELED") return jsonError("Inscrição cancelada");
  if (reg.status === "PENDING_PAYMENT") {
    return jsonError("Pagamento pendente");
  }
  if (reg.status === "CHECKED_IN") {
    return jsonOk({
      registration: reg,
      already: true,
      message: "Check-in já registrado",
      nome: reg.member?.user.name ?? reg.guest?.nome,
    });
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: { status: "CHECKED_IN", checkinAt: new Date() },
  });

  if (reg.memberId && reg.type === "MEMBER") {
    const rule = await prisma.pointRule.findUnique({
      where: { action: "PRESENCA" },
    });
    await prisma.pointEntry.create({
      data: {
        memberId: reg.memberId,
        action: "PRESENCA",
        pontos: rule?.pontos ?? 90,
        note: "Check-in no evento",
        eventId: reg.eventId,
      },
    });
  }

  return jsonOk({
    registration: updated,
    nome: reg.member?.user.name ?? reg.guest?.nome,
    message: "Check-in confirmado",
  });
}
