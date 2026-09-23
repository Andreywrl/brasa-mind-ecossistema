"use client";

import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Overview = {
  kpis: { label: string; value: string }[];
  byCategory: { categoria: string; total: number }[];
  topPont: { pos: string; nome: string; val: string }[];
  event: { nome: string; _count: { registrations: number }; vagas: number } | null;
  paidThisMonth?: number;
};

const CAT_LABEL: Record<string, string> = {
  FUNDADOR: "Fundadores",
  PATROCINADOR: "Patrocinadores",
  MEMBRO: "Membros gerais",
  APOIADOR: "Apoiadores",
};

const CAT_COLOR: Record<string, string> = {
  FUNDADOR: "hsl(var(--chart-1))",
  PATROCINADOR: "hsl(var(--chart-2))",
  MEMBRO: "hsl(var(--chart-4))",
  APOIADOR: "hsl(var(--chart-5))",
};

export default function AdminHomePage() {
  const { data, isLoading } = useApiQuery<Overview>(
    ["admin", "overview"],
    "/api/admin/overview",
  );

  const monthLabel = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const totalMembers =
    data?.byCategory.reduce((s, c) => s + c.total, 0) ?? 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Visão geral</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Indicadores do Brasa em {monthLabel}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold capitalize">
            {monthLabel}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            Exportar relatório geral
          </Button>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.kpis.map((k) => (
            <Card key={k.label} className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {k.label === "Membros"
                  ? "Total de membros"
                  : k.label === "Ativos"
                    ? "Membros ativos"
                    : k.label === "MRR"
                      ? "Receita recorrente"
                      : k.label === "Receita eventos"
                        ? "Receita de eventos"
                        : k.label === "Participantes (ativo)"
                          ? "Participantes"
                          : k.label === "Pendências"
                            ? "Inadimplência"
                            : k.label}
              </div>
              <div className="font-mono text-xl font-extrabold mt-2">{k.value}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <Card className="p-5">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-extrabold">Receita recorrente (MRR)</h2>
              <p className="text-xs text-muted-foreground font-mono">
                em milhares · {new Date().getFullYear()}
              </p>
            </div>
            <div className="font-mono text-lg font-extrabold">
              {data?.kpis.find((k) => k.label === "MRR")?.value ?? "—"}
            </div>
          </div>
          {isLoading || !data ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="flex items-end gap-2 h-40">
              {Array.from({ length: 6 }).map((_, i) => {
                const height = 35 + ((i * 17) % 55);
                const label = new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() - (5 - i),
                  1,
                ).toLocaleDateString("pt-BR", { month: "short" });
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className="w-full rounded-t-md bg-brasa/80"
                      style={{ height: `${height}%` }}
                      title={label}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Série visual ilustrativa. O valor do mês atual vem do banco ({data?.paidThisMonth ?? 0}{" "}
            mensalidades pagas neste mês).
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-extrabold mb-1">Composição de membros</h2>
          <p className="text-xs text-muted-foreground mb-4">
            <span className="font-mono font-bold text-foreground">{totalMembers}</span> membros
          </p>
          {isLoading || !data ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="space-y-3">
              <div
                className="mx-auto h-36 w-36 rounded-full"
                style={{
                  background:
                    totalMembers === 0
                      ? "hsl(var(--secondary))"
                      : `conic-gradient(${data.byCategory
                          .map((c, i, arr) => {
                            const start = arr
                              .slice(0, i)
                              .reduce((s, x) => s + x.total, 0);
                            const end = start + c.total;
                            const a = (start / totalMembers) * 360;
                            const b = (end / totalMembers) * 360;
                            return `${CAT_COLOR[c.categoria] ?? "hsl(var(--chart-3))"} ${a}deg ${b}deg`;
                          })
                          .join(", ")})`,
                }}
              />
              <ul className="space-y-2">
                {data.byCategory.map((c) => (
                  <li key={c.categoria} className="flex justify-between text-sm items-center gap-2">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background: CAT_COLOR[c.categoria] ?? "hsl(var(--chart-3))",
                        }}
                      />
                      {CAT_LABEL[c.categoria] ?? c.categoria}
                    </span>
                    <span className="font-mono">{c.total}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5">
          <h2 className="font-display font-extrabold mb-3">Top pontuação</h2>
          {isLoading || !data ? (
            <Skeleton className="h-32" />
          ) : (
            <ul className="space-y-2">
              {data.topPont.map((t) => (
                <li key={t.pos} className="flex justify-between text-sm gap-3">
                  <span className="truncate">
                    <span className="font-mono text-muted-foreground mr-2">{t.pos}º</span>
                    {t.nome}
                  </span>
                  <span className="font-mono shrink-0">{t.val}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-extrabold mb-3">Top indicações</h2>
          <p className="text-sm text-muted-foreground">
            Em breve: ranking de indicações de novos membros.
          </p>
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-extrabold mb-3">Top assiduidade</h2>
          <p className="text-sm text-muted-foreground">
            Em breve: quem mais comparece aos encontros.
          </p>
        </Card>
      </div>

      {data?.event && (
        <Card className="p-5">
          <h2 className="font-display font-extrabold">{data.event.nome}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.event._count.registrations} inscritos · {data.event.vagas} vagas
          </p>
        </Card>
      )}
    </div>
  );
}
