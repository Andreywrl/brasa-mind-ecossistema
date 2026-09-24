"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { Info } from "lucide-react";
import toast from "react-hot-toast";

const SUPPORT_WA =
  "https://wa.me/5551999990000?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20o%20Brasamind.";

function pathAfterLogin(email: string) {
  const requested = new URLSearchParams(window.location.search).get("next") ?? "/membro";
  const next = requested.startsWith("/") ? requested : "/membro";
  if (
    email.includes("@brasamind.com.br") &&
    !email.startsWith("portaria") &&
    !email.startsWith("apoio")
  ) {
    return "/admin";
  }
  if (email.startsWith("portaria") || email.startsWith("apoio")) {
    return "/portaria";
  }
  return next;
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"login" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);
  const [credsOpen, setCredsOpen] = useState(false);
  const googleOn = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1";
  const showDemoCreds = process.env.NODE_ENV === "development";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("E-mail ou senha inválidos.");
      return;
    }
    router.push(pathAfterLogin(email));
    router.refresh();
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setResetSent(true);
    toast.success("Se o e-mail existir, você receberá as instruções.");
  }

  return (
    <div className="om-login-split bg-background text-foreground">
      <aside className="relative hidden min-[900px]:flex flex-col justify-between overflow-hidden bg-brasa px-14 py-14 text-white">
        <img
          src="/brand/simbolo-branco.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-16 -bottom-10 w-[420px] opacity-[0.12]"
        />
        <div className="relative flex items-center">
          <BrandMark variant="white" lockup size="lg" />
        </div>
        <div className="relative">
          <h1 className="font-impact text-[clamp(34px,3.6vw,52px)] leading-[1.05]">
            Conecte.
            <br />
            Indique.
            <br />
            Feche mais negócios.
          </h1>
          <p className="mt-4 max-w-[400px] text-[17px] leading-relaxed text-white/90">
            O Brasamind conecta empresários gaúchos em encontros com muito churrasco,
            palestra e networking.
          </p>
        </div>
        <div className="relative flex gap-7 text-white">
          <div>
            <div className="font-impact text-[30px]">128</div>
            <div className="text-[13px] opacity-85">membros</div>
          </div>
          <div>
            <div className="font-impact text-[30px]">4</div>
            <div className="text-[13px] opacity-85">anos de rede</div>
          </div>
          <div>
            <div className="font-impact text-[30px]">48</div>
            <div className="text-[13px] opacity-85">eventos realizados</div>
          </div>
        </div>
      </aside>

      <main className="relative flex flex-col justify-center px-6 py-10 sm:px-14">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-col gap-[22px]">
          <div className="min-[900px]:hidden">
            <BrandMark lockup size="sm" />
          </div>

          {view === "login" ? (
            <>
              <div>
                <h2 className="font-display text-[28px] font-extrabold tracking-tight">
                  Bem-vindo de volta
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Entre com seu e-mail ou escolha um acesso rápido.
                </p>
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password">Senha</Label>
                    <button
                      type="button"
                      className="min-h-11 text-xs font-semibold text-primary"
                      onClick={() => setView("reset")}
                    >
                      Esqueci a senha
                    </button>
                  </div>
                  <div className="om-pwd">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="pr-24"
                      required
                    />
                    <button
                      type="button"
                      className="om-pwd-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>
                <div className="flex items-stretch gap-2.5">
                  <Button
                    type="submit"
                    classNameLi="h-[46px] flex-1 glow-ember"
                    loading={loading}
                  >
                    {loading ? "Entrando…" : "Entrar"}
                  </Button>
                  {showDemoCreds && (
                    <button
                      type="button"
                      className="om-icon-btn h-[46px] w-[46px] shrink-0"
                      aria-label="Credenciais de demonstração"
                      title="Credenciais de demonstração"
                      onClick={() => setCredsOpen(true)}
                    >
                      <Info size={20} />
                    </button>
                  )}
                </div>
              </form>

              {googleOn && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">ou</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-[46px] w-full gap-2.5 rounded-xl bg-white text-[#1f1f1f]"
                    onClick={() => signIn("google", { callbackUrl: "/membro" })}
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    Continuar com Google
                  </Button>
                </>
              )}

              <p className="text-center text-xs text-muted-foreground">
                <a
                  href={SUPPORT_WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold"
                >
                  Suporte no WhatsApp
                </a>
              </p>
            </>
          ) : (
            <form onSubmit={onReset} className="flex flex-col gap-5">
              <button
                type="button"
                className="self-start text-[13px] font-semibold text-muted-foreground"
                onClick={() => {
                  setView("login");
                  setResetSent(false);
                }}
              >
                ‹ Voltar para entrar
              </button>
              <div>
                <h2 className="font-display text-[26px] font-extrabold tracking-tight">
                  Redefinir senha
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Informe seu e-mail. Enviamos um link para você criar uma nova senha.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">E-mail cadastrado</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="voce@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {resetSent && (
                <Card className="p-4 text-sm text-muted-foreground">
                  Se o e-mail existir, você receberá as instruções. Sem provedor de e-mail
                  configurado, o token fica só no banco.
                </Card>
              )}
              <Button type="submit" className="h-[46px] w-full glow-ember" loading={loading}>
                {loading ? "Enviando…" : "Enviar link por e-mail"}
              </Button>
            </form>
          )}
        </div>
      </main>

      {credsOpen && showDemoCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <Card className="w-full max-w-md space-y-3 p-6 text-sm">
            <h3 className="font-display text-lg font-extrabold">Credenciais de demonstração</h3>
            <p className="text-muted-foreground">
              Membro: joao@silvaalimentos.com.br / membro123
            </p>
            <p className="text-muted-foreground">
              Admin: carla@brasamind.com.br / admin123
            </p>
            <Button type="button" className="w-full" onClick={() => setCredsOpen(false)}>
              Fechar
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return <LoginForm />;
}
