import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = (await req.json()) as {
    token?: string;
    password?: string;
  };
  if (!token || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Token e senha (mín. 8) são obrigatórios" },
      { status: 400 },
    );
  }

  const row = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!row || row.expires < new Date()) {
    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: row.email },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ ok: true });
}
