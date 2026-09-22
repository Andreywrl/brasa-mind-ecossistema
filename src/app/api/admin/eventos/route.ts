import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export async function GET() {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const [active, past] = await Promise.all([
    prisma.event.findFirst({
      where: { ativo: true },
      include: {
        prices: true,
        _count: { select: { registrations: true } },
        registrations: {
          include: {
            member: { include: { user: { select: { name: true, image: true } } } },
            guest: true,
            invoice: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.event.findMany({
      where: { ativo: false },
      orderBy: { data: "desc" },
      include: {
        prices: true,
        _count: { select: { registrations: true } },
      },
    }),
  ]);

  return jsonOk({ active, past });
}

export async function POST(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    nome: string;
    data: string;
    hora: string;
    local: string;
    localShort?: string;
    descricao?: string;
    palestrante?: string;
    palestranteBio?: string;
    capaUrl?: string;
    vagas?: number;
    ativo?: boolean;
    cronograma?: { hora: string; item: string }[];
  };

  if (!body.nome || !body.data || !body.hora || !body.local) {
    return jsonError("Nome, data, hora e local são obrigatórios");
  }

  if (body.ativo) {
    await prisma.event.updateMany({ data: { ativo: false } });
  }

  const event = await prisma.event.create({
    data: {
      nome: body.nome,
      data: new Date(body.data),
      hora: body.hora,
      local: body.local,
      localShort: body.localShort,
      descricao: body.descricao,
      palestrante: body.palestrante,
      palestranteBio: body.palestranteBio,
      capaUrl: body.capaUrl,
      vagas: body.vagas ?? 120,
      ativo: Boolean(body.ativo),
      cronograma: body.cronograma ?? [],
      prices: {
        create: [
          { tier: "FUNDADOR", amountCents: 0, label: "Fundador" },
          { tier: "PATROCINADOR", amountCents: 10000, label: "Patrocinador" },
          { tier: "MEMBRO", amountCents: 18000, label: "Membro" },
          { tier: "CONVIDADO", amountCents: 20000, label: "Convidado" },
        ],
      },
    },
    include: { prices: true },
  });

  return jsonOk({ event });
}

export async function PATCH(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    id: string;
    nome?: string;
    data?: string;
    hora?: string;
    local?: string;
    localShort?: string;
    descricao?: string;
    palestrante?: string;
    palestranteBio?: string;
    capaUrl?: string;
    vagas?: number;
    ativo?: boolean;
    cronograma?: { hora: string; item: string }[];
  };

  if (!body.id) return jsonError("id obrigatório");

  if (body.ativo) {
    await prisma.event.updateMany({
      where: { id: { not: body.id } },
      data: { ativo: false },
    });
  }

  const event = await prisma.event.update({
    where: { id: body.id },
    data: {
      nome: body.nome,
      data: body.data ? new Date(body.data) : undefined,
      hora: body.hora,
      local: body.local,
      localShort: body.localShort,
      descricao: body.descricao,
      palestrante: body.palestrante,
      palestranteBio: body.palestranteBio,
      capaUrl: body.capaUrl,
      vagas: body.vagas,
      ativo: body.ativo,
      cronograma: body.cronograma,
    },
    include: { prices: true },
  });

  return jsonOk({ event });
}
