"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type InvitesData = {
  invites: {
    id: string;
    token: string;
    link: string;
    categoria: string;
    maxUses: number;
    usedCount: number;
    active: boolean;
    createdAt: string;
    createdBy: { name: string | null };
  }[];
};

export default function AdminConvitesMembroPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<InvitesData>(
    ["admin", "membership-invites"],
    "/api/admin/membership-invites",
  );
  const [categoria, setCategoria] = useState("MEMBRO");
  const [maxUses, setMaxUses] = useState(1);
  const [emailTo, setEmailTo] = useState("");
  const [msg, setMsg] = useState("");
  const [emailNote, setEmailNote] = useState("");

  async function create() {
    const res = await apiMutate<{
      invite: { link: string };
      emailSent?: boolean;
    }>("/api/admin/membership-invites", {
      method: "POST",
      body: JSON.stringify({
        categoria,
        maxUses,
        emailTo: emailTo.trim() || undefined,
      }),
    });
    setMsg(res.invite.link);
    setEmailNote(
      emailTo.trim()
        ? res.emailSent
          ? `E-mail enviado para ${emailTo}.`
          : "Link gerado. E-mail não enviado (Resend desligado ou falha)."
        : "",
    );
    setEmailTo("");
    await qc.invalidateQueries({ queryKey: ["admin", "membership-invites"] });
  }

  async function toggle(id: string, active: boolean) {
    await apiMutate("/api/admin/membership-invites", {
      method: "PATCH",
      body: JSON.stringify({ id, active: !active }),
    });
    await qc.invalidateQueries({ queryKey: ["admin", "membership-invites"] });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Links de cadastro</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Novos membros entram só por estes links. Membros não cadastram outros membros.
        </p>
      </div>

      <Card className="p-5 space-y-3">
        <Label>Categoria</Label>
        <select
          className="h-11 w-full rounded-xl border border-border bg-secondary px-3 text-sm"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="MEMBRO">Membro</option>
          <option value="PATROCINADOR">Patrocinador</option>
          <option value="FUNDADOR">Fundador</option>
        </select>
        <Label>Usos máximos</Label>
        <Input
          type="number"
          min={1}
          value={maxUses}
          onChange={(e) => setMaxUses(Number(e.target.value))}
        />
        <Label>Enviar por e-mail (opcional)</Label>
        <Input
          type="email"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          placeholder="nome@empresa.com.br"
        />
        <Button onClick={create}>Gerar link</Button>
        {msg && (
          <code className="block text-xs break-all bg-secondary rounded-xl p-3">
            {msg}
          </code>
        )}
        {emailNote && (
          <p className="text-sm text-muted-foreground">{emailNote}</p>
        )}
      </Card>

      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {data.invites.map((i) => (
            <Card key={i.id} className="p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <Badge variant={i.active ? "success" : "secondary"}>
                  {i.active ? "Ativo" : "Inativo"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {i.categoria} · {i.usedCount}/{i.maxUses} usos · por{" "}
                  {i.createdBy.name}
                </span>
              </div>
              <code className="block text-xs break-all">{i.link}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggle(i.id, i.active)}
              >
                {i.active ? "Desativar" : "Reativar"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
