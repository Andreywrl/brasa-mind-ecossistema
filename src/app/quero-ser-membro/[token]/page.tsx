"use client";

import { use, useState } from "react";
import { useApiQuery, apiMutate } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { MaskedInput } from "@/components/masked-input";
import { AddressFields, type AddressForm } from "@/components/address-fields";
import {
  CreditCardFields,
  emptyCreditCard,
  type CardFormState,
} from "@/components/credit-card-fields";
import { PixResult } from "@/components/pix-result";
import { formatCnpj, formatPhoneBr } from "@/lib/br";
import { BrandMark } from "@/components/brand-mark";
import { PaymentTrust } from "@/components/payment-trust";
import { labelPaymentMethod } from "@/lib/labels";
import { EventGallery } from "@/components/event-gallery";

type SignupData = {
  invite: { token: string; categoria: string };
  pastEvents: {
    id: string;
    nome: string;
    data: string;
    capaUrl: string | null;
    localShort: string | null;
  }[];
  membershipCents: number;
  asaasConfigured: boolean;
};

const BENEFITS = [
  "Acesso ao encontro presencial do mês, com preço de membro",
  "Hub de membros: sua empresa visível para a rede toda",
  "Convites para levar convidados e ganhar pontos",
  "Ranking, medalhas e prêmios no encerramento do ano",
  "Preço de ingresso reduzido em todos os eventos",
];

const STATS = [
  { value: "128", label: "membros" },
  { value: "4", label: "anos de rede" },
  { value: "48", label: "eventos realizados" },
  { value: "30+", label: "conexões por encontro" },
];

const STEP_LABELS = ["Você", "Empresa", "Pagamento", "Pronto"];

