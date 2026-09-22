import { jsonError, jsonOk, requireSession } from "@/lib/api";
import { prisma } from "@/lib/db";
import type { LegalDocType } from "@prisma/client";

export async function GET() {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const docs = await prisma.legalDocument.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { consents: true } } },
  });

  return jsonOk({ docs });
}

export async function POST(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    type: LegalDocType;
    nome: string;
    versao: string;
    resumo?: string;
    conteudo: string;
    published?: boolean;
  };

  if (!body.type || !body.nome || !body.versao || !body.conteudo) {
    return jsonError("Campos obrigatórios ausentes");
  }

  const doc = await prisma.legalDocument.create({
    data: {
      type: body.type,
      nome: body.nome,
      versao: body.versao,
      resumo: body.resumo,
      conteudo: body.conteudo,
      published: Boolean(body.published),
      publishedAt: body.published ? new Date() : null,
    },
  });

  return jsonOk({ doc });
}

export async function PATCH(req: Request) {
  const result = await requireSession(["ADMIN"]);
  if (!result.ok) return result.error;

  const body = (await req.json()) as {
    id: string;
    nome?: string;
    versao?: string;
    resumo?: string;
    conteudo?: string;
    published?: boolean;
  };
  if (!body.id) return jsonError("id obrigatório");

  const doc = await prisma.legalDocument.update({
    where: { id: body.id },
    data: {
      nome: body.nome,
      versao: body.versao,
      resumo: body.resumo,
      conteudo: body.conteudo,
      published: body.published,
      publishedAt: body.published ? new Date() : undefined,
    },
  });

  return jsonOk({ doc });
}
