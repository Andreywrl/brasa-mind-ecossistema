"use client";

import Link from "next/link";
import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { formatCurrency, formatPoints } from "@/lib/utils";

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
  openInvoice: { valor: string; competencia: string | null } | null;
  activity: { titulo: string; quando: string; valor: string }[];
  rankTop: { nome: string; pontos: number; fotoUrl: string | null; rank: number }[];
  activeOffer: { titulo: string; bannerUrl: string | null } | null;
};

export default function MembroDashboardPage() {
  const { data, isLoading } = useApiQuery<Dashboard>(
    ["membro", "dashboard"],
    "/api/membro/dashboard",
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold">
          Olá, {data?.greetingName ?? "…"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Conecte, indique e feche negócios no Brasa.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5 om-kpi">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Mensalidade
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={data.mensalidadeEmDia ? "success" : "warning"}>
                {data.mensalidadeEmDia ? "Em dia" : "Pendente"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {data.openInvoice
                ? `${data.openInvoice.competencia}: ${data.openInvoice.valor}`
                : "Próxima cobrança no dia 05"}
            </p>
          </Card>
          <Card className="p-5 om-kpi">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Pontuação
            </div>
            <div className="font-mono text-2xl font-extrabold mt-2">
              {formatPoints(data.pontos)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {data.rank ? `${data.rank}º no ranking geral` : "Fora da disputa"}
            </p>
          </Card>
          <Card className="p-5 om-kpi">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Evento do mês
            </div>
            <div className="font-mono text-2xl font-extrabold mt-2">
              {data.confirmedCount}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              confirmados · {data.event?.vagas ?? "—"} vagas
            </p>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 overflow-hidden">
          {isLoading || !data?.event ? (
            <Skeleton className="h-56 rounded-none" />
          ) : (
            <>
              {data.event.capaUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.event.capaUrl}
                  alt=""
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-5 space-y-3">
                <Badge variant="ember">Evento do mês</Badge>
                <h2 className="font-display text-xl font-extrabold">
                  {data.event.nome}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(data.event.data).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "long",
                  })}
                  , {data.event.hora} · {data.event.localShort ?? data.event.local}
                </p>
                {data.event.palestrante && (
                  <p className="text-sm">Palestra com {data.event.palestrante}</p>
                )}
                <Link
                  href="/membro/evento"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-brasa px-6 text-sm font-semibold text-white glow-ember"
                >
                  Ver evento e ingresso
                </Link>
              </div>
            </>
          )}
        </Card>

        <Card className="lg:col-span-2 p-5">
          <h3 className="font-display font-extrabold mb-4">Ranking</h3>
          {isLoading || !data ? (
            <div className="space-y-3">
              <Skeleton className="h-10" />
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
            Ver ranking completo
          </Link>
        </Card>
      </div>

      <Card className="p-5">
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

      {!data?.mensalidadeEmDia && data?.openInvoice && (
        <p className="text-xs text-muted-foreground">
          Após 30 dias de atraso o acesso à rede é bloqueado até a quitação.
        </p>
      )}

      {/* silence unused */}
      <span className="hidden">{formatCurrency(0)}</span>
    </div>
  );
}
