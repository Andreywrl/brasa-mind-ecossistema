"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ImageUploadField } from "@/components/image-upload-field";

type OfertasData = {
  canOffer: boolean;
  mine: {
    id: string;
    titulo: string;
    ativo: boolean;
    views: number;
    clicks: number;
    bannerUrl: string | null;
    tipoDestino: string;
    destino: string;
    destRotulo: string | null;
  }[];
  totals: { views: number; clicks: number; count: number };
};

export default function OfertasPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<OfertasData>(
    ["membro", "ofertas"],
    "/api/membro/ofertas",
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    tipoDestino: "WHATSAPP" as "WHATSAPP" | "SITE" | "HUB_PROFILE",
    destino: "",
    destRotulo: "",
    bannerUrl: "",
    ativo: false,
  });
  const [error, setError] = useState("");

  async function save() {
    setError("");
    try {
      await apiMutate("/api/membro/ofertas", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setOpen(false);
      setForm({
        titulo: "",
        tipoDestino: "WHATSAPP",
        destino: "",
        destRotulo: "",
        bannerUrl: "",
        ativo: false,
      });
      await qc.invalidateQueries({ queryKey: ["membro", "ofertas"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    }
  }

  async function toggleActive(id: string, ativo: boolean) {
    await apiMutate("/api/membro/ofertas", {
      method: "PATCH",
      body: JSON.stringify({ id, ativo: !ativo }),
    });
    await qc.invalidateQueries({ queryKey: ["membro", "ofertas"] });
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">
            Área do Patrocinador e Apoiador
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Até 3 banners. Uma oferta ativa por vez.
          </p>
        </div>
        {data.canOffer && (
          <Button onClick={() => setOpen(true)}>Nova oferta</Button>
        )}
      </div>

      {!data.canOffer && (
        <Card className="p-5 text-sm text-muted-foreground">
          Ofertas são exclusivas de Fundadores e Patrocinadores.
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Cadastradas</div>
          <div className="font-mono text-2xl font-extrabold">{data.totals.count}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Views</div>
          <div className="font-mono text-2xl font-extrabold">{data.totals.views}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Cliques</div>
          <div className="font-mono text-2xl font-extrabold">{data.totals.clicks}</div>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-display font-extrabold">Minhas ofertas</h2>
        {data.mine.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma oferta ainda.</p>
        ) : (
          data.mine.map((o) => (
            <Card key={o.id} className="p-4 flex flex-wrap items-center gap-4">
              {o.bannerUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.bannerUrl} alt="" className="h-16 w-28 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{o.titulo}</div>
                <div className="text-xs text-muted-foreground">
                  {o.views} views · {o.clicks} cliques · {o.destRotulo ?? o.destino}
                </div>
              </div>
              <Badge variant={o.ativo ? "success" : "secondary"}>
                {o.ativo ? "Ativa" : "Pausada"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => toggleActive(o.id, o.ativo)}>
                {o.ativo ? "Pausar" : "Ativar"}
              </Button>
            </Card>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-lg p-6 space-y-3">
            <h3 className="font-display font-extrabold text-lg">Nova oferta</h3>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
              <Label>Tipo de destino</Label>
              <select
                className="h-11 w-full rounded-xl border border-border bg-secondary px-3 text-sm"
                value={form.tipoDestino}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tipoDestino: e.target.value as typeof form.tipoDestino,
                  })
                }
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SITE">Site</option>
                <option value="HUB_PROFILE">Perfil no Hub</option>
              </select>
              <Label>Destino (URL ou wa.me)</Label>
              <Input
                value={form.destino}
                onChange={(e) => setForm({ ...form, destino: e.target.value })}
              />
              <Label>Rótulo</Label>
              <Input
                value={form.destRotulo}
                onChange={(e) => setForm({ ...form, destRotulo: e.target.value })}
              />
              <ImageUploadField
                label="Banner"
                value={form.bannerUrl}
                onChange={(bannerUrl) => setForm({ ...form, bannerUrl })}
                folder="offers/banners"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                />
                Ativar agora
              </label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={save}>Salvar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
