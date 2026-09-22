"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPoints, initials } from "@/lib/utils";

type HubData = {
  members: {
    id: string;
    nome: string;
    empresa: string;
    especialidade: string | null;
    cidade: string | null;
    categoria: string;
    pontos: number;
    fotoUrl: string | null;
    rank: number;
  }[];
  especialidades: string[];
  cidades: string[];
  total: number;
  offer: { titulo: string; bannerUrl: string | null; destino: string } | null;
};

export default function HubPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todos");
  const [esp, setEsp] = useState("");
  const [cidade, setCidade] = useState("");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cat !== "todos") p.set("cat", cat);
    if (esp) p.set("especialidade", esp);
    if (cidade) p.set("cidade", cidade);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [q, cat, esp, cidade]);

  const { data, isLoading } = useApiQuery<HubData>(
    ["membro", "hub", q, cat, esp, cidade],
    `/api/membro/hub${qs}`,
  );

  const chips = [
    { id: "todos", label: "Todos" },
    { id: "fundadores", label: "Fundadores" },
    { id: "patrocinadores", label: "Patrocinadores" },
    { id: "membros", label: "Membros" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Hub de membros</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ordenado por categoria e pontuação. Conecte e indique parceiros.
        </p>
      </div>

      {data?.offer && (
        <Card className="overflow-hidden">
          {data.offer.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.offer.bannerUrl}
              alt=""
              className="h-36 w-full object-cover"
            />
          )}
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="font-semibold">{data.offer.titulo}</div>
            <a
              href={data.offer.destino}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-primary"
            >
              Abrir oferta
            </a>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border border-border ${
              cat === c.id ? "bg-secondary text-foreground" : "text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Input
          placeholder="Buscar nome, empresa…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="h-11 rounded-xl border border-border bg-secondary px-3 text-sm"
          value={esp}
          onChange={(e) => setEsp(e.target.value)}
        >
          <option value="">Especialidade</option>
          {(data?.especialidades ?? []).map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-xl border border-border bg-secondary px-3 text-sm"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        >
          <option value="">Cidade</option>
          {(data?.cidades ?? []).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        {isLoading ? "…" : `${data?.total ?? 0} membros`}
      </p>

      {isLoading || !data ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.members.map((m) => (
            <Link key={m.id} href={`/membro/membros/${m.id}`}>
              <Card className="p-4 om-lift h-full space-y-3">
                <div className="flex items-center gap-3">
                  {m.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.fotoUrl}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-brasa text-white flex items-center justify-center text-sm font-bold">
                      {initials(m.nome)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{m.nome}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {m.empresa}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={
                      m.categoria === "FUNDADOR"
                        ? "default"
                        : m.categoria === "PATROCINADOR"
                          ? "ember"
                          : "secondary"
                    }
                  >
                    {m.categoria}
                  </Badge>
                  <span className="font-mono text-sm">
                    {formatPoints(m.pontos)} pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {m.especialidade} · {m.cidade}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
