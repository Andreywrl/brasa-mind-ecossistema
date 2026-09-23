"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { ImageUploadField } from "@/components/image-upload-field";
import { StarRating } from "@/components/star-rating";
import { Modal } from "@/components/ui/modal";
import {
  labelRegistrationStatus,
  labelRegistrationType,
} from "@/lib/labels";
import toast from "react-hot-toast";
import { toastActionError } from "@/lib/action-toast";

type Review = {
  stars: number;
  comment: string | null;
  author: { name: string | null; email: string } | null;
};

type EventosData = {
  active: {
    id: string;
    nome: string;
    data: string;
    hora: string;
    local: string;
    vagas: number;
    capaUrl: string | null;
    _count: { registrations: number };
    prices: { tier: string; amountCents: number; label: string }[];
    registrations: {
      id: string;
      type: string;
      status: string;
      ticketCents: number;
      member: { user: { name: string | null }; empresa: string } | null;
      guest: { nome: string; empresa: string | null } | null;
    }[];
  } | null;
  past: {
    id: string;
    nome: string;
    data: string;
    localShort: string | null;
    _count: { registrations: number };
    review: Review | null;
  }[];
};

export default function AdminEventosPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<EventosData>(
    ["admin", "eventos"],
    "/api/admin/eventos",
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    data: "",
    hora: "19h00",
    local: "",
    localShort: "",
    descricao: "",
    palestrante: "",
    capaUrl: "",
    vagas: 120,
    ativo: true,
  });
  const [saving, setSaving] = useState(false);

  async function create() {
    setSaving(true);
    try {
      await apiMutate("/api/admin/eventos", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Evento criado.");
      setOpen(false);
      setForm({
        nome: "",
        data: "",
        hora: "19h00",
        local: "",
        localShort: "",
        descricao: "",
        palestrante: "",
        capaUrl: "",
        vagas: 120,
        ativo: true,
      });
      await qc.invalidateQueries({ queryKey: ["admin", "eventos"] });
    } catch (e) {
      toastActionError(e, "Não foi possível criar o evento.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Eventos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Uma capa por evento. Sem galeria de fotos. A nota do encontro é do membro.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Novo evento</Button>
      </div>

      {data.active ? (
        <Card className="overflow-hidden">
          {data.active.capaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.active.capaUrl} alt="" className="h-48 w-full object-cover" />
          )}
          <div className="p-5 space-y-3">
            <Badge variant="ember">Ativo</Badge>
            <h2 className="font-impact text-[32px] leading-[1.1]">{data.active.nome}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date(data.active.data).toLocaleDateString("pt-BR")} · {data.active.hora} ·{" "}
              {data.active.local}
            </p>
            <p className="text-sm font-semibold">
              {data.active._count.registrations} inscritos · {data.active.vagas} vagas
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {data.active.prices.map((p) => (
                <div
                  key={p.tier}
                  className="flex justify-between bg-secondary rounded-lg px-3 py-2"
                >
                  <span>{p.label}</span>
                  <span className="font-mono">
                    {p.amountCents === 0 ? "Cortesia" : formatCurrency(p.amountCents)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <h3 className="font-semibold mb-2">Participantes</h3>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {data.active.registrations.map((r) => (
                  <li
                    key={r.id}
                    className="flex justify-between text-sm border-b border-border pb-2"
                  >
                    <span>
                      {r.member?.user.name ?? r.guest?.nome} ·{" "}
                      {r.member?.empresa ?? r.guest?.empresa} (
                      {labelRegistrationType(r.type)})
                    </span>
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
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">Nenhum evento ativo.</Card>
      )}

      <Card className="p-5">
        <h2 className="font-display font-extrabold mb-3">Anteriores</h2>
        <ul className="space-y-3">
          {data.past.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-3 text-sm border-b border-border pb-3"
            >
              <div className="min-w-0">
                <div className="font-semibold">
                  {e.nome} · {new Date(e.data).toLocaleDateString("pt-BR")}
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  {e._count.registrations} inscritos
                  {e.localShort ? ` · ${e.localShort}` : ""}
                </div>
                <div className="mt-2">
                  {e.review ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <StarRating value={e.review.stars} readOnly size={16} />
                      {e.review.author?.name && (
                        <span className="text-xs text-muted-foreground">
                          por {e.review.author.name}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Sem nota dos membros
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo evento"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={create} loading={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <Label>Data</Label>
            <Input
              type="datetime-local"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
            />
            <Label>Hora (rótulo)</Label>
            <Input
              value={form.hora}
              onChange={(e) => setForm({ ...form, hora: e.target.value })}
            />
            <Label>Local</Label>
            <Input
              value={form.local}
              onChange={(e) => setForm({ ...form, local: e.target.value })}
            />
            <Label>Local curto</Label>
            <Input
              value={form.localShort}
              onChange={(e) => setForm({ ...form, localShort: e.target.value })}
            />
            <ImageUploadField
              label="Capa"
              value={form.capaUrl}
              onChange={(capaUrl) => setForm({ ...form, capaUrl })}
              folder="events/capas"
            />
            <Label>Descrição</Label>
            <Textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              />
              Tornar ativo
            </label>
        </div>
      </Modal>
    </div>
  );
}
