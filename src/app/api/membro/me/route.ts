import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { memberPointsTotal, rankingForPeriod } from "@/lib/ranking";

export async function GET() {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { session, profile } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const pontos = await memberPointsTotal(profile.id);
  const rank = await rankingForPeriod("geral");
  const myRank = rank.find((r) => r.id === profile.id)?.rank ?? null;

  return jsonOk({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
    profile: {
      ...profile,
      pontos,
      rank: myRank,
    },
  });
}
