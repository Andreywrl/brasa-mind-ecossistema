"use client";

import Link from "next/link";
import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";

type Doc = {
  docs: {
    nome: string;
    versao: string;
    publishedAt: string | null;
    conteudo: string;
    type: string;
  }[];
};

export default function TermosPage() {
  const { data, isLoading } = useApiQuery<Doc>(["legal"], "/api/legal");
  const doc = data?.docs?.find((d) => d.type === "TERMS");

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/" className="text-sm font-semibold text-muted-foreground">
        ← Voltar
      </Link>
      <Card className="p-8 space-y-4">
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : (
          <>
            <h1 className="font-display text-2xl font-extrabold">
              {doc?.nome ?? "Termos de Uso"}
            </h1>
            {doc && (
              <p className="text-xs text-muted-foreground">
                {doc.versao}
                {doc.publishedAt
                  ? ` · desde ${new Date(doc.publishedAt).toLocaleDateString("pt-BR")}`
                  : ""}
              </p>
            )}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {doc?.conteudo ??
                "Documento ainda não publicado ou banco indisponível."}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
