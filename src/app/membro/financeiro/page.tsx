"use client";

import { useState } from "react";
import Link from "next/link";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCardFields,
  emptyCreditCard,
  type CardFormState,
} from "@/components/credit-card-fields";
import { PixResult } from "@/components/pix-result";
import { PaymentTrust } from "@/components/payment-trust";
import { labelInvoiceStatus, labelPaymentMethod } from "@/lib/labels";
import { Modal } from "@/components/ui/modal";

type FinData = {
  emDia: boolean;
  totalPagoFmt: string;
  nextDue: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
  asaasConfigured: boolean;
  addressComplete?: boolean;
  invoices: {
    id: string;
    competencia: string | null;
    dueDate: string;
    valor: string;
    status: string;
  }[];
};

export default function FinanceiroPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<FinData>(
    ["membro", "financeiro"],
    "/api/membro/financeiro",
  );
  const [paying, setPaying] = useState<string | null>(null);
  const [editCard, setEditCard] = useState(false);
  const [cardForm, setCardForm] = useState<CardFormState>(emptyCreditCard());
  const [payCard, setPayCard] = useState<CardFormState>(emptyCreditCard());
  const [method, setMethod] = useState<"PIX" | "CREDIT_CARD" | "BOLETO">("PIX");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [pix, setPix] = useState<{ encodedImage?: string; payload?: string } | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);

  async function salvarCartao() {
    setError("");
    setMsg("");
    try {
      const res = await apiMutate<{ message?: string; cardLast4?: string }>(
        "/api/membro/financeiro/cartao",
        { method: "PATCH", body: JSON.stringify({ creditCard: cardForm }) },
      );
      setMsg(res.message ?? `Cartão final ${res.cardLast4} salvo.`);
      setCardForm(emptyCreditCard());
      setEditCard(false);
      await qc.invalidateQueries({ queryKey: ["membro", "financeiro"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    }
  }

  async function pagar(invoiceId: string) {
    setError("");
    setMsg("");
    setPix(null);
    setBoletoUrl(null);
    try {
      const res = await apiMutate<{
        message?: string;
        asaasSkipped?: boolean;
        pix?: { encodedImage?: string; payload?: string };
        boletoUrl?: string;
        paid?: boolean;
      }>("/api/membro/financeiro", {
        method: "POST",
        body: JSON.stringify({
          invoiceId,
          paymentMethod: method,
          creditCard: method === "CREDIT_CARD" ? payCard : undefined,
        }),
      });
      setMsg(res.message ?? (res.paid ? "Pagamento confirmado." : "Pagamento processado."));
      if (res.pix) setPix(res.pix);
      if (res.boletoUrl) setBoletoUrl(res.boletoUrl);
      setPayCard(emptyCreditCard());
      if (res.paid || res.asaasSkipped) setPaying(null);
      await qc.invalidateQueries({ queryKey: ["membro", "financeiro"] });
      await qc.invalidateQueries({ queryKey: ["membro", "dashboard"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    }
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {!data.asaasConfigured && (
        <p className="text-sm text-muted-foreground m-0">
          Sandbox local sem chave Asaas.
        </p>
      )}

      {data.addressComplete === false && (
        <Card className="p-4 border-warning/40">
          <p className="text-sm">
            Complete CNPJ, CEP e número do endereço no{" "}
            <Link href="/membro/perfil" className="font-semibold text-primary">
              perfil
            </Link>{" "}
            para pagar com cartão no Asaas.
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-xs text-muted-foreground uppercase">Status</div>
          <Badge className="mt-2" variant={data.emDia ? "success" : "warning"}>
            {data.emDia ? "Em dia" : "Pendente"}
          </Badge>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-muted-foreground uppercase">Total pago</div>
          <div className="font-mono text-xl font-extrabold mt-2">{data.totalPagoFmt}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-muted-foreground uppercase">Cartão</div>
          <div className="font-semibold mt-2">
            {data.cardLast4
              ? `${data.cardBrand ?? "Cartão"} final ${data.cardLast4}`
              : "Nenhum cartão cadastrado"}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => setEditCard(true)}
          >
            Alterar cartão
          </Button>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-display font-extrabold mb-4">Mensalidades</h2>
        <ul className="space-y-3">
          {data.invoices.map((inv) => (
            <li
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm"
            >
              <div>
                <div className="font-semibold">{inv.competencia}</div>
                <div className="text-muted-foreground text-xs">
                  Venc. {new Date(inv.dueDate).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <span className="font-mono">{inv.valor}</span>
              <Badge
                variant={
                  inv.status === "PAID"
                    ? "success"
                    : inv.status === "OVERDUE"
                      ? "destructive"
                      : "warning"
                }
              >
                {labelInvoiceStatus(inv.status)}
              </Badge>
              {(inv.status === "PENDING" || inv.status === "OVERDUE") && (
                <Button size="sm" onClick={() => setPaying(inv.id)}>
                  Pagar
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        open={editCard}
        onClose={() => setEditCard(false)}
        title="Alterar cartão"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditCard(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarCartao}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <CreditCardFields value={cardForm} onChange={setCardForm} />
          <PaymentTrust />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {msg ? <p className="text-sm text-success">{msg}</p> : null}
        </div>
      </Modal>

      <Modal
        open={Boolean(paying)}
        onClose={() => setPaying(null)}
        title="Pagar mensalidade"
        footer={
          <>
            <Button variant="outline" onClick={() => setPaying(null)}>
              Fechar
            </Button>
            <Button onClick={() => paying && pagar(paying)}>Confirmar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              {(["PIX", "CREDIT_CARD", "BOLETO"] as const).map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={method === m ? "default" : "outline"}
                  onClick={() => setMethod(m)}
                >
                  {labelPaymentMethod(m)}
                </Button>
              ))}
            </div>
            {method === "CREDIT_CARD" && (
              <CreditCardFields value={payCard} onChange={setPayCard} />
            )}
            <PaymentTrust />
            {pix && <PixResult encodedImage={pix.encodedImage} payload={pix.payload} />}
            {boletoUrl && (
              <a
                href={boletoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-primary"
              >
                Abrir boleto
              </a>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {msg && <p className="text-sm text-success">{msg}</p>}
        </div>
      </Modal>
    </div>
  );
}
