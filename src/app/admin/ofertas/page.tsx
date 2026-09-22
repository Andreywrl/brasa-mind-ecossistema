"use client";

import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";

type Offers = {
  offers: {
    id: string;
    titulo: string;
    ativo: boolean;
    views: number;
    clicks: number;
    member: { empresa: string; user: { name: string | null } };
  }[];
  totals: { count: number; ativas: number; views: number; clicks: number };
};

export default function AdminOfertasPage() {
  const { data, isLoading } = useApiQuery<Offers>(
    ["admin", "ofertas"],
    "/api/admin/ofertas",
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display text-2xl font-extrabold">Ofertas</h1>
      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <div className="grid sm:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-mono text-xl font-extrabold">{data.totals.count}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">Ativas</div>
              <div className="font-mono text-xl font-extrabold">{data.totals.ativas}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">Views</div>
              <div className="font-mono text-xl font-extrabold">{data.totals.views}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">Cliques</div>
              <div className="font-mono text-xl font-extrabold">{data.totals.clicks}</div>
            </Card>
          </div>
          <div className="space-y-2">
            {data.offers.map((o) => (
              <Card key={o.id} className="p-4 flex justify-between gap-3 items-center">
                <div>
                  <div className="font-semibold">{o.titulo}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.member.user.name} · {o.member.empresa} · {o.views} views ·{" "}
                    {o.clicks} cliques
                  </div>
                </div>
                <Badge variant={o.ativo ? "success" : "secondary"}>
                  {o.ativo ? "Ativa" : "Pausada"}
                </Badge>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
