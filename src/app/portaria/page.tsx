"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckinCodeForm } from "@/components/checkin-code-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { signOut, useSession } from "next-auth/react";
import { labelRegistrationStatus } from "@/lib/labels";

type CheckinData = {
  event: { nome: string } | null;
  results: {
    id: string;
    nome: string;
    empresa: string;
    status: string;
    hostName: string | null;
    tipo: string;
    checkinCode: string;
  }[];
};

export default function PortariaPage() {
  const { data: session } = useSession();
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<CheckinData>(
    ["portaria", "checkin", q],
    `/api/admin/checkin?q=${encodeURIComponent(q)}`,
  );

  async function checkin(id: string) {
    setErr("");
    setMsg("");
    await apiMutate("/api/admin/checkin", {
      method: "POST",
      body: JSON.stringify({ registrationId: id }),
    });
    setMsg("Entrada registrada.");
    await qc.invalidateQueries({ queryKey: ["portaria", "checkin"] });
  }

  async function checkinByCode(code: string) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await apiMutate<{ message?: string; nome?: string; already?: boolean }>(
        "/api/admin/checkin",
        {
          method: "POST",
          body: JSON.stringify({ code }),
        },
      );
      setMsg(
        res.already
          ? `${res.nome ?? "Participante"} já tinha check-in.`
          : `${res.message ?? "Entrada registrada"}${res.nome ? `: ${res.nome}` : ""}`,
      );
      await qc.invalidateQueries({ queryKey: ["portaria", "checkin"] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha no check-in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <BrandMark lockup size="sm" />
          <p className="text-sm text-muted-foreground mt-1">
            Portaria · {session?.user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            Sair
          </Button>
        </div>
      </div>

      <Card className="p-5 space-y-4">
        <h1 className="font-display text-xl font-extrabold">
          {data?.event?.nome ?? "Portaria"}
        </h1>
        <CheckinCodeForm onSubmit={checkinByCode} loading={busy} />
        {msg && <p className="text-sm text-success">{msg}</p>}
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="border-t border-border pt-3">
          <Input
            placeholder="Buscar por nome ou empresa"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </Card>

      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-2">
          {data.results.map((r) => (
            <Card key={r.id} className="p-4 space-y-2">
              <div className="font-semibold">{r.nome}</div>
              <div className="text-xs text-muted-foreground">
                {r.empresa} · {r.tipo}
                {r.hostName ? ` · por ${r.hostName}` : ""}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {r.checkinCode}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    r.status === "CHECKED_IN"
                      ? "success"
                      : r.status === "CONFIRMED"
                        ? "ember"
                        : "secondary"
                  }
                >
                  {labelRegistrationStatus(r.status)}
                </Badge>
                {r.status === "CONFIRMED" && (
                  <Button size="sm" onClick={() => checkin(r.id)}>
                    Registrar entrada
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
