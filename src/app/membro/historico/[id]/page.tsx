"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { EventMap } from "@/components/event-map";
import { initials } from "@/lib/utils";
import { labelRegistrationStatus } from "@/lib/labels";

type Detail = {
  event: {
    id: string;
    nome: string;
    data: string;
    hora: string;
    local: string;
    descricao: string | null;
    palestrante: string | null;
    palestranteBio: string | null;
    capaUrl: string | null;
    cronograma: { hora: string; item: string }[] | null;
    confirmedCount: number;
  };
  registration: {
    status: string;
    checkinAt: string | null;
    ticketCents: number;
    label: string;
  } | null;
  guests: { id: string; nome: string; empresa: string | null; status: string }[];
};

export default function HistoricoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useApiQuery<Detail>(
    ["membro", "historico", id],
    `/api/membro/historico/${id}`,
  );

  if (isLoading || !data) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-56" />
      </div>
    );
  }

  const e = data.event;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/membro/historico"
        className="text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        ‹ Voltar ao histórico
      </Link>

      <Card className="overflow-hidden">
        {e.capaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.capaUrl} alt="" className="h-48 w-full object-cover" />
        )}
        <div className="p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold">{e.nome}</h1>
            {data.registration && (
              <Badge
                variant={
                  data.registration.label === "Presente" ||
                  data.registration.label === "Confirmado"
                    ? "success"
                    : "destructive"
                }
              >
                {data.registration.label}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(e.data).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            , {e.hora} · {e.local}
          </p>
          {e.descricao && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {e.descricao}
            </p>
          )}
          <p className="text-sm font-semibold">
            {e.confirmedCount} participantes confirmados
          </p>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-xs uppercase text-muted-foreground">Seu check-in</div>
          <div className="font-mono text-lg font-bold mt-1">
            {data.registration?.checkinAt
              ? new Date(data.registration.checkinAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </div>
        </Card>
        <Card className="p-5 md:col-span-2">
          <div className="text-xs uppercase text-muted-foreground mb-2">
            Seus convidados neste encontro
          </div>
          {data.guests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum convidado.</p>
          ) : (
            <ul className="space-y-2">
              {data.guests.map((g) => (
                <li key={g.id} className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {initials(g.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{g.nome}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {g.empresa}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {labelRegistrationStatus(g.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <EventMap address={e.local} />

      {e.palestrante && (
        <Card className="p-5">
          <div className="font-semibold">{e.palestrante}</div>
          <p className="text-sm text-muted-foreground mt-1">{e.palestranteBio}</p>
        </Card>
      )}

      {Array.isArray(e.cronograma) && e.cronograma.length > 0 && (
        <Card className="p-5 space-y-2">
          <h2 className="font-display font-extrabold">Cronograma</h2>
          <ul className="space-y-2">
            {e.cronograma.map((c, i) => (
              <li key={i} className="flex gap-4 text-sm border-b border-border pb-2">
                <span className="font-mono w-16">{c.hora}</span>
                <span>{c.item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
