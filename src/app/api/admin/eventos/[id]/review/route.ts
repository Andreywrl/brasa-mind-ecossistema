import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function PATCH() {
  return jsonError("A nota do evento é dada pelo membro, não pelo admin", 403);
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;
  const { id: eventId } = await ctx.params;

  const review = await prisma.eventReview.findUnique({
    where: { eventId },
    include: { author: { select: { name: true, email: true } } },
  });

  return jsonOk({ review });
}
