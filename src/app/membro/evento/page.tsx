"use client";

import Link from "next/link";
import { useState } from "react";
import { useApiQuery, apiMutate } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { TicketQr } from "@/components/ticket-qr";
import { EventMap } from "@/components/event-map";
import { MemberAvatar } from "@/components/member-avatar";
import { labelRegistrationStatus } from "@/lib/labels";
import {
  CreditCardFields,
  emptyCreditCard,
  type CardFormState,
} from "@/components/credit-card-fields";
import { PixResult } from "@/components/pix-result";

type Attendee = {
  nome: string;
  fotoUrl: string | null;
};

type EventoData = {
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
    palestranteFotoUrl?: string | null;
    capaUrl: string | null;
    vagas: number;
    cronograma: { hora: string; item: string }[] | null;
    confirmedCount: number;
    prices: { tier: string; amountCents: number; label: string }[];
    registrations?: {
      member?: { user?: { name?: string | null; image?: string | null } | null } | null;
      guest?: { nome?: string | null } | null;
    }[];
  } | null;
  registration: {
    id: string;
    status: string;
    ticketCents: number;
    checkinCode: string;
  } | null;
  priceCents: number | null;
  category: string;
};

function attendeesFrom(data: EventoData): Attendee[] {
  const regs = data.event?.registrations ?? [];
  return regs
    .map((r) => {
      if (r.member?.user?.name) {
        return {
          nome: r.member.user.name,
          fotoUrl: r.member.user.image ?? null,
        };
      }
      if (r.guest?.nome) {
        return { nome: r.guest.nome, fotoUrl: null };
      }
      return null;
    })
    .filter((a): a is Attendee => Boolean(a));
}

