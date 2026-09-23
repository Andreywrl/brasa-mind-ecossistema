"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ImageUploadField } from "@/components/image-upload-field";
import { Modal } from "@/components/ui/modal";
import toast from "react-hot-toast";
import { toastActionError } from "@/lib/action-toast";
import { Megaphone } from "lucide-react";

type OfferRow = {
  id: string;
  titulo: string;
  ativo: boolean;
  views: number;
  clicks: number;
  bannerUrl: string | null;
  tipoDestino: string;
  destino: string;
  destRotulo: string | null;
};

type OfertasData = {
  canOffer: boolean;
  mine: OfferRow[];
  totals: {
    views: number;
    clicks: number;
    count: number;
    ctr: number;
    activeCount: number;
  };
};

function fmtCtr(views: number, clicks: number) {
  if (views <= 0) return "0%";
  return `${((clicks / views) * 100).toFixed(1).replace(".", ",")}%`;
}

function destLabel(tipo: string) {
  if (tipo === "WHATSAPP") return "WhatsApp";
  if (tipo === "SITE") return "Site";
  if (tipo === "HUB_PROFILE") return "Perfil no Hub";
  return tipo;
}

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
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await apiMutate("/api/membro/ofertas", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Oferta publicada.");
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
      toastActionError(e, "Não foi possível salvar a oferta.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, ativo: boolean) {
    try {
      await apiMutate("/api/membro/ofertas", {
        method: "PATCH",
        body: JSON.stringify({ id, ativo: !ativo }),
      });
      toast.success(ativo ? "Oferta pausada." : "Oferta ativada.");
      await qc.invalidateQueries({ queryKey: ["membro", "ofertas"] });
    } catch (e) {
      toastActionError(e, "Não foi possível atualizar a oferta.");
    }
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const avgCtr =
    data.totals.views > 0
      ? `${(data.totals.ctr * 100).toFixed(1).replace(".", ",")}%`
      : "0%";
  const statusBadge =
    data.totals.activeCount > 0
      ? `${data.totals.activeCount} ativa${data.totals.activeCount > 1 ? "s" : ""}`
      : "Nenhuma ativa";

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="flex flex-wrap items-center justify-between gap-5 rounded-[18px] px-[26px] py-[22px]">
        <div className="flex min-w-[240px] flex-1 flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <span className="bg-brasa flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white">
              <Megaphone size={18} aria-hidden />
            </span>
            <h2 className="font-display m-0 text-xl font-extrabold">
              Área do Patrocinador e Apoiador
            </h2>
          </div>
          <p className="m-0 text-sm leading-relaxed text-muted-foreground">
            Suba até 3 banners de oferta para a sua empresa. Defina qual fica ativa: ela
            roda em destaque no Início, no Hub, nos Eventos e no Ranking para a rede se
            conectar direto com você.
          </p>
        </div>
        {data.canOffer && (
          <Button className="h-11 shrink-0" onClick={() => setOpen(true)}>
            Nova oferta
          </Button>
        )}
      </Card>

      {!data.canOffer && (
        <Card className="p-5 text-sm text-muted-foreground">
          Ofertas são exclusivas de Fundadores e Patrocinadores.
        </Card>
      )}

      <div className="om-grid-4">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Visualizações totais
          </div>
          <div className="font-mono mt-1.5 text-[26px] font-extrabold">
            {data.totals.views.toLocaleString("pt-BR")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">nas telas da rede</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Cliques recebidos
          </div>
          <div className="font-mono mt-1.5 text-[26px] font-extrabold text-primary">
            {data.totals.clicks.toLocaleString("pt-BR")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">contatos iniciados</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Taxa média (CTR)
          </div>
          <div className="font-mono mt-1.5 text-[26px] font-extrabold text-success">
            {avgCtr}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            conversão por visualização
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Status no ar
          </div>
          <div className="font-mono mt-2 text-xl font-extrabold leading-tight">
            {statusBadge}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {data.totals.count} de 3 cadastradas
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display m-0 text-lg font-extrabold">
            Minhas ofertas cadastradas
          </h2>
          <span className="text-sm text-muted-foreground">
            {data.totals.count} de 3 cadastradas
          </span>
        </div>

        {data.mine.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma oferta ainda.</p>
        ) : (
          data.mine.map((o) => (
            <Card key={o.id} className="overflow-hidden rounded-[18px] p-0">
              <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-border px-6 py-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant={o.ativo ? "default" : "secondary"}>
                    {o.ativo ? "Ativa na rede" : "Pausada"}
                  </Badge>
                  <Badge variant="secondary">{destLabel(o.tipoDestino)}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3.5 text-[13px]">
                  <span>
                    <strong className="font-mono text-[15px]">{o.views}</strong>{" "}
                    <span className="text-muted-foreground">views</span>
                  </span>
                  <span>
                    <strong className="font-mono text-[15px] text-primary">
                      {o.clicks}
                    </strong>{" "}
                    <span className="text-muted-foreground">cliques</span>
                  </span>
                  <span>
                    <strong className="font-mono text-[15px] text-success">
                      {fmtCtr(o.views, o.clicks)}
                    </strong>{" "}
                    <span className="text-muted-foreground">CTR</span>
                  </span>
                </div>
              </div>
              <div className="space-y-4 px-6 py-5">
                <div>
                  <h3 className="font-display m-0 text-[17px] font-extrabold leading-snug">
                    {o.titulo}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">
                    Destino do clique:{" "}
                    <strong className="font-mono text-foreground">
                      {o.destRotulo ?? o.destino}
                    </strong>
                  </p>
                </div>
                {o.bannerUrl && (
                  <div className="relative h-40 overflow-hidden rounded-xl border border-border bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={o.bannerUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-2.5">
                  <Button
                    variant={o.ativo ? "outline" : "default"}
                    onClick={() => toggleActive(o.id, o.ativo)}
                  >
                    {o.ativo ? "Pausar oferta" : "Publicar na rede"}
                  </Button>
                  {o.destino && (
                    <a href={o.destino} target="_blank" rel="noreferrer">
                      <Button variant="outline">Testar link</Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova oferta"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} loading={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
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
      </Modal>
    </div>
  );
}
