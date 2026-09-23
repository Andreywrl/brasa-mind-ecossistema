"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { TicketQr } from "@/components/ticket-qr";
import {
  CreditCardFields,
  emptyCreditCard,
  type CardFormState,
} from "@/components/credit-card-fields";
import { PixResult } from "@/components/pix-result";
import { PaymentTrust } from "@/components/payment-trust";
import toast from "react-hot-toast";
import { toastActionError } from "@/lib/action-toast";

type EventoData = {
  event: {
    id: string;
    nome: string;
    data: string;
    hora: string;
    local: string;
    localShort: string | null;
    capaUrl: string | null;
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

function StepDot({
  n,
  label,
  state,
}: {
  n: number;
  label: string;
  state: "done" | "current" | "todo";
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-[30px] w-[30px] items-center justify-center rounded-full text-sm font-bold",
          state === "done" && "bg-success text-success-foreground",
          state === "current" && "bg-brasa text-white",
          state === "todo" && "bg-secondary text-muted-foreground",
        )}
      >
        {n}
      </span>
      <span className="text-[13px] font-semibold">{label}</span>
    </div>
  );
}

export default function ComprarIngressoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<EventoData>(
    ["membro", "evento"],
    "/api/membro/evento",
  );
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"CREDIT_CARD" | "PIX">("PIX");
  const [card, setCard] = useState<CardFormState>(emptyCreditCard());
  const [terms, setTerms] = useState(false);
  const [buying, setBuying] = useState(false);
  const [pix, setPix] = useState<{ encodedImage?: string; payload?: string } | null>(null);

  useEffect(() => {
    if (data?.registration && ["CONFIRMED", "CHECKED_IN"].includes(data.registration.status) && step < 3) {
      setStep(3);
    }
  }, [data?.registration, step]);

  async function confirmar() {
    setBuying(true);
    setPix(null);
    try {
      const res = await apiMutate<{
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
      toast.success(res.free ? "Ingresso cortesia confirmado." : res.message ?? "Ingresso confirmado.");
      if (res.pix) setPix(res.pix);
      setCard(emptyCreditCard());
      setStep(3);
      await qc.invalidateQueries({ queryKey: ["membro", "evento"] });
      await qc.invalidateQueries({ queryKey: ["membro", "dashboard"] });
    } catch (e) {
      toastActionError(e, "Falha no pagamento.");
    } finally {
      setBuying(false);
    }
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-[720px] space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data.event) {
    return (
      <Card className="mx-auto max-w-xl p-8">
        <h2 className="font-display text-xl font-extrabold">Sem evento ativo</h2>
        <Link href="/membro/evento" className="mt-4 inline-block text-sm font-semibold text-primary">
          Voltar
        </Link>
      </Card>
    );
  }

  const e = data.event;
  const hasTicket =
    data.registration &&
    ["CONFIRMED", "CHECKED_IN"].includes(data.registration.status);
  const price = data.priceCents ?? 0;
  const guestPrice = e.prices.find((p) => p.tier === "CONVIDADO")?.amountCents ?? price;
  const discount = Math.max(0, guestPrice - price);
  const dateLabel = new Date(e.data).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
  });

  const stepState = (n: number): "done" | "current" | "todo" => {
    if (step > n) return "done";
    if (step === n) return "current";
    return "todo";
  };

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6">
      <button
        type="button"
        onClick={() => router.push("/membro/evento")}
        className="self-start border-0 bg-transparent text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        ‹ Voltar ao evento
      </button>

      <div className="flex items-center gap-2">
        <StepDot n={1} label="Resumo" state={stepState(1)} />
        <div className="h-0.5 flex-1 bg-border" />
        <StepDot n={2} label="Pagamento" state={stepState(2)} />
        <div className="h-0.5 flex-1 bg-border" />
        <StepDot n={3} label="Ingresso" state={stepState(3)} />
      </div>

      {step === 1 && (
        <Card className="p-6">
          <h3 className="font-display mb-4 text-lg font-extrabold">Resumo do pedido</h3>
          <div className="flex gap-4 border-b border-border pb-4">
            <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-secondary">
              {e.capaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.capaUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <div className="font-display text-[17px] font-extrabold">{e.nome}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">
                {dateLabel}, {e.hora}
              </div>
              <div className="text-[13px] text-muted-foreground">
                {e.localShort ?? e.local}
              </div>
              <div className="mt-2">
                <Badge variant="ember">★ Ingresso {data.category}</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-2.5 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ingresso {data.category}</span>
              <span className="font-mono">{formatCurrency(guestPrice)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Desconto de membro</span>
                <span className="font-mono">- {formatCurrency(discount)}</span>
              </div>
            )}
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-bold">Total</span>
            <span className="font-display font-mono text-[26px] font-extrabold">
              {price === 0 ? "Cortesia" : formatCurrency(price)}
            </span>
          </div>
          <Button
            className="mt-8 h-11 w-full bg-brasa glow-ember"
            onClick={() => setStep(2)}
          >
            Ir para pagamento
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-extrabold m-0">Pagamento</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Cobrança via Asaas
            </span>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setMethod("PIX")}
              className={cn(
                "flex-1 rounded-xl border p-3.5 text-center text-sm font-bold",
                method === "PIX"
                  ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/.12)]"
                  : "border-border font-semibold",
              )}
            >
              PIX
            </button>
            <button
              type="button"
              onClick={() => setMethod("CREDIT_CARD")}
              className={cn(
                "flex-1 rounded-xl border p-3.5 text-center text-sm",
                method === "CREDIT_CARD"
                  ? "border-primary font-bold shadow-[0_0_0_3px_hsl(var(--primary)/.12)]"
                  : "border-border font-semibold",
              )}
            >
              Cartão de crédito
            </button>
          </div>

          {method === "CREDIT_CARD" && (
            <CreditCardFields value={card} onChange={setCard} />
          )}
          {method === "PIX" && (
            <div className="rounded-xl bg-secondary p-4 text-center text-sm text-muted-foreground">
              Ao confirmar, geramos o QR Code PIX para você pagar na hora.
            </div>
          )}

          <div className="flex items-center justify-between gap-4 rounded-[14px] border border-border bg-secondary px-[18px] py-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Total a pagar
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Ingresso {data.category}, à vista
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-mono text-[32px] font-extrabold leading-none">
                {price === 0 ? "Cortesia" : formatCurrency(price)}
              </div>
              {discount > 0 && (
                <div className="mt-1 text-[11px] font-semibold text-success">
                  {formatCurrency(discount)} de desconto de membro
                </div>
              )}
            </div>
          </div>

          <PaymentTrust />

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <span className="text-[13px] leading-snug text-muted-foreground">
              Li e aceito os{" "}
              <Link href="/privacidade" className="font-semibold underline underline-offset-2">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="font-semibold underline underline-offset-2">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="h-11" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button
              className="h-11 flex-1 bg-brasa glow-ember"
              disabled={!terms}
              loading={buying}
              onClick={confirmar}
            >
              {buying ? "Processando…" : "Confirmar pagamento"}
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-4 p-6 text-center">
          <h3 className="font-display text-[22px] font-extrabold m-0">
            Ingresso confirmado!
          </h3>
          <p className="text-sm text-muted-foreground m-0">
            Mostre o QR Code na portaria do encontro.
          </p>
          {pix && (
            <PixResult encodedImage={pix.encodedImage} payload={pix.payload} />
          )}
          {data.registration?.checkinCode && (
            <div className="mx-auto max-w-xs">
              <TicketQr code={data.registration.checkinCode} />
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Link href="/membro/evento">
              <Button variant="outline">Ver evento</Button>
            </Link>
            <Link href="/membro/convites">
              <Button>Convidar alguém</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
