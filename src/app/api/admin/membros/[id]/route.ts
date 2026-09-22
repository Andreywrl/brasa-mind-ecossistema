import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";
import { formatCurrency, formatPoints } from "@/lib/utils";
import { memberPointsTotal, rankingForPeriod } from "@/lib/ranking";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;
  const { id } = await ctx.params;

  const member = await prisma.memberProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
      subscription: true,
      achievements: { include: { achievement: true } },
      pointEntries: { orderBy: { occurredAt: "desc" }, take: 12 },
      invoices: { orderBy: { dueDate: "desc" }, take: 8 },
      registrations: {
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { event: { select: { id: true, nome: true, data: true } } },
      },
      invitesSent: {
        include: {
          event: { select: { nome: true } },
          guests: { select: { id: true, nome: true, empresa: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!member) return jsonError("Membro não encontrado", 404);

  const [pontos, rank] = await Promise.all([
    memberPointsTotal(member.id),
    rankingForPeriod("geral"),
  ]);
  const myRank = rank.find((r) => r.id === member.id);

  return jsonOk({
    member: {
      id: member.id,
      nome: member.user.name,
      email: member.user.email,
      empresa: member.empresa,
      categoria: member.categoria,
      cidade: member.cidade,
      especialidade: member.especialidade,
      fotoUrl: member.fotoUrl ?? member.user.image,
      capaUrl: member.capaUrl,
      whatsapp: member.whatsapp,
      telefone: member.telefone,
      instagram: member.instagram,
      linkedin: member.linkedin,
      site: member.site,
      endereco: member.endereco,
      youtube: member.youtube,
      descricao: member.descricao,
      cnpj: member.cnpj,
      cep: member.cep,
      addressNumber: member.addressNumber,
      addressComplement: member.addressComplement,
      bairro: member.bairro,
      cardLast4: member.cardLast4,
      cardBrand: member.cardBrand,
      pontos,
      rank: myRank?.rank ?? null,
      mensalidade: formatCurrency(member.subscription?.amountCents ?? 9700),
      status: member.subscription?.status ?? "PENDING",
      nextDue: member.subscription?.nextDueDate,
      memberSince: member.user.createdAt,
      achievements: member.achievements.map((a) => ({
        code: a.achievement.code,
        nome: a.achievement.nome,
        earnedAt: a.earnedAt,
      })),
      pointEntries: member.pointEntries.map((p) => ({
        id: p.id,
        action: p.action,
        pontos: p.pontos,
        note: p.note,
        occurredAt: p.occurredAt,
        label: `${p.pontos > 0 ? "+" : ""}${formatPoints(p.pontos)}`,
      })),
      invoices: member.invoices.map((i) => ({
        id: i.id,
        kind: i.kind,
        status: i.status,
        valor: formatCurrency(i.amountCents),
        dueDate: i.dueDate,
        paidAt: i.paidAt,
      })),
      registrations: member.registrations.map((r) => ({
        id: r.id,
        status: r.status,
        eventNome: r.event.nome,
        eventData: r.event.data,
        checkinAt: r.checkinAt,
      })),
      guests: member.invitesSent.flatMap((inv) =>
        inv.guests.map((g) => ({
          id: g.id,
          nome: g.nome,
          empresa: g.empresa,
          eventNome: inv.event.nome,
        })),
      ),
    },
  });
}
