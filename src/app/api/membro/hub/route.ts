import { jsonOk, requireSession } from "@/lib/api";
import { rankingForPeriod } from "@/lib/ranking";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const result = await requireSession(["MEMBRO", "ADMIN"]);
  if (!result.ok) return result.error;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const cat = searchParams.get("cat");
  const especialidade = searchParams.get("especialidade");
  const cidade = searchParams.get("cidade");

  const rank = await rankingForPeriod("geral");
  let members = rank;

  if (cat && cat !== "todos") {
    const map: Record<string, string> = {
      fundadores: "FUNDADOR",
      patrocinadores: "PATROCINADOR",
      membros: "MEMBRO",
    };
    const c = map[cat] ?? cat.toUpperCase();
    members = members.filter((m) => m.categoria === c);
  }
  if (q) {
    members = members.filter(
      (m) =>
        m.nome.toLowerCase().includes(q) ||
        m.empresa.toLowerCase().includes(q) ||
        (m.especialidade ?? "").toLowerCase().includes(q),
    );
  }
  if (especialidade) {
    members = members.filter((m) => m.especialidade === especialidade);
  }
  if (cidade) {
    members = members.filter((m) => m.cidade === cidade);
  }

  // Sort by category then points
  const catOrder = { FUNDADOR: 0, PATROCINADOR: 1, MEMBRO: 2 } as const;
  members = [...members].sort((a, b) => {
    const ca = catOrder[a.categoria as keyof typeof catOrder] ?? 9;
    const cb = catOrder[b.categoria as keyof typeof catOrder] ?? 9;
    if (ca !== cb) return ca - cb;
    return b.pontos - a.pontos;
  });

  const all = await prisma.memberProfile.findMany({
    select: { especialidade: true, cidade: true },
  });
  const especialidades = [
    ...new Set(all.map((a) => a.especialidade).filter(Boolean)),
  ] as string[];
  const cidades = [...new Set(all.map((a) => a.cidade).filter(Boolean))] as string[];

  const activeOffers = await prisma.offer.findMany({
    where: { ativo: true },
    orderBy: { updatedAt: "desc" },
    include: {
      member: { include: { user: { select: { name: true, image: true } } } },
    },
  });

  return jsonOk({
    members,
    especialidades,
    cidades,
    offer: activeOffers[0] ?? null,
    activeOffers,
    total: members.length,
  });
}
