"use client";

import { useState } from "react";
import Link from "next/link";
import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MemberAvatar } from "@/components/member-avatar";
import { OfferHighlight } from "@/components/ranking-podium";
import { labelCategory } from "@/lib/labels";
import {
  cn,
  formatPoints,
  memberBannerClass,
  memberCatBadgeClass,
} from "@/lib/utils";
import { Search } from "lucide-react";

type Member = {
  id: string;
  nome: string;
  empresa: string;
  especialidade: string | null;
  cidade: string | null;
  categoria: string;
  fotoUrl: string | null;
  capaUrl: string | null;
  pontos: number;
};

const CAT_CHIPS = [
  { value: "", label: "Todas" },
  { value: "FUNDADOR", label: "Fundadores" },
  { value: "PATROCINADOR", label: "Patrocinadores" },
  { value: "MEMBRO", label: "Membros" },
];

export default function HubPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [esp, setEsp] = useState("");
  const [cid, setCid] = useState("");
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (cat) params.set("cat", cat);
  if (esp) params.set("especialidade", esp);
  if (cid) params.set("cidade", cid);
  const { data, isLoading } = useApiQuery<{
    members: Member[];
    especialidades: string[];
    cidades: string[];
    offer: {
      id?: string;
      titulo: string;
      bannerUrl: string | null;
      destRotulo?: string | null;
      destino?: string | null;
      member?: { user?: { name?: string | null } | null } | null;
    } | null;
    activeOffers?: {
      id?: string;
      titulo: string;
      bannerUrl: string | null;
      destRotulo?: string | null;
      destino?: string | null;
      member?: { user?: { name?: string | null } | null } | null;
    }[];
    total: number;
  }>(["hub", q, cat, esp, cid], `/api/membro/hub?${params}`);

  const especialidades = (data?.especialidades ?? []).slice().sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const cidades = (data?.cidades ?? []).slice().sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const hasFilters = Boolean(q || cat || esp || cid);

  return (
    <div className="space-y-[22px]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="hub-busca"
            placeholder="Buscar por nome, empresa ou especialidade"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CAT_CHIPS.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setCat(c.value)}
              className={cn(
                "om-chip rounded-[9px] border border-border px-4 py-2.5 text-[13px] font-semibold",
                cat === c.value
                  ? "bg-secondary text-foreground"
                  : "bg-transparent text-muted-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <select
          className="h-10 w-[210px] rounded-[10px] border border-border bg-card px-3 text-sm"
          value={esp}
          onChange={(e) => setEsp(e.target.value)}
          aria-label="Especialidade"
        >
          <option value="">Todas as especialidades</option>
          {especialidades.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="h-10 w-[190px] rounded-[10px] border border-border bg-card px-3 text-sm"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          aria-label="Cidade"
        >
          <option value="">Todas as cidades</option>
          {cidades.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat("");
              setEsp("");
              setCid("");
            }}
            className="border-0 bg-transparent text-[13px] font-semibold text-primary"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <p className="m-0 text-[13px] text-muted-foreground">
        Ordenado por categoria (fundadores, patrocinadores, membros) e pontuação.{" "}
        <span className="font-mono">{data?.total ?? data?.members?.length ?? 0}</span>{" "}
        membros.
      </p>

      {data?.activeOffers?.length ? (
        <OfferHighlight offers={data.activeOffers} />
      ) : data?.offer ? (
        <OfferHighlight offer={data.offer} />
      ) : null}

      {isLoading ? (
        <div className="om-grid-3">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      ) : (
        <div className="om-grid-3">
          {(data?.members ?? []).map((m) => (
            <Link
              key={m.id}
              href={`/membro/membros/${m.id}`}
              className="om-lift block overflow-hidden rounded-2xl border border-border bg-card no-underline"
            >
              <div
                className={cn("relative h-14", memberBannerClass(m.categoria))}
                style={
                  m.capaUrl
                    ? {
                        backgroundImage: `url(${m.capaUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                <span className="absolute left-4 top-[34px]">
                  <MemberAvatar
                    name={m.nome}
                    src={m.fotoUrl}
                    size="sm"
                    className="!h-[52px] !w-[52px]"
                  />
                </span>
                <span
                  className={cn(
                    "absolute right-3 top-3 rounded-full px-[9px] py-[3px] text-[11px] font-bold",
                    memberCatBadgeClass(m.categoria),
                  )}
                >
                  {labelCategory(m.categoria)}
                </span>
              </div>
              <div className="flex flex-col gap-2.5 px-[18px] pb-[18px] pt-8">
                <div>
                  <div className="font-display text-base font-extrabold">{m.nome}</div>
                  <div className="text-[13px] text-muted-foreground">{m.empresa}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m.especialidade && (
                    <span className="rounded-full bg-secondary px-[9px] py-[3px] text-[11px] font-semibold">
                      {m.especialidade}
                    </span>
                  )}
                  {m.cidade && (
                    <span className="rounded-full bg-secondary px-[9px] py-[3px] text-[11px] font-semibold text-muted-foreground">
                      {m.cidade}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Pontuação</span>
                  <span className="font-mono text-sm font-bold">
                    {formatPoints(m.pontos)} pts
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && (data?.members ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum membro com esses filtros. Amplie a busca para conectar com a rede.
        </p>
      ) : null}
    </div>
  );
}
