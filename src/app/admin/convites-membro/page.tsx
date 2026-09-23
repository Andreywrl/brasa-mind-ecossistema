"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ActionMenu } from "@/components/ui/action-menu";

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
  const [formOpen, setFormOpen] = useState(false);
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
    setFormOpen(false);
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Links de cadastro</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Novos membros entram só por estes links. Membros não cadastram outros membros.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>Gerar link</Button>
      </div>

      {msg ? (
        <Card className="flex flex-col gap-2 p-4">
          <p className="text-sm font-semibold">Link gerado</p>
          <code className="block break-all rounded-xl bg-secondary p-3 text-xs">{msg}</code>
          {emailNote ? (
            <p className="text-sm text-muted-foreground">{emailNote}</p>
          ) : null}
        </Card>
      ) : null}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Gerar link de cadastro"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={create}>Gerar link</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
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
        </div>
      </Modal>

      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {data.invites.map((i) => (
            <Card key={i.id} className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={i.active ? "success" : "secondary"}>
                    {i.active ? "Ativo" : "Inativo"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {i.categoria} · {i.usedCount}/{i.maxUses} usos · por{" "}
                    {i.createdBy.name}
                  </span>
                </div>
                <ActionMenu
                  label="Ações do link"
                  items={[
                    {
                      label: i.active ? "Desativar" : "Reativar",
                      onSelect: () => toggle(i.id, i.active),
                    },
                  ]}
                />
              </div>
              <code className="block break-all text-xs">{i.link}</code>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
