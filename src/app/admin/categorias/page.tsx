"use client";

import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type Cats = {
  categories: {
    id: string;
    nome: string;
    descricao: string;
    entradaLabel: string;
    entradaCents: number;
    total: number;
  }[];
};

export default function AdminCategoriasPage() {
  const { data, isLoading } = useApiQuery<Cats>(
    ["admin", "categorias"],
    "/api/admin/categorias",
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold">Categorias</h1>
      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {data.categories.map((c) => (
            <Card key={c.id} className="p-5 space-y-2">
              <div className="flex justify-between gap-3">
                <h2 className="font-display font-extrabold">{c.nome}</h2>
                <span className="font-mono text-sm">{c.total} membros</span>
              </div>
              <p className="text-sm text-muted-foreground">{c.descricao}</p>
              <p className="text-sm">
                Entrada no evento:{" "}
                <span className="font-mono font-semibold">
                  {c.entradaCents === 0
                    ? "Cortesia"
                    : formatCurrency(c.entradaCents)}
                </span>{" "}
                ({c.entradaLabel})
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
