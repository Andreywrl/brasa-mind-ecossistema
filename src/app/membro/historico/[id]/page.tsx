"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { MemberAvatar } from "@/components/member-avatar";
import { labelRegistrationStatus } from "@/lib/labels";

type Detail = {
  event: {
    id: string;
    nome: string;
    data: string;
    hora: string;
    local: string;
    localShort: string | null;
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
  guests: {
    id: string;
    nome: string;
    empresa: string | null;
    status: string;
    fotoUrl: string | null;
  }[];
  pontos: number;
};

export default function HistoricoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useApiQuery<Detail>(
    ["membro", "historico", id],
    `/api/membro/historico/${id}`,
  );

  if (isLoading || !data) {
    return (
      <div className="space-y-5 max-w-5xl">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-56 rounded-[20px]" />
        <div className="om-grid-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  const e = data.event;
  const badgeOk =
    data.registration?.label === "Presente" ||
    data.registration?.label === "Confirmado";

  return (
    <div className="space-y-5 max-w-5xl">
      <Link
        href="/membro/historico"
        className="inline-block text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        ‹ Voltar ao histórico
      </Link>

      {/* Hero capa */}
      <div className="relative min-h-[220px] overflow-hidden rounded-[20px] border border-border bg-secondary">
        {e.capaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={e.capaUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brasa/35 to-background" />
        )}
        <span className="om-img-scrim om-img-scrim--hero" aria-hidden />
        <div className="om-img-over relative z-[2] flex min-h-[220px] items-end p-6 sm:px-7 sm:pb-6">
          <div className="space-y-2 text-white">
            {data.registration && (
              <Badge variant={badgeOk ? "success" : "destructive"}>
                {data.registration.label}
              </Badge>
            )}
            <h1 className="font-impact text-[34px] leading-[1.1] text-white">
              {e.nome}
            </h1>
            <div className="flex flex-wrap gap-x-[18px] gap-y-1 text-sm text-white/90">
              <span className="font-mono">
                {new Date(e.data).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                {e.hora ? ` · ${e.hora}` : ""}
              </span>
              <span>{e.localShort ?? e.local}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="om-grid-4">
        <Card className="rounded-[14px] p-4">
          <div className="text-xs text-muted-foreground">Seu check-in</div>
          <div className="font-mono text-lg font-bold mt-1">
            {data.registration?.checkinAt
              ? new Date(data.registration.checkinAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </div>
        </Card>
        <Card className="rounded-[14px] p-4">
          <div className="text-xs text-muted-foreground">Participantes</div>
          <div className="font-mono text-lg font-bold mt-1">
            {e.confirmedCount}
          </div>
        </Card>
        <Card className="rounded-[14px] p-4">
          <div className="text-xs text-muted-foreground">Convidados levados</div>
          <div className="font-mono text-lg font-bold mt-1">
            {data.guests.length}
          </div>
        </Card>
        <Card className="rounded-[14px] p-4">
          <div className="text-xs text-muted-foreground">Pontos</div>
          <div className="font-mono text-lg font-bold mt-1">
            +{data.pontos}
          </div>
        </Card>
      </div>

      <div className="om-split items-start">
        <Card className="p-5 sm:p-6 space-y-4">
          {e.descricao && (
            <div>
              <h2 className="font-display text-base font-extrabold mb-2">
                Sobre o encontro
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {e.descricao}
              </p>
            </div>
          )}
          {e.palestrante && (
            <div>
              <h2 className="font-display text-base font-extrabold mb-2">
                Palestrante
              </h2>
              <div className="font-semibold text-sm">{e.palestrante}</div>
              {e.palestranteBio && (
                <p className="text-[13px] text-muted-foreground mt-1">
                  {e.palestranteBio}
                </p>
              )}
            </div>
          )}
          {Array.isArray(e.cronograma) && e.cronograma.length > 0 && (
            <div>
              <h2 className="font-display text-base font-extrabold mb-3">
                Cronograma
              </h2>
              <ul>
                {e.cronograma.map((c, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[64px_1fr] gap-4 py-2.5 border-b border-border last:border-0 text-sm"
                  >
                    <span className="font-mono font-bold">{c.hora}</span>
                    <span>{c.item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!e.descricao && !e.palestrante && !(Array.isArray(e.cronograma) && e.cronograma.length) && (
            <p className="text-sm text-muted-foreground">
              Detalhes deste encontro ficaram registrados na presença e nos pontos abaixo.
            </p>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-base font-extrabold mb-3.5">
            Convidados que você levou
          </h2>
          {data.guests.length === 0 ? (
            <p className="text-[13px] text-muted-foreground m-0">
              Você não levou convidados neste evento.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.guests.map((g) => (
                <li key={g.id} className="flex items-center gap-3">
                  <MemberAvatar name={g.nome} src={g.fotoUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{g.nome}</div>
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
    </div>
  );
}
