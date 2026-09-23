"use client";

import Link from "next/link";
import { useState } from "react";
import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { formatPoints, cn } from "@/lib/utils";
import { RankingPodium } from "@/components/ranking-podium";
import { MemberAvatar } from "@/components/member-avatar";
import { labelCategory } from "@/lib/labels";

type RankingData = {
  period: string;
  rank: {
    id: string;
    nome: string;
    empresa: string;
    especialidade: string | null;
    cidade: string | null;
    pontos: number;
    fotoUrl: string | null;
    rank: number;
    categoria: string;
  }[];
  rules: { label: string; pontos: number }[];
  negatives: { texto: string }[];
  prizes: { kind: string; pos: string | null; titulo: string; detalhe: string }[];
  achievements: { id: string; nome: string; descricao: string }[];
};

export default function RankingPage() {
  const [period, setPeriod] = useState<"mensal" | "anual" | "geral">("geral");
  const { data, isLoading } = useApiQuery<RankingData>(
    ["membro", "ranking", period],
    `/api/membro/ranking?period=${period}`,
  );

  const year = new Date().getFullYear();
  const performancePrizes = data?.prizes.filter((p) => !p.pos) ?? [];
  const topPrizes = data?.prizes.filter((p) => p.pos) ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex gap-2">
        {(["mensal", "geral", "anual"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "om-chip px-[18px] py-2.5 rounded-lg text-[13px] font-semibold border border-border capitalize",
              period === p ? "bg-secondary text-foreground" : "text-muted-foreground",
            )}
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
          <Card className="overflow-hidden">
            <div className="p-[18px_22px] border-b border-border flex items-start gap-3.5">
              <span className="h-[46px] w-[46px] rounded-xl bg-secondary flex items-center justify-center shrink-0 text-primary font-impact">
                ★
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-extrabold">Prêmios do ano</h3>
                  <Badge variant="ember">Encerramento {year}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Quem performar bem o ano inteiro (presença, indicações e negócios fechados) leva
                  prêmio. O Top 3 do ranking anual também: cada um com um prêmio à parte.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-5">
              <div className="space-y-3">
                <div>
                  <h4 className="font-display font-extrabold">Performance do ano</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Não precisa ser o primeiro da lista. Quem conectar, indicar e fechar negócios
                    com consistência entra na disputa dos prêmios de performance.
                  </p>
                </div>
                {(performancePrizes.length
                  ? performancePrizes
                  : [
                      {
                        titulo: "Kit Brasamind no último encontro",
                        detalhe: "Reconhecimento para quem performou o ano todo.",
                      },
                      {
                        titulo: "Convite extra para um parceiro",
                        detalhe: "Leve alguém de confiança para o Brasamind.",
                      },
                    ]
                ).map((p, i) => (
                  <div key={i} className="rounded-[10px] bg-secondary p-3 flex gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <div className="text-sm font-bold">{p.titulo}</div>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.detalhe}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-display font-extrabold">Top 3 do ranking anual</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Os três primeiros do ranking anual levam prêmio no último encontro do Brasamind,
                    além do reconhecimento na rede.
                  </p>
                </div>
                {(topPrizes.length
                  ? topPrizes
                  : [
                      { pos: "1º", titulo: "Primeiro do ano", detalhe: "Prêmio principal no encerramento." },
                      { pos: "2º", titulo: "Segundo do ano", detalhe: "Prêmio de reconhecimento." },
                      { pos: "3º", titulo: "Terceiro do ano", detalhe: "Prêmio de incentivo." },
                    ]
                ).map((p, i) => {
                  const medal =
                    i === 0 ? "om-medal-gold" : i === 1 ? "om-medal-silver" : "om-medal-bronze";
                  return (
                    <div key={i} className="rounded-[10px] bg-secondary p-3 flex gap-3">
                      <span className={`om-medal ${medal} mt-0.5`} aria-hidden />
                      <div>
                        <div className="text-sm font-bold">
                          {p.pos ? `${p.pos} · ` : ""}
                          {p.titulo}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.detalhe}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <RankingPodium rank={data.rank} />

          <div className="grid lg:grid-cols-2 gap-4 items-start">
            <Card className="overflow-hidden p-0">
              <div className="font-display font-extrabold px-5 py-4 border-b border-border">
                Classificação completa
              </div>
              <ul>
                {data.rank.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/membro/membros/${r.id}`}
                      className="flex items-center gap-3.5 px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/60"
                    >
                      <span
                        className={cn(
                          "font-mono w-[26px] text-sm font-bold",
                          r.rank === 1 && "text-ember",
                        )}
                      >
                        {r.rank}º
                      </span>
                      <MemberAvatar
                        name={r.nome}
                        src={r.fotoUrl}
                        className="!h-[34px] !w-[34px] text-[10px] !ring-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{r.nome}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {r.empresa}
                          {r.especialidade ? ` · ${r.especialidade}` : ""}
                          {r.cidade ? ` · ${r.cidade}` : ""}
                        </div>
                      </div>
                      <Badge variant="secondary" className="hidden sm:inline-flex">
                        {labelCategory(r.categoria)}
                      </Badge>
                      <span className="font-mono text-sm font-bold shrink-0">
                        {formatPoints(r.pontos)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 space-y-4">
              <div>
                <h3 className="font-display font-extrabold">Medalhas & conquistas</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Pontos por presença, assiduidade, convites e adimplência.
                </p>
              </div>
              {data.achievements.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {data.achievements.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-[14px] border border-border p-3.5 space-y-2"
                    >
                      <span className="om-medal om-medal-gold h-10 w-10 rounded-full bg-secondary flex items-center justify-center" />
                      <div>
                        <div className="text-[13px] font-bold">{c.nome}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {c.descricao}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {data.rules.map((r, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{r.label}</span>
                      <span className="font-mono">+{r.pontos}</span>
                    </div>
                  ))}
                </div>
              )}
              {data.negatives.length > 0 && (
                <div className="pt-2 border-t border-border space-y-1">
                  <h4 className="text-sm font-semibold">O que tira da disputa</h4>
                  {data.negatives.map((n, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      · {n.texto}
                    </p>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
