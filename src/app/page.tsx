"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/badge";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/membro";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"login" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);
  const googleOn = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    // Route by role via session check on destination
    if (email.includes("@brasamind.com.br") && !email.startsWith("portaria") && !email.startsWith("apoio")) {
      router.push("/admin");
    } else if (email.startsWith("portaria") || email.startsWith("apoio")) {
      router.push("/portaria");
    } else {
      router.push(next.startsWith("/") ? next : "/membro");
    }
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
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="relative hidden lg:flex flex-col justify-between p-12 bg-brasa text-white overflow-hidden">
        <img
          src="/brand/simbolo-branco.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-16 -bottom-10 w-[420px] opacity-[0.12]"
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <img
              src="/brand/simbolo-branco.png"
              alt="Brasamind"
              className="h-10 w-auto"
            />
            <span className="font-impact text-3xl tracking-wide">Brasamind</span>
          </div>
          <p className="mt-3 text-white/85 max-w-sm">
            Empreendedorismo, churrasco e network gaúcho. Conecte, indique e feche negócios.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-6">
          <div>
            <div className="font-impact text-3xl">9</div>
            <div className="text-sm opacity-85">membros no seed</div>
          </div>
          <div>
            <div className="font-impact text-3xl">4</div>
            <div className="text-sm opacity-85">anos de Brasa</div>
          </div>
          <div>
            <div className="font-impact text-3xl">1</div>
            <div className="text-sm opacity-85">encontro / mês</div>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-3 lg:hidden">
            <img
              src="/brand/simbolo-laranja.png"
              alt="Brasamind"
              className="h-9 w-auto"
            />
            <span className="font-impact text-2xl text-brasa">Brasamind</span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">
              {view === "login" ? "Entrar no Brasa" : "Recuperar senha"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {view === "login"
                ? "Acesse sua área de membro, o painel ou a portaria."
                : "Enviamos um link para o e-mail cadastrado (quando o envio estiver configurado)."}
            </p>
          </div>

          {view === "login" ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando…" : "Entrar"}
              </Button>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setView("reset")}
              >
                Esqueci a senha
              </button>
              {googleOn && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("google", { callbackUrl: "/membro" })}
                >
                  Continuar com Google
                </Button>
              )}
            </form>
          ) : (
            <form onSubmit={onReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-mail</Label>
                <Input
                  id="reset-email"
                  type="email"
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
              <Button type="submit" className="w-full" disabled={loading}>
                Enviar link
              </Button>
              <button
                type="button"
                className="text-sm text-muted-foreground"
                onClick={() => setView("login")}
              >
                Voltar ao login
              </button>
            </form>
          )}

          {process.env.NODE_ENV === "development" && (
            <Card className="p-4 space-y-2 text-sm">
              <div className="font-semibold">Contas do seed</div>
              <p className="text-muted-foreground">
                Membro: joao@silvaalimentos.com.br / membro123
              </p>
              <p className="text-muted-foreground">
                Admin: carla@brasamind.com.br / admin123
              </p>
              <p className="text-muted-foreground">
                Cadastro:{" "}
                <Link className="text-primary font-semibold" href="/quero-ser-membro/seed-membro-link">
                  link do admin
                </Link>
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