export default function EventoPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<EventoData>(
    ["membro", "evento"],
    "/api/membro/evento",
  );
  const [buying, setBuying] = useState(false);
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<"CREDIT_CARD" | "PIX">("PIX");
  const [card, setCard] = useState<CardFormState>(emptyCreditCard());
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [pix, setPix] = useState<{ encodedImage?: string; payload?: string } | null>(null);

  async function comprar() {
    setBuying(true);
    setError("");
    setPix(null);
    try {
      const res = await apiMutate<{
        asaasSkipped?: boolean;
        message?: string;
        free?: boolean;
        pix?: { encodedImage?: string; payload?: string };
      }>("/api/membro/evento/comprar", {
        method: "POST",
        body: JSON.stringify({
          paymentMethod: method,
          creditCard: method === "CREDIT_CARD" ? card : undefined,
        }),
      });
      setMsg(
        res.free
          ? "Ingresso cortesia confirmado."
          : res.message ?? "Ingresso confirmado.",
      );
      if (res.pix) setPix(res.pix);
      setCard(emptyCreditCard());
      setStep(0);
      await qc.invalidateQueries({ queryKey: ["membro", "evento"] });
      await qc.invalidateQueries({ queryKey: ["membro", "dashboard"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no pagamento");
    } finally {
      setBuying(false);
    }
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-64 rounded-[20px]" />
        <Skeleton className="h-24" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!data.event) {
    return (
      <Card className="p-8 max-w-xl">
        <h1 className="font-display text-xl font-extrabold">Sem evento ativo</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Quando o admin publicar o próximo encontro, ele aparece aqui.
        </p>
      </Card>
    );
  }

  const e = data.event;
  const hasTicket =
    data.registration &&
    ["CONFIRMED", "CHECKED_IN"].includes(data.registration.status);
  const attendees = attendeesFrom(data);
  const remaining = Math.max(0, e.vagas - e.confirmedCount);
  const fillPct = e.vagas > 0 ? Math.min(100, Math.round((e.confirmedCount / e.vagas) * 100)) : 0;
  const guestPrice = e.prices.find((p) => p.tier === "CONVIDADO");
  const memberPrice = data.priceCents ?? 0;
  const dateLabel = new Date(e.data).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero com capa */}
      <div className="relative min-h-[260px] overflow-hidden rounded-[20px] border border-border bg-secondary">
        {e.capaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={e.capaUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brasa/40 to-background" />
        )}
        <span className="om-img-scrim om-img-scrim--hero" aria-hidden />
        <div className="om-img-over relative z-[2] flex min-h-[260px] items-end p-6 sm:p-7">
          <div className="space-y-2 text-white max-w-3xl">
            <Badge variant="ember">Inscrições abertas</Badge>
            <h1 className="font-impact om-event-title leading-[1.1] text-white">
              {e.nome}
            </h1>
            {(e.palestranteBio || e.descricao) && (
              <p className="text-[15px] text-white/90 line-clamp-2">
                {e.palestranteBio || e.descricao}
              </p>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/90 pt-1">
              <span>{dateLabel}</span>
              <span>{e.hora}</span>
              <span>{e.localShort ?? e.local}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa de participantes */}
      <Card className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[26px] font-extrabold">
                {e.confirmedCount}
              </span>
              <span className="text-sm font-semibold">participantes confirmados</span>
            </div>
            <p className="text-[13px] text-muted-foreground">
              de {e.vagas} vagas, faltam {remaining}
            </p>
          </div>
          {attendees.length > 0 && (
            <div className="flex items-center">
              {attendees.slice(0, 8).map((a, i) => (
                <span key={`${a.nome}-${i}`} className="-mr-2.5 first:ml-0">
                  <MemberAvatar name={a.nome} src={a.fotoUrl} size="sm" />
                </span>
              ))}
              {e.confirmedCount > attendees.length && (
                <span className="ml-4 text-[13px] text-muted-foreground">
                  +{e.confirmedCount - Math.min(8, attendees.length)} membros
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="bg-success h-2 w-2 rounded-full" />
          Rede aquecida para esta edição
        </div>
      </Card>

      {/* Conteúdo + ingresso */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="space-y-6">
          {e.descricao && (
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-[17px] font-extrabold mb-2.5">
                Sobre o encontro
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {e.descricao}
              </p>
            </Card>
          )}

          {e.palestrante && (
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-[17px] font-extrabold mb-4">
                Palestrante
              </h2>
              <div className="flex items-center gap-4">
                <MemberAvatar
                  name={e.palestrante}
                  src={e.palestranteFotoUrl}
                  size="md"
                  className="!h-[72px] !w-[72px] ring-2 ring-primary"
                />
                <div>
                  <div className="font-display text-lg font-extrabold">
                    {e.palestrante}
                  </div>
                  {e.palestranteBio && (
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      {e.palestranteBio}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {Array.isArray(e.cronograma) && e.cronograma.length > 0 && (
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-[17px] font-extrabold mb-4">
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
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-3.5">
              <h2 className="font-display text-[17px] font-extrabold">
                Participantes confirmados
              </h2>
              <span className="font-mono text-[13px] text-muted-foreground">
                {e.confirmedCount} confirmados
              </span>
            </div>
            {attendees.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda sem confirmações. Seja o primeiro a garantir presença.
              </p>
            ) : (
              <div className="flex items-center flex-wrap">
                {attendees.slice(0, 10).map((a, i) => (
                  <span key={`${a.nome}-list-${i}`} className="-mr-2.5">
                    <MemberAvatar name={a.nome} src={a.fotoUrl} size="sm" className="!h-[38px] !w-[38px]" />
                  </span>
                ))}
                {e.confirmedCount > Math.min(10, attendees.length) && (
                  <span className="ml-5 text-[13px] text-muted-foreground">
                    +{e.confirmedCount - Math.min(10, attendees.length)} membros
                  </span>
                )}
              </div>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-[17px] font-extrabold mb-3.5">Local</h2>
            <EventMap bare address={e.local} title={e.localShort ?? undefined} />
            <div className="mt-3.5 flex items-start justify-between gap-3 text-sm">
              <div>
                <div className="font-bold">{e.localShort ?? "Local do encontro"}</div>
                <div className="text-muted-foreground">{e.local}</div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.local)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[13px] font-semibold hover:underline"
              >
                Abrir no Maps
              </a>
            </div>
          </Card>
        </div>

        {/* Painel sticky do ingresso */}
        <Card className="p-5 sm:p-6 space-y-4 lg:sticky lg:top-[92px]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-[17px] font-extrabold">Seu ingresso</h2>
            <Badge variant="ember">{data.category === "MEMBRO" ? "★ Membro" : data.category}</Badge>
          </div>

          {hasTicket && data.registration ? (
            <>
              <div className="flex items-center gap-2.5 rounded-xl border border-success bg-success/10 px-3.5 py-3">
                <span className="bg-success flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-success-foreground text-sm font-bold">
                  ✓
                </span>
                <div>
                  <div className="text-sm font-bold">Inscrição confirmada</div>
                  <div className="text-xs text-muted-foreground">
                    {labelRegistrationStatus(data.registration.status)}
                    {data.registration.ticketCents > 0
                      ? ` · ${formatCurrency(data.registration.ticketCents)}`
                      : " · cortesia"}
                  </div>
                </div>
              </div>
              <TicketQr code={data.registration.checkinCode} />
              <Link href="/membro/convites">
                <Button variant="outline" className="w-full">
                  Convidar alguém
                </Button>
              </Link>
            </>
          ) : step === 0 ? (
            <>
              <div className="rounded-[14px] border border-primary p-4 shadow-[0_0_0_3px_hsl(var(--primary)/.12)]">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-[34px] font-extrabold">
                    {memberPrice === 0 ? "Cortesia" : formatCurrency(memberPrice)}
                  </span>
                  {guestPrice &&
                    guestPrice.amountCents > memberPrice &&
                    memberPrice > 0 && (
                      <span className="text-[15px] text-muted-foreground line-through">
                        {formatCurrency(guestPrice.amountCents)}
                      </span>
                    )}
                </div>
                {guestPrice &&
                  guestPrice.amountCents > memberPrice &&
                  memberPrice > 0 && (
                    <div className="mt-1.5">
                      <Badge variant="success">
                        Economize {formatCurrency(guestPrice.amountCents - memberPrice)}
                      </Badge>
                    </div>
                  )}
              </div>

              <div className="space-y-2 text-[13px]">
                {e.prices.map((p) => (
                  <div key={p.tier} className="flex justify-between">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-mono">
                      {p.amountCents === 0 ? "Cortesia" : formatCurrency(p.amountCents)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Vagas restantes</span>
                <span className="font-mono font-bold">
                  {remaining} / {e.vagas}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-md bg-secondary">
                <div className="bg-brasa h-full" style={{ width: `${fillPct}%` }} />
              </div>

              <Button className="w-full h-11 bg-brasa glow-ember" onClick={() => setStep(1)}>
                {memberPrice === 0 ? "Garantir cortesia" : "Comprar ingresso"}
              </Button>
              <Link href="/membro/convites">
                <Button variant="outline" className="w-full">
                  Trazer um convidado
                </Button>
              </Link>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant={method === "PIX" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMethod("PIX")}
                >
                  PIX
                </Button>
                <Button
                  variant={method === "CREDIT_CARD" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMethod("CREDIT_CARD")}
                >
                  Cartão
                </Button>
              </div>
              {method === "CREDIT_CARD" && (
                <CreditCardFields value={card} onChange={setCard} />
              )}
              {pix && (
                <PixResult encodedImage={pix.encodedImage} payload={pix.payload} />
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {msg && <p className="text-sm text-success">{msg}</p>}
              <Button className="w-full" disabled={buying} onClick={comprar}>
                {buying ? "Processando…" : "Confirmar pagamento"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep(0)}>
                Voltar
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
