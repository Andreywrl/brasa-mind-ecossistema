"use client";

import { useState } from "react";
import { apiMutate } from "@/lib/api-client";
import { Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await apiMutate("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setMsg("Senha atualizada. Você já pode entrar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    }
  }

  return (
    <Card className="p-8 max-w-md w-full space-y-4">
      <h1 className="font-display text-xl font-extrabold">Nova senha</h1>
      <form onSubmit={submit} className="space-y-3">
        <Label>Nova senha</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {msg && <p className="text-sm text-success">{msg}</p>}
        <Button type="submit" className="w-full">
          Salvar senha
        </Button>
      </form>
      <Link href="/" className="text-sm font-semibold text-primary">
        Ir para entrar
      </Link>
    </Card>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
