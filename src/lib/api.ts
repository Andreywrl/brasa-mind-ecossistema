import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Role, MemberProfile, Subscription } from "@prisma/client";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

export type MemberWithSub = MemberProfile & {
  subscription: Subscription | null;
};

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireSession(
  roles?: Role[],
): Promise<
  { ok: true; session: Session } | { ok: false; error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: jsonError("Não autenticado", 401) };
  }
  if (roles && !roles.includes(session.user.role)) {
    return { ok: false, error: jsonError("Sem permissão", 403) };
  }
  return { ok: true, session };
}

export async function requireMember(): Promise<
  | { ok: true; session: Session; profile: MemberWithSub }
  | { ok: false; error: NextResponse }
> {
  const result = await requireSession(["MEMBRO", "ADMIN"]);
  if (!result.ok) return result;

  const profile = await prisma.memberProfile.findUnique({
    where: { userId: result.session.user.id },
    include: { subscription: true },
  });

  if (!profile) {
    return { ok: false, error: jsonError("Perfil não encontrado", 404) };
  }

  return { ok: true, session: result.session, profile };
}
