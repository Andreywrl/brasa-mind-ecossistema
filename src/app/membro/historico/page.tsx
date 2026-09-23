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
    participantes: number;
    pontos: number;
  }[];
};

export default function HistoricoPage() {
  const { data, isLoading } = useApiQuery<HistData>(
    ["membro", "historico"],
    "/api/membro/historico",
  );

  return (
    <div className="space-y-5 max-w-5xl">
      <p className="text-sm text-muted-foreground m-0">
        Seus eventos anteriores, com participação e pontos conquistados.
      </p>

      {isLoading || !data ? (
        <div className="om-grid-2">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      ) : data.events.length === 0 ? (
        <Card className="p-8 text-sm text-muted-foreground">
          Ainda não há encontros anteriores. Depois do próximo evento, ele aparece aqui.
        </Card>
      ) : (
        <div className="om-grid-2">
          {data.events.map((e) => (
            <Link key={e.id} href={`/membro/historico/${e.id}`} className="block">
              <Card className="om-lift overflow-hidden h-full p-0 hover:border-primary/40 transition-colors">
                <div className="relative h-[120px] w-full bg-secondary">
                  {e.capaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.capaUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brasa/30 to-secondary" />
                  )}
                  <span className="om-img-scrim" aria-hidden />
                  <span className="om-img-over absolute right-3 top-3">
                    <Badge
                      variant={
                        e.badgeVar === "success" ? "success" : "destructive"
                      }
                    >
                      {e.status}
                    </Badge>
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 p-[18px] px-5">
                  <div className="flex items-center justify-between gap-2.5">
                    <h2 className="font-display text-[17px] font-extrabold leading-tight">
                      {e.nome}
                    </h2>
                    <span className="font-mono text-[13px] font-bold shrink-0">
                      +{e.pontos} pts
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-[18px] gap-y-1 text-[13px] text-muted-foreground">
                    <span className="font-mono">
                      {new Date(e.data).toLocaleDateString("pt-BR")}
                    </span>
                    <span>{e.local}</span>
                    <span>{e.participantes} participantes</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
