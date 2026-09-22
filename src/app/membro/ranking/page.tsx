"use client";

import { useState } from "react";
import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { formatPoints, initials } from "@/lib/utils";

type RankingData = {
  period: string;
  rank: {
    id: string;
    nome: string;
    empresa: string;
    pontos: number;
    fotoUrl: string | null;
    rank: number;
    categoria: string;
  }[];
  rules: { label: string; pontos: number }[];
  negatives: { texto: string }[];
  prizes: { kind: string; pos: string | null; titulo: string; detalhe: string }[];
};

export default function RankingPage() {
  const [period, setPeriod] = useState<"mensal" | "anual" | "geral">("geral");
  const { data, isLoading } = useApiQuery<RankingData>(
    ["membro", "ranking", period],
    `/api/membro/ranking?period=${period}`,
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Ranking</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Mensal, anual e geral usam o livro de pontos com data.
        </p>
      </div>

      <div className="flex gap-2">
        {(["mensal", "geral", "anual"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border border-border capitalize ${
              period === p ? "bg-secondary" : "text-muted-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {isLoading || !data ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : (
        <>
          <Card className="p-4">
            <ul className="space-y-3">
              {data.rank.map((r) => (
                <li key={r.id} className="flex items-center gap-3">
                  <span className="font-mono w-8 text-sm">{r.rank}º</span>
                  {r.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.fotoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                      {initials(r.nome)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{r.nome}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {r.empresa}
                    </div>
                  </div>
                  <Badge variant="secondary">{r.categoria}</Badge>
                  <span className="font-mono text-sm">{formatPoints(r.pontos)}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-5 space-y-2">
              <h3 className="font-display font-extrabold">O que pontua</h3>
              {data.rules.map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{r.label}</span>
                  <span className="font-mono">+{r.pontos}</span>
                </div>
              ))}
            </Card>
            <Card className="p-5 space-y-2">
              <h3 className="font-display font-extrabold">
                O que tira da disputa
              </h3>
              {data.negatives.map((n, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  · {n.texto}
                </p>
              ))}
            </Card>
          </div>

          <Card className="p-5 space-y-3">
            <h3 className="font-display font-extrabold">Prêmios</h3>
            {data.prizes.map((p, i) => (
              <div key={i} className="text-sm">
                <span className="font-semibold">
                  {p.pos ? `${p.pos} · ` : ""}
                  {p.titulo}
                </span>
                <p className="text-muted-foreground">{p.detalhe}</p>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
