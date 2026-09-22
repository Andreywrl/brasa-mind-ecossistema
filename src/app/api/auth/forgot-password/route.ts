import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return ok to avoid email enumeration
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = nanoid(32);
  const expires = new Date(Date.now() + 1000 * 60 * 60);
  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendEmail({
    to: email,
    subject: "Recuperar senha · Brasamind",
    html: `<p>Olá,</p><p>Use este link para criar uma nova senha (válido por 1h):</p><p><a href="${base}/recuperar-senha?token=${token}">Redefinir senha</a></p>`,
  });

  return NextResponse.json({
    ok: true,
    // In local without email provider, expose token for testing
    ...(process.env.RESEND_API_KEY ? {} : { devToken: token }),
  });
}
