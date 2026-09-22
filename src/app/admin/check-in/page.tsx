"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckinCodeForm } from "@/components/checkin-code-form";

type CheckinData = {
  event: { nome: string } | null;
  results: {
    id: string;
    nome: string;
    empresa: string;
    email: string;
    tipo: string;
    status: string;
    hostName: string | null;
    checkinCode: string;
  }[];
};

export default function AdminCheckinPage() {
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<CheckinData>(
    ["admin", "checkin", q],
    `/api/admin/checkin?q=${encodeURIComponent(q)}`,
  );

  async function checkin(id: string) {
    await apiMutate("/api/admin/checkin", {
      method: "POST",
      body: JSON.stringify({ registrationId: id }),
    });
    await qc.invalidateQueries({ queryKey: ["admin", "checkin"] });
  }

  async function checkinByCode(code: string) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await apiMutate<{ message?: string; nome?: string; already?: boolean }>(
        "/api/admin/checkin",
        { method: "POST", body: JSON.stringify({ code }) },
      );
      setMsg(
        res.already
          ? `${res.nome ?? "Participante"} já tinha check-in.`
          : `${res.message ?? "OK"}${res.nome ? `: ${res.nome}` : ""}`,
      );
      await qc.invalidateQueries({ queryKey: ["admin", "checkin"] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Check-in</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data?.event?.nome ?? "Sem evento ativo"}
        </p>
      </div>

      <Card className="p-5 space-y-3">
        <CheckinCodeForm onSubmit={checkinByCode} loading={busy} />
        {msg && <p className="text-sm text-success">{msg}</p>}
        {err && <p className="text-sm text-destructive">{err}</p>}
      </Card>

      <Input
        placeholder="Buscar nome, empresa, e-mail ou código"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-2">
          {data.results.map((r) => (
            <Card key={r.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
              <div>
                <div className="font-semibold">{r.nome}</div>
                <div className="text-xs text-muted-foreground">
                  {r.empresa} · {r.tipo}
                  {r.hostName ? ` · convidado por ${r.hostName}` : ""}
                </div>
                <div className="font-mono text-[11px] text-muted-foreground mt-1">
                  {r.checkinCode}
                </div>
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
                  {r.status}
                </Badge>
                {r.status === "CONFIRMED" && (
                  <Button size="sm" onClick={() => checkin(r.id)}>
                    Check-in
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
