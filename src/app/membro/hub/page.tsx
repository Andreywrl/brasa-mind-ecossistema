"use client";

import { useState } from "react";
import Link from "next/link";
import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MemberAvatar } from "@/components/member-avatar";
import { labelCategory } from "@/lib/labels";
import {
  cn,
  formatPoints,
  memberBannerClass,
  memberCatBadgeClass,
} from "@/lib/utils";

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
  { value: "FUNDADOR", label: "Fundador" },
  { value: "PATROCINADOR", label: "Patrocinador" },
  { value: "MEMBRO", label: "Membro" },
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
  }>(["hub", q, cat, esp, cid], `/api/membro/hub?${params}`);

  const especialidades = (data?.especialidades ?? []).slice().sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const cidades = (data?.cidades ?? []).slice().sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );

  return (
    <div className="space-y-5">
      <Card className="space-y-3 p-4">
        <Input
          placeholder="Buscar por nome, empresa ou especialidade"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {CAT_CHIPS.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setCat(c.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold",
                cat === c.value
                  ? "bg-brasa text-white"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
        </div>
      </Card>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : (
        <div className="om-grid-3">
          {(data?.members ?? []).map((m) => (
            <Link
              key={m.id}
              href={`/membro/membros/${m.id}`}
              className="block overflow-hidden rounded-[var(--radius)] border border-border bg-card text-card-foreground no-underline shadow-sm transition-shadow hover:shadow-md"
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
                <span
                  className={cn(
                    "absolute right-3 top-3 rounded-full px-[9px] py-[3px] text-[11px] font-bold",
                    memberCatBadgeClass(m.categoria),
                  )}
                >
                  {labelCategory(m.categoria)}
                </span>
              </div>
              <div className="relative px-3 pb-3 pt-0">
                <div className="-mt-7 mb-2">
                  <MemberAvatar name={m.nome} src={m.fotoUrl} size="sm" />
                </div>
                <p className="font-display text-sm font-bold leading-tight">{m.nome}</p>
                <p className="text-xs text-muted-foreground">{m.empresa}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.especialidade ? (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {m.especialidade}
                    </span>
                  ) : null}
                  {m.cidade ? (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {m.cidade}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 border-t border-border pt-2 text-xs font-bold text-brasa">
                  {formatPoints(m.pontos)} pts
                </p>
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
