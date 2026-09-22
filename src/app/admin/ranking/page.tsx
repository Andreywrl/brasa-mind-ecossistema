"use client";

import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";
import { formatPoints } from "@/lib/utils";

type Rank = {
  rank: { nome: string; empresa: string; pontos: number; rank: number }[];
  rules: { label: string; pontos: number }[];
  negatives: { texto: string }[];
};

export default function AdminRankingPage() {
  const { data, isLoading } = useApiQuery<Rank>(
    ["admin", "ranking"],
    "/api/admin/ranking",
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display text-2xl font-extrabold">Ranking</h1>
      {isLoading || !data ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <Card className="p-5">
            <ul className="space-y-2">
              {data.rank.map((r) => (
                <li key={r.rank} className="flex justify-between text-sm">
                  <span>
                    {r.rank}º {r.nome} · {r.empresa}
                  </span>
                  <span className="font-mono">{formatPoints(r.pontos)}</span>
                </li>
              ))}
            </ul>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-5 space-y-2">
              <h2 className="font-display font-extrabold">Regras</h2>
              {data.rules.map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{r.label}</span>
                  <span className="font-mono">+{r.pontos}</span>
                </div>
              ))}
            </Card>
            <Card className="p-5 space-y-2">
              <h2 className="font-display font-extrabold">Fora da disputa</h2>
              {data.negatives.map((n, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  · {n.texto}
                </p>
              ))}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
