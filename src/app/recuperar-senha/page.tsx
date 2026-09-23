"use client";

import { useState } from "react";
import { apiMutate } from "@/lib/api-client";
import { Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import toast from "react-hot-toast";
import { toastActionError } from "@/lib/action-toast";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiMutate("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      toast.success("Senha atualizada. Você já pode entrar.");
    } catch (err) {
      toastActionError(err, "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
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
        <Button type="submit" className="w-full" loading={loading}>
          {loading ? "Salvando…" : "Salvar senha"}
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <BrandMark lockup size="md" />
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