export default function QueroSerMembroPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { data, isLoading, error } = useApiQuery<SignupData>(
    ["signup", token],
    `/api/signup/${token}`,
  );
  const [landing, setLanding] = useState(true);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    password: "",
    empresa: "",
    cnpj: "",
    especialidade: "",
    paymentMethod: "PIX" as "PIX" | "CREDIT_CARD" | "BOLETO",
  });
  const [address, setAddress] = useState<AddressForm>({
    cep: "",
    endereco: "",
    addressNumber: "",
    addressComplement: "",
    bairro: "",
    cidade: "",
  });
  const [card, setCard] = useState<CardFormState>(emptyCreditCard());
  const [terms, setTerms] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<{ encodedImage?: string; payload?: string } | null>(null);

  async function submit() {
    setLoading(true);
    setErr("");
    try {
      const res = await apiMutate<{
        asaasSkipped?: boolean;
        pix?: { encodedImage?: string; payload?: string };
      }>("/api/signup/" + token, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          ...address,
          creditCard:
            form.paymentMethod === "CREDIT_CARD" ? card : undefined,
        }),
      });
      setMsg(
        res.asaasSkipped
          ? "Conta criada em modo local (Asaas desligado)."
          : "Assinatura iniciada. Entrando…",
      );
      if (res.pix) setPix(res.pix);
      setCard(emptyCreditCard());
      setStep(4);
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro no cadastro");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 max-w-xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md space-y-3">
          <h1 className="font-display text-xl font-extrabold">Link inválido</h1>
          <p className="text-sm text-muted-foreground">
            Novos membros entram só por link criado no painel administrativo.
          </p>
          <Link href="/">
            <Button variant="outline">Ir para entrar</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const price = formatCurrency(data.membershipCents);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4 flex justify-between items-center">
        <BrandMark lockup size="sm" />
        <Link href="/" className="text-sm font-semibold text-muted-foreground">
          Já é membro? Entrar
        </Link>
      </header>

      {landing ? (
        <main className="mx-auto max-w-5xl space-y-12 p-6 pb-16">
          <section className="relative overflow-hidden rounded-3xl bg-brasa px-6 py-14 text-white sm:px-12">
            <img
              src="/brand/simbolo-branco.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-10 -bottom-8 w-72 opacity-[0.12]"
            />
            <h1 className="font-impact relative text-4xl sm:text-6xl leading-[1.02]">
              Entre para o Brasamind
            </h1>
            <p className="relative mt-4 max-w-xl text-base sm:text-lg text-white/90">
              Empresários gaúchos que conectam, indicam e fecham negócios. Um encontro por mês,
              rede o ano inteiro. Mensalidade de {price}.
            </p>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <Button
                className="h-12 bg-white text-brasa hover:bg-white/90"
                onClick={() => {
                  setLanding(false);
                  document.getElementById("cadastro")?.scrollIntoView();
                }}
              >
                Quero ser Membro
              </Button>
              <Link href="/">
                <Button variant="outline" className="h-12 border-white/40 bg-transparent text-white">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Assista
              </div>
              <h2 className="font-display text-2xl font-extrabold mt-1">
                Como o Brasa conecta empresários gaúchos
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                2 minutos para entender a rede, ver quem já faz parte e como fechar negócios no
                ecossistema.
              </p>
            </div>
            <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-secondary flex items-center justify-center text-sm text-muted-foreground">
              Thumbnail da VSL
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-4 text-center"
              >
                <div className="font-impact text-2xl">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </section>

          <EventGallery
            title="O que você vai viver todo mês"
            events={data.pastEvents}
          />

          <section id="plano" className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Investimento
              </div>
              <h2 className="font-display text-2xl font-extrabold mt-1">
                Entre na rede por {price}/mês
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-xl font-extrabold">Plano Membro</span>
              <Badge variant="ember">Recorrente</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {price}/mês, no cartão ou PIX
            </p>
            <ul className="space-y-2">
              {BENEFITS.map((b) => (
                <li key={b} className="text-sm flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button
              className="h-12 glow-ember"
              onClick={() => {
                setLanding(false);
                window.setTimeout(() => {
                  document.getElementById("cadastro")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
            >
              Quero ser Membro
            </Button>
            <p className="text-xs text-muted-foreground">Sem fidelidade. Cancele quando quiser.</p>
          </section>
        </main>
      ) : (
        <main id="cadastro" className="max-w-xl mx-auto p-6 space-y-6">
          <button
            type="button"
            className="text-sm font-semibold text-muted-foreground"
            onClick={() => setLanding(true)}
          >
            ‹ Voltar para a apresentação
          </button>
          <div>
            <Badge variant="ember">Convite do admin</Badge>
            <h1 className="font-display text-2xl font-extrabold mt-2">Quero ser membro</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Mensalidade {price} · categoria {data.invite.categoria}
              {!data.asaasConfigured && " · Asaas desligado (modo local)"}
            </p>
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              <MaskedInput
                label="WhatsApp"
                mask="phone"
                value={form.whatsapp}
                onChange={(whatsapp) =>
                  setForm({ ...form, whatsapp: formatPhoneBr(whatsapp) })
                }
                required
              />
              <Label>Senha</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
              <Button className="w-full" onClick={() => setStep(2)}>
                Continuar para sua empresa
              </Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6 space-y-3">
              <h2 className="font-display font-extrabold">Sua empresa</h2>
              <Label>Nome da empresa</Label>
              <Input
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              />
              <MaskedInput
                label="CNPJ"
                mask="cnpj"
                value={form.cnpj}
                onChange={(cnpj) => setForm({ ...form, cnpj: formatCnpj(cnpj) })}
                required
              />
              <Label>Especialidade</Label>
              <Input
                value={form.especialidade}
                onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
              />
              <AddressFields value={address} onChange={setAddress} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continuar para pagamento
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-6 space-y-3">
              <h2 className="font-display font-extrabold">Assinatura mensal</h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plano Membro</span>
                <span className="font-mono">{price} /mês</span>
              </div>
              <div className="flex gap-2">
                {(["CREDIT_CARD", "PIX", "BOLETO"] as const).map((m) => (
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
              <PaymentTrust caption="Pagamento 100% seguro, processado pela Asaas" />
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Li e aceito os{" "}
                  <Link href="/termos" className="font-semibold text-foreground">
                    Termos
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" className="font-semibold text-foreground">
                    Privacidade
                  </Link>
                  , e autorizo a cobrança recorrente mensal.
                </span>
              </label>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!terms || loading}
                  onClick={submit}
                >
                  {loading ? "Assinando…" : "Assinar e entrar no Brasa"}
                </Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-8 text-center space-y-4">
              <Badge variant="ember">Membro</Badge>
              <h2 className="font-display text-2xl font-extrabold">Bem-vindo ao Brasa!</h2>
              <p className="text-sm text-muted-foreground">{msg}</p>
              <div className="text-left rounded-xl border border-border p-4 space-y-2 text-sm">
                <div className="font-semibold">Próximos passos</div>
                <p className="text-muted-foreground">
                  Complete seu perfil, confira o evento do mês e comece a indicar parceiros.
                </p>
              </div>
              {pix && <PixResult encodedImage={pix.encodedImage} payload={pix.payload} />}
              <Link href="/membro">
                <Button className="w-full">Ir para minha área</Button>
              </Link>
            </Card>
          )}
        </main>
      )}
    </div>
  );
}
