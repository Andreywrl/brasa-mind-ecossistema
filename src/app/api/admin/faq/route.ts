import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";
import type { FaqCategory } from "@prisma/client";

export async function POST(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    category: FaqCategory;
    question: string;
    answer: string;
    order?: number;
  };

  if (!body.question || !body.answer || !body.category) {
    return jsonError("Categoria, pergunta e resposta obrigatórias");
  }

  const faq = await prisma.faq.create({
    data: {
      category: body.category,
      question: body.question,
      answer: body.answer,
      order: body.order ?? 0,
    },
  });
  return jsonOk({ faq });
}

export async function PATCH(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    id: string;
    category?: FaqCategory;
    question?: string;
    answer?: string;
    order?: number;
    active?: boolean;
  };
  if (!body.id) return jsonError("id obrigatório");

  const faq = await prisma.faq.update({
    where: { id: body.id },
    data: {
      category: body.category,
      question: body.question,
      answer: body.answer,
      order: body.order,
      active: body.active,
    },
  });
  return jsonOk({ faq });
}

export async function DELETE(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return jsonError("id obrigatório");
  await prisma.faq.delete({ where: { id } });
  return jsonOk({ ok: true });
}
