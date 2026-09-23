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
import { BrandMark } from "@/components/brand-mark";
import { PaymentTrust } from "@/components/payment-trust";
import { labelPaymentMethod } from "@/lib/labels";
import { EventGallery } from "@/components/event-gallery";

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
    capaUrl?: string | null;
    mapsUrl?: string | null;
  };
  priceCents: number;
  pastEvents: {
    id: string;
    nome: string;
    data: string;
    capaUrl: string | null;
    localShort?: string | null;
  }[];
  asaasConfigured: boolean;
};

const STEP_LABELS = ["Cadastro", "Pagamento", "Confirmação"];

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
  const [landing, setLanding] = useState(true);
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

  const mapsQuery = encodeURIComponent(data.event.local);
  const mapsUrl =
    data.event.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4 flex justify-between items-center">
        <BrandMark lockup size="sm" />
        <Link href="/" className="text-sm font-semibold text-muted-foreground">
          Já é membro? Entrar
        </Link>
      </header>

      {landing ? (
        <main className="mx-auto max-w-3xl space-y-8 p-6 pb-16">
          <Card className="p-5 flex items-center gap-3">
            {data.invite.hostFoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.invite.hostFoto}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-brasa text-white flex items-center justify-center font-bold">
                {initials(data.invite.hostName ?? "BM")}
              </div>
            )}
            <div>
              <div className="font-semibold">{data.invite.hostName}</div>
              <div className="text-sm text-muted-foreground">
                convidou você para o encontro do Brasamind
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="relative min-h-[230px] bg-secondary">
              {data.event.capaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.event.capaUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <span className="om-img-scrim om-img-scrim--hero" aria-hidden />
              <div className="om-img-over relative z-[2] space-y-3 p-6 text-white">
                <Badge variant="ember">Convite exclusivo</Badge>
                <h1 className="font-impact text-[38px] leading-[1.1]">{data.event.nome}</h1>
                <p className="text-sm text-white/85">
                  {new Date(data.event.data).toLocaleDateString("pt-BR")} · {data.event.hora}
                </p>
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/70">
                    Ingresso de convidado
                  </div>
                  <div className="font-mono text-2xl font-extrabold">
                    {formatCurrency(data.priceCents)}
                  </div>
                  <div className="text-xs text-white/75">acesso único ao evento</div>
                </div>
                <Button
                  className="h-11 bg-white text-brasa hover:bg-white/90"
                  onClick={() => setLanding(false)}
                >
                  Quero participar
                </Button>
              </div>
            </div>
          </Card>

          <section className="space-y-3">
            <h3 className="font-display font-extrabold text-lg">Local</h3>
            <p className="text-sm text-muted-foreground">
              {data.event.localShort ?? data.event.local}
            </p>
            <div className="om-map">
              <iframe
                title="Mapa do local do evento"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${mapsQuery}&z=15&output=embed`}
              />
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm font-semibold text-primary"
            >
              Abrir no Maps
            </a>
          </section>

          <section className="grid sm:grid-cols-3 gap-3">
            <Card className="p-4">
              <div className="font-display font-extrabold">Rede gaúcha</div>
              <p className="text-sm text-muted-foreground mt-1">
                Churrasco, palestra e networking com empresários gaúchos.
              </p>
            </Card>
            <Card className="p-4">
              <div className="font-display font-extrabold">Conexões reais</div>
              <p className="text-sm text-muted-foreground mt-1">
                Rodada estruturada para fechar negócios.
              </p>
            </Card>
            <Card className="p-4">
              <div className="font-display font-extrabold">Palestra + assado</div>
              <p className="text-sm text-muted-foreground mt-1">
                {data.event.palestrante
                  ? `${data.event.palestrante} e muito network, com comida no ponto.`
                  : "Palestra e network, com comida no ponto."}
              </p>
            </Card>
          </section>

          <EventGallery title="O que já rolou no Brasamind" events={data.pastEvents} />

          <footer className="border-t border-border pt-6 space-y-3 text-center text-sm text-muted-foreground">
            <BrandMark lockup size="md" className="mx-auto" />
            <p>contato@brasamind.com.br · @brasamind · Porto Alegre, RS</p>
          </footer>
        </main>
      ) : (
        <main className="max-w-xl mx-auto p-6 space-y-6">
          <button
            type="button"
            className="text-sm font-semibold text-muted-foreground"
            onClick={() => setLanding(true)}
          >
            ‹ Voltar para o convite
          </button>

          <div>
            <Badge variant="ember">Convite exclusivo</Badge>
            <h1 className="font-display text-2xl font-extrabold mt-2">{data.event.nome}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(data.event.data).toLocaleDateString("pt-BR")} · {data.event.hora} ·{" "}
              {data.event.localShort ?? data.event.local}
            </p>
            <p className="font-mono font-bold mt-3">{formatCurrency(data.priceCents)}</p>
          </div>

          <div className="flex gap-2">
            {STEP_LABELS.map((label, i) => {
              const s = i + 1;
              return (
                <div key={label} className="flex-1 text-center">
                  <div
                    className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      step >= s ? "bg-brasa text-white" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {s}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-muted-foreground">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <Card className="p-6 space-y-3">
              <h2 className="font-display font-extrabold">Seus dados</h2>
              <Label>Nome</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
              <Label>Empresa</Label>
              <Input
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              />
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
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
                onChange={(whatsapp) =>
                  setForm({ ...form, whatsapp: formatPhoneBr(whatsapp) })
                }
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
                    {labelPaymentMethod(m)}
                  </Button>
                ))}
              </div>
              {form.paymentMethod === "CREDIT_CARD" && (
                <CreditCardFields value={card} onChange={setCard} />
              )}
              <PaymentTrust />
              {!data.asaasConfigured && (
                <p className="text-xs text-muted-foreground">
                  Asaas desligado: confirmação local.
                </p>
              )}
              {err && <p className="text-sm text-destructive">{err}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
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
              <Link href="/quero-ser-membro/seed-membro-link" className="block">
                <Button variant="outline" className="w-full">
                  Quero ser Membro
                </Button>
              </Link>
            </Card>
          )}
        </main>
      )}
    </div>
  );
}
