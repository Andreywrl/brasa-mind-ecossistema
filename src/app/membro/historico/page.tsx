"use client";

import Link from "next/link";
import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";

type HistData = {
  events: {
    id: string;
    nome: string;
    data: string;
    local: string;
    capaUrl: string | null;
    status: string;
    badgeVar: string;
  }[];
};

export default function HistoricoPage() {
  const { data, isLoading } = useApiQuery<HistData>(
    ["membro", "historico"],
    "/api/membro/historico",
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Histórico</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Encontros anteriores do Brasamind.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.events.map((e) => (
            <Link key={e.id} href={`/membro/historico/${e.id}`}>
              <Card className="overflow-hidden h-full hover:border-primary/40 transition-colors">
                {e.capaUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.capaUrl} alt="" className="h-36 w-full object-cover" />
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold">{e.nome}</h2>
                    <Badge
                      variant={
                        e.badgeVar === "success" ? "success" : "destructive"
                      }
                    >
                      {e.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.data).toLocaleDateString("pt-BR")} · {e.local}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Link href="/membro/evento" className="text-sm font-semibold text-primary">
        Ver evento do mês
      </Link>
    </div>
  );
}
