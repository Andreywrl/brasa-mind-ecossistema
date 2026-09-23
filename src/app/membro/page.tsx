"use client";

import Link from "next/link";
import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { formatPoints } from "@/lib/utils";
import { CountdownGrid } from "@/components/countdown";
import { OfferHighlight } from "@/components/ranking-podium";

type Dashboard = {
  greetingName: string;
  event: {
    id: string;
    nome: string;
    data: string;
    hora: string;
    localShort: string | null;
    local: string;
    capaUrl: string | null;
    palestrante: string | null;
    descricao: string | null;
    vagas: number;
  } | null;
  confirmedCount: number;
  pontos: number;
  rank: number | null;
  mensalidadeEmDia: boolean;
  nextDue?: string | null;
  openInvoice: { valor: string; competencia: string | null } | null;
  activity: { titulo: string; quando: string; valor: string }[];
  rankTop: { id?: string; nome: string; pontos: number; fotoUrl: string | null; rank: number }[];
  activeOffer: {
    id?: string;
    titulo: string;
    bannerUrl: string | null;
    destRotulo?: string | null;
    destino?: string | null;
    member?: { user?: { name?: string | null } | null } | null;
  } | null;
  activeOffers?: {
    id?: string;
    titulo: string;
    bannerUrl: string | null;
    destRotulo?: string | null;
    destino?: string | null;
    member?: { user?: { name?: string | null } | null } | null;
  }[];
};

export default function MembroDashboardPage() {
  const { data, isLoading } = useApiQuery<Dashboard>(
    ["membro", "dashboard"],
    "/api/membro/dashboard",
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {isLoading || !data ? (
        <Skeleton className="h-64 rounded-[20px]" />
      ) : data.event ? (
        <Card className="om-hero-split overflow-hidden p-0">
          <div className="flex flex-col gap-[18px] px-[30px] py-7 max-sm:px-5 max-sm:py-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="ember">Evento do mês</Badge>
              <span className="text-[13px] text-muted-foreground">
                {new Date(data.event.data).toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "long",
                })}
                , {data.event.hora}
              </span>
            </div>
            <div>
              <h2 className="font-display text-[30px] font-extrabold leading-tight tracking-[-0.02em] m-0">
                {data.event.nome}
              </h2>
              {data.event.descricao && (
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 m-0">
                  {data.event.descricao}
                </p>
              )}
            </div>
            <CountdownGrid target={data.event.data} />
            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                href="/membro/evento/comprar"
                className="inline-flex h-11 items-center justify-center rounded-md bg-brasa px-6 text-sm font-semibold text-white glow-ember"
              >
                Comprar ingresso
              </Link>
              <Link
                href="/membro/evento"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Ver detalhes do evento
              </Link>
            </div>
          </div>
          <div className="relative min-h-[230px] bg-secondary">
            {data.event.capaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.event.capaUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brasa/25 to-secondary" />
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="font-display text-xl font-extrabold">Sem evento ativo</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quando o próximo encontro for publicado, ele aparece aqui.
          </p>
        </Card>
      )}

      {isLoading || !data ? (
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/membro/financeiro" className="om-kpi">
            <Card className="p-5 h-full">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Minha mensalidade
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={data.mensalidadeEmDia ? "success" : "warning"}>
                  {data.mensalidadeEmDia ? "Em dia" : "Pendente"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {data.openInvoice
                  ? `${data.openInvoice.competencia}: ${data.openInvoice.valor}`
                  : data.nextDue
                    ? `Próxima: ${new Date(data.nextDue).toLocaleDateString("pt-BR")}`
                    : "Próxima cobrança no dia 05"}
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-primary">
                Ver financeiro
              </span>
            </Card>
          </Link>
          <Link href="/membro/ranking" className="om-kpi">
            <Card className="p-5 h-full">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Minha pontuação
              </div>
              <div className="font-mono text-2xl font-extrabold mt-2">
                {formatPoints(data.pontos)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {data.rank ? `${data.rank}º no ranking geral` : "Fora da disputa"}
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-primary">
                Ver pontuação
              </span>
            </Card>
          </Link>
          <Link href="/membro/convites" className="om-kpi">
            <Card className="p-5 h-full">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Meus convites
              </div>
              <div className="font-mono text-2xl font-extrabold mt-2">
                {data.confirmedCount}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                confirmados no evento · {data.event?.vagas ?? "-"} vagas
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-primary">
                Ver convites
              </span>
            </Card>
          </Link>
        </div>
      )}

      {data?.activeOffers?.length ? (
        <OfferHighlight offers={data.activeOffers} />
      ) : data?.activeOffer ? (
        <OfferHighlight offer={data.activeOffer} />
      ) : null}

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-display font-extrabold mb-1">Sua posição no ranking</h3>
          <p className="text-xs text-muted-foreground mb-4">
            No encerramento do ano, o Brasamind premia quem performou bem e o Top 3 do ranking.
          </p>
          {isLoading || !data ? (
            <div className="space-y-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : (
            <ul className="space-y-3">
              {data.rankTop.map((r) => (
                <li key={r.rank} className="flex items-center gap-3">
                  <span className="font-mono text-sm w-6">{r.rank}º</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{r.nome}</div>
                  </div>
                  <span className="font-mono text-sm">{formatPoints(r.pontos)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/membro/ranking"
            className="mt-4 inline-block text-sm font-semibold text-primary"
          >
            Ver ranking e prêmios
          </Link>
        </Card>

        <Card className="lg:col-span-3 p-5">
          <h3 className="font-display font-extrabold mb-4">Histórico recente</h3>
          {isLoading || !data ? (
            <div className="space-y-3">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ) : data.activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem atividades ainda.</p>
          ) : (
            <ul className="space-y-3">
              {data.activity.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 text-sm border-b border-border pb-3 last:border-0"
                >
                  <div>
                    <div className="font-semibold">{a.titulo}</div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(a.quando).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <span className="font-mono">{a.valor}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {data?.openInvoice && (
        <Card className="p-5 flex flex-wrap items-center justify-between gap-4 border-warning/40">
          <div>
            <div className="font-semibold">Mensalidade pendente</div>
            <p className="text-sm text-muted-foreground">
              {data.openInvoice.competencia}: {data.openInvoice.valor}
            </p>
          </div>
          <Link
            href="/membro/financeiro"
            className="inline-flex h-11 items-center rounded-md bg-brasa px-6 text-sm font-semibold text-white"
          >
            Pagar agora
          </Link>
        </Card>
      )}
    </div>
  );
}
