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

type SignupData = {
  invite: { token: string; categoria: string };
  pastEvents: { id: string; nome: string; data: string; capaUrl: string | null; localShort: string | null }[];
  membershipCents: number;
  asaasConfigured: boolean;
};

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

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4 flex justify-between items-center">
        <div className="font-impact text-xl text-brasa">Brasamind</div>
        <Link href="/" className="text-sm font-semibold text-muted-foreground">
          Já é membro? Entrar
        </Link>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6">
        <div>
          <Badge variant="ember">Convite do admin</Badge>
          <h1 className="font-display text-2xl font-extrabold mt-2">
            Quero ser membro
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mensalidade {formatCurrency(data.membershipCents)} · categoria{" "}
            {data.invite.categoria}
            {!data.asaasConfigured && " · Asaas desligado (modo local)"}
          </p>
        </div>

        {data.pastEvents.length > 0 && step === 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {data.pastEvents.map((e) => (
              <Card key={e.id} className="min-w-[220px] overflow-hidden">
                {e.capaUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.capaUrl} alt="" className="h-28 w-full object-cover" />
                )}
                <div className="p-3">
                  <div className="font-semibold text-sm">{e.nome}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.data).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex gap-2 text-xs font-semibold">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                step >= s ? "bg-brasa text-white" : "bg-secondary text-muted-foreground"
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="p-6 space-y-3">
            <h2 className="font-display font-extrabold">Seus dados</h2>
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Label>E-mail</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
            <MaskedInput
              label="WhatsApp"
              mask="phone"
              value={form.whatsapp}
              onChange={(whatsapp) => setForm({ ...form, whatsapp: formatPhoneBr(whatsapp) })}
              required
            />
            <Label>Senha</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
            <Button className="w-full" onClick={() => setStep(2)}>
              Continuar para sua empresa
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 space-y-3">
            <h2 className="font-display font-extrabold">Sua empresa</h2>
            <Label>Nome da empresa</Label>
            <Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
            <MaskedInput
              label="CNPJ"
              mask="cnpj"
              value={form.cnpj}
              onChange={(cnpj) => setForm({ ...form, cnpj: formatCnpj(cnpj) })}
              required
            />
            <Label>Especialidade</Label>
            <Input value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} />
            <AddressFields value={address} onChange={setAddress} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
              <Button className="flex-1" onClick={() => setStep(3)}>Continuar para pagamento</Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6 space-y-3">
            <h2 className="font-display font-extrabold">Assinatura mensal</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plano Membro</span>
              <span className="font-mono">{formatCurrency(data.membershipCents)} /mês</span>
            </div>
            <div className="flex gap-2">
              {(["CREDIT_CARD", "PIX", "BOLETO"] as const).map((m) => (
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
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1" />
              <span>
                Li e aceito os{" "}
                <Link href="/termos" className="font-semibold text-foreground">Termos</Link> e a{" "}
                <Link href="/privacidade" className="font-semibold text-foreground">Privacidade</Link>.
              </span>
            </label>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
              <Button className="flex-1" disabled={!terms || loading} onClick={submit}>
                {loading ? "Assinando…" : "Assinar e entrar no Brasa"}
              </Button>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card className="p-8 text-center space-y-4">
            <h2 className="font-display text-2xl font-extrabold">Bem-vindo ao Brasa!</h2>
            <p className="text-sm text-muted-foreground">{msg}</p>
            {pix && <PixResult encodedImage={pix.encodedImage} payload={pix.payload} />}
            <Link href="/membro">
              <Button className="w-full">Ir para minha área</Button>
            </Link>
          </Card>
        )}
      </main>
    </div>
  );
}
