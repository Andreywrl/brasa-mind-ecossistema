"use client";

import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";

type Overview = {
  kpis: { label: string; value: string }[];
  byCategory: { categoria: string; total: number }[];
  topPont: { pos: string; nome: string; val: string }[];
  event: { nome: string; _count: { registrations: number }; vagas: number } | null;
};

export default function AdminHomePage() {
  const { data, isLoading } = useApiQuery<Overview>(
    ["admin", "overview"],
    "/api/admin/overview",
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Visão geral</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Números saem do banco, não de KPI fixo.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.kpis.map((k) => (
            <Card key={k.label} className="p-4">
              <div className="text-xs text-muted-foreground uppercase">{k.label}</div>
              <div className="font-mono text-xl font-extrabold mt-2">{k.value}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-display font-extrabold mb-3">Por categoria</h2>
          {isLoading || !data ? (
            <Skeleton className="h-32" />
          ) : (
            <ul className="space-y-2">
              {data.byCategory.map((c) => (
                <li key={c.categoria} className="flex justify-between text-sm">
                  <span>{c.categoria}</span>
                  <span className="font-mono">{c.total}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-extrabold mb-3">Top pontos</h2>
          {isLoading || !data ? (
            <Skeleton className="h-32" />
          ) : (
            <ul className="space-y-2">
              {data.topPont.map((t) => (
                <li key={t.pos} className="flex justify-between text-sm">
                  <span>
                    {t.pos}º {t.nome}
                  </span>
                  <span className="font-mono">{t.val}</span>
                </li>
              ))}
            </ul>
          )}
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
