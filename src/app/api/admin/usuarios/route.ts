import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const [admins, door] = await Promise.all([
    prisma.user.findMany({
      where: { role: "ADMIN" },
      include: { adminPerms: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.doorAccess.findMany({
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { nome: true } },
      },
    }),
  ]);

  return jsonOk({ admins, door });
}

export async function POST(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    type: "admin" | "door";
    name: string;
    email: string;
    password: string;
    login?: string;
    eventId?: string;
    expiresAt?: string;
    perms?: {
      membros?: boolean;
      eventos?: boolean;
      financeiro?: boolean;
      ranking?: boolean;
      usuarios?: boolean;
      termos?: boolean;
    };
  };

  if (!body.name || !body.email || !body.password) {
    return jsonError("Nome, e-mail e senha obrigatórios");
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  if (body.type === "door") {
    if (!body.login) return jsonError("Login da portaria obrigatório");
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role: "PORTARIA",
        doorAccess: {
          create: {
            login: body.login,
            eventId: body.eventId,
            expiresAt: body.expiresAt
              ? new Date(body.expiresAt)
              : new Date(Date.now() + 86400000),
            active: true,
          },
        },
      },
      include: { doorAccess: true },
    });
    return jsonOk({ user });
  }

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      role: "ADMIN",
      adminPerms: {
        create: {
          membros: body.perms?.membros ?? true,
          eventos: body.perms?.eventos ?? true,
          financeiro: body.perms?.financeiro ?? false,
          ranking: body.perms?.ranking ?? true,
          usuarios: body.perms?.usuarios ?? false,
          termos: body.perms?.termos ?? false,
        },
      },
    },
    include: { adminPerms: true },
  });

  return jsonOk({ user });
}

export async function PATCH(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    userId: string;
    name?: string;
    email?: string;
    perms?: {
      membros?: boolean;
      eventos?: boolean;
      financeiro?: boolean;
      ranking?: boolean;
      usuarios?: boolean;
      termos?: boolean;
    };
    door?: { active?: boolean; expiresAt?: string; eventId?: string };
  };

  if (!body.userId) return jsonError("userId obrigatório");

  await prisma.user.update({
    where: { id: body.userId },
    data: {
      name: body.name,
      email: body.email,
    },
  });

  if (body.perms) {
    await prisma.adminPermission.upsert({
      where: { userId: body.userId },
      create: { userId: body.userId, ...body.perms },
      update: body.perms,
    });
  }

  if (body.door) {
    await prisma.doorAccess.update({
      where: { userId: body.userId },
      data: {
        active: body.door.active,
        expiresAt: body.door.expiresAt
          ? new Date(body.door.expiresAt)
          : undefined,
        eventId: body.door.eventId,
      },
    });
  }

  return jsonOk({ ok: true });
}
