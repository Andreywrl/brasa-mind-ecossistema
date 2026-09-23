import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { zodErrorMessage } from "@/lib/br";

const reviewSchema = z.object({
  stars: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;
  const { id: eventId } = await ctx.params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return jsonError("Evento não encontrado", 404);
  if (event.ativo) {
    return jsonError("Só é possível avaliar eventos anteriores");
  }

  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));

  const review = await prisma.eventReview.upsert({
    where: { eventId },
    create: {
      eventId,
      stars: parsed.data.stars,
      comment: parsed.data.comment || null,
      authorId: result.session.user.id,
    },
    update: {
      stars: parsed.data.stars,
      comment: parsed.data.comment || null,
      authorId: result.session.user.id,
    },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  return jsonOk({ review });
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
