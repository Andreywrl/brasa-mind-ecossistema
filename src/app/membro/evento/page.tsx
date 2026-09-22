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
import {
  CreditCardFields,
  emptyCreditCard,
  type CardFormState,
} from "@/components/credit-card-fields";
import { PixResult } from "@/components/pix-result";

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
    capaUrl: string | null;
    vagas: number;
    cronograma: { hora: string; item: string }[] | null;
    confirmedCount: number;
    prices: { tier: string; amountCents: number; label: string }[];
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
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
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

  return (
    <div className="space-y-6 max-w-5xl">
      <Card className="overflow-hidden">
        {e.capaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.capaUrl} alt="" className="h-56 w-full object-cover" />
        )}
        <div className="p-6 space-y-3">
          <Badge variant="ember">Evento do mês</Badge>
          <h1 className="font-display text-2xl font-extrabold">{e.nome}</h1>
          <p className="text-muted-foreground text-sm">
            {new Date(e.data).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            , {e.hora}
          </p>
          <p className="text-sm">{e.local}</p>
          {e.descricao && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {e.descricao}
            </p>
          )}
          <p className="text-sm font-semibold">
            {e.confirmedCount} confirmados · {e.vagas} vagas
          </p>
        </div>
      </Card>

      <EventMap address={e.local} />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <h2 className="font-display font-extrabold text-lg">Cronograma</h2>
          <ul className="space-y-2">
            {(Array.isArray(e.cronograma) ? e.cronograma : []).map((c, i) => (
              <li key={i} className="flex gap-4 text-sm border-b border-border pb-2">
                <span className="font-mono w-16">{c.hora}</span>
                <span>{c.item}</span>
              </li>
            ))}
          </ul>
          {e.palestrante && (
            <div className="pt-2">
              <div className="font-semibold">{e.palestrante}</div>
              <p className="text-sm text-muted-foreground">{e.palestranteBio}</p>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-display font-extrabold text-lg">Seu ingresso</h2>
          {hasTicket && data.registration ? (
            <>
              <Badge
                variant={
                  data.registration.status === "CHECKED_IN"
                    ? "success"
                    : "ember"
                }
              >
                {data.registration.status === "CHECKED_IN"
                  ? "Check-in feito"
                  : "Confirmado"}
              </Badge>
              <TicketQr code={data.registration.checkinCode} />
              <Link
                href="/membro/convites"
                className="block text-sm font-semibold text-primary text-center"
              >
                Trazer convidados
              </Link>
            </>
          ) : step === 0 ? (
            <>
              <div className="space-y-2 text-sm">
                {e.prices.map((p) => (
                  <div key={p.tier} className="flex justify-between">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-mono">
                      {p.amountCents === 0
                        ? "Cortesia"
                        : formatCurrency(p.amountCents)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span>Seu valor ({data.category})</span>
                <span className="font-mono">
                  {data.priceCents === 0
                    ? "Cortesia"
                    : formatCurrency(data.priceCents ?? 0)}
                </span>
              </div>
              <Button className="w-full" onClick={() => setStep(1)}>
                {data.priceCents === 0 ? "Garantir cortesia" : "Comprar ingresso"}
              </Button>
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
