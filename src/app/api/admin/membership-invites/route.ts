import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import type { MemberCategory } from "@prisma/client";

export async function GET() {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const invites = await prisma.membershipInvite.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true, email: true } } },
  });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return jsonOk({
    invites: invites.map((i) => ({
      ...i,
      link: `${base}/quero-ser-membro/${i.token}`,
    })),
  });
}

export async function POST(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;
  const { session } = result;

  const body = (await req.json()) as {
    categoria?: MemberCategory;
    maxUses?: number;
    expiresAt?: string;
  };

  const invite = await prisma.membershipInvite.create({
    data: {
      token: nanoid(20),
      createdById: session!.user.id,
      categoria: body.categoria ?? "MEMBRO",
      maxUses: body.maxUses ?? 1,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      active: true,
    },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return jsonOk({
    invite: {
      ...invite,
      link: `${base}/quero-ser-membro/${invite.token}`,
    },
  });
}

export async function PATCH(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as { id: string; active?: boolean };
  if (!body.id) return jsonError("id obrigatório");

  const invite = await prisma.membershipInvite.update({
    where: { id: body.id },
    data: { active: body.active },
  });
  return jsonOk({ invite });
}
