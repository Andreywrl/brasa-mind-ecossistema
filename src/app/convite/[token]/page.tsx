"use client";

import { use, useState } from "react";
import { useApiQuery, apiMutate } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatCurrency, initials } from "@/lib/utils";
import Link from "next/link";
import { MaskedInput } from "@/components/masked-input";
import {
  CreditCardFields,
  emptyCreditCard,
  type CardFormState,
} from "@/components/credit-card-fields";
import { PixResult } from "@/components/pix-result";
import { TicketQr } from "@/components/ticket-qr";
import { formatCep, formatCpf, formatPhoneBr } from "@/lib/br";

type GuestData = {
  invite: {
    hostName: string | null;
    hostFoto: string | null;
    hostEmpresa: string;
    message: string | null;
  };
  event: {
    nome: string;
    data: string;
    hora: string;
    localShort: string | null;
    local: string;
    palestrante: string | null;
  };
  priceCents: number;
  pastEvents: { id: string; nome: string; data: string; capaUrl: string | null }[];
  asaasConfigured: boolean;
};

export default function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { data, isLoading, error } = useApiQuery<GuestData>(
    ["guest", token],
    `/api/guest/${token}`,
  );
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    email: "",
    whatsapp: "",
    cpf: "",
    cep: "",
    addressNumber: "",
    paymentMethod: "PIX" as "PIX" | "CREDIT_CARD" | "BOLETO",
  });
  const [card, setCard] = useState<CardFormState>(emptyCreditCard());
  const [code, setCode] = useState("");
  const [pix, setPix] = useState<{ encodedImage?: string; payload?: string } | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    setErr("");
    try {
      const res = await apiMutate<{
        code: string;
        asaasSkipped?: boolean;
        pix?: { encodedImage?: string; payload?: string };
        paid?: boolean;
      }>(`/api/guest/${token}`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          creditCard:
            form.paymentMethod === "CREDIT_CARD" ? card : undefined,
        }),
      });
      setCode(res.code);
      if (res.pix) setPix(res.pix);
      setCard(emptyCreditCard());
      setStep(3);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 max-w-xl mx-auto">
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8">Convite inválido.</Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4 flex justify-between">
        <div className="font-impact text-xl text-brasa">Brasamind</div>
        <Link href="/" className="text-sm font-semibold text-muted-foreground">
          Entrar
        </Link>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6">
        <Card className="p-5 flex items-center gap-3">
          {data.invite.hostFoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.invite.hostFoto} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-brasa text-white flex items-center justify-center font-bold">
              {initials(data.invite.hostName ?? "BM")}
            </div>
          )}
          <div>
            <div className="font-semibold">{data.invite.hostName}</div>
            <div className="text-xs text-muted-foreground">{data.invite.hostEmpresa}</div>
          </div>
        </Card>

        <div>
          <Badge variant="ember">Convite para o evento</Badge>
          <h1 className="font-display text-2xl font-extrabold mt-2">{data.event.nome}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(data.event.data).toLocaleDateString("pt-BR")} · {data.event.hora} ·{" "}
            {data.event.localShort ?? data.event.local}
          </p>
          {data.event.palestrante && (
            <p className="text-sm mt-2">Palestra com {data.event.palestrante}</p>
          )}
          <p className="font-mono font-bold mt-3">{formatCurrency(data.priceCents)}</p>
        </div>

        {step === 1 && (
          <Card className="p-6 space-y-3">
            <h2 className="font-display font-extrabold">Seus dados</h2>
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Label>Empresa</Label>
            <Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
            <Label>E-mail</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <MaskedInput
              label="CPF"
              mask="cpf"
              value={form.cpf}
              onChange={(cpf) => setForm({ ...form, cpf: formatCpf(cpf) })}
              required
            />
            <MaskedInput
              label="WhatsApp"
              mask="phone"
              value={form.whatsapp}
              onChange={(whatsapp) => setForm({ ...form, whatsapp: formatPhoneBr(whatsapp) })}
            />
            <MaskedInput
              label="CEP"
              mask="cep"
              value={form.cep}
              onChange={(cep) => setForm({ ...form, cep: formatCep(cep) })}
              required
            />
            <Label>Número do endereço</Label>
            <Input
              value={form.addressNumber}
              onChange={(e) => setForm({ ...form, addressNumber: e.target.value })}
            />
            <Button className="w-full" onClick={() => setStep(2)}>
              Continuar para pagamento
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 space-y-3">
            <h2 className="font-display font-extrabold">Pagamento</h2>
            <div className="flex gap-2">
              {(["PIX", "CREDIT_CARD", "BOLETO"] as const).map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={form.paymentMethod === m ? "default" : "outline"}
                  onClick={() => setForm({ ...form, paymentMethod: m })}
                >
                  {m === "CREDIT_CARD" ? "Cartão" : m}
                </Button>
              ))}
            </div>
            {form.paymentMethod === "CREDIT_CARD" && (
              <CreditCardFields value={card} onChange={setCard} />
            )}
            {!data.asaasConfigured && (
              <p className="text-xs text-muted-foreground">
                Asaas desligado: confirmação local.
              </p>
            )}
            {err && <p className="text-sm text-destructive">{err}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
              <Button className="flex-1" disabled={loading} onClick={pay}>
                {loading ? "Confirmando…" : "Confirmar pagamento"}
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-8 space-y-4">
            <h2 className="font-display text-2xl font-extrabold text-center">
              Presença confirmada!
            </h2>
            {pix && <PixResult encodedImage={pix.encodedImage} payload={pix.payload} />}
            {code && <TicketQr code={code} label="Apresente este QR na portaria" />}
          </Card>
        )}
      </main>
    </div>
  );
}
