import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  const result = await requireSession(["MEMBRO", "ADMIN"]);
  if (!result.ok) return result.error;

  const notifications = await prisma.notification.findMany({
    where: { userId: result.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return jsonOk({
    notifications,
    unread: notifications.filter((n) => !n.read).length,
  });
}

export async function PATCH(req: Request) {
  const result = await requireSession(["MEMBRO", "ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as { id?: string; all?: boolean };
  if (body.all) {
    await prisma.notification.updateMany({
      where: { userId: result.session.user.id, read: false },
      data: { read: true },
    });
    return jsonOk({ ok: true });
  }
  if (!body.id) return jsonError("id obrigatório");

  const n = await prisma.notification.findFirst({
    where: { id: body.id, userId: result.session.user.id },
  });
  if (!n) return jsonError("Notificação não encontrada", 404);

  await prisma.notification.update({
    where: { id: n.id },
    data: { read: true },
  });
  return jsonOk({ ok: true });
}
