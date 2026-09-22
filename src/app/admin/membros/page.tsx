"use client";

import Link from "next/link";
import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { formatPoints, initials } from "@/lib/utils";

type MembrosData = {
  members: {
    id: string;
    nome: string | null;
    email: string;
    empresa: string;
    categoria: string;
    cidade: string | null;
    pontos: number;
    status: string;
    mensalidade: string;
    fotoUrl: string | null;
  }[];
  total: number;
};

export default function AdminMembrosPage() {
  const { data, isLoading } = useApiQuery<MembrosData>(
    ["admin", "membros"],
    "/api/admin/membros",
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Membros</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? "…" : `${data?.total ?? 0} na rede`}
          </p>
        </div>
        <Link
          href="/admin/convites-membro"
          className="inline-flex h-11 items-center rounded-md bg-brasa px-6 text-sm font-semibold text-white"
        >
          Gerar link de cadastro
        </Link>
      </div>

      {isLoading || !data ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data.members.map((m) => (
            <Link key={m.id} href={`/admin/membros/${m.id}`}>
              <Card className="p-4 flex flex-wrap items-center gap-4 hover:border-primary/40 transition-colors">
                {m.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.fotoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                    {initials(m.nome ?? m.empresa)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{m.nome}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {m.empresa} · {m.email} · {m.cidade}
                  </div>
                </div>
                <Badge>{m.categoria}</Badge>
                <span className="font-mono text-sm">{formatPoints(m.pontos)}</span>
                <Badge
                  variant={
                    m.status === "ACTIVE"
                      ? "success"
                      : m.status === "BLOCKED"
                        ? "destructive"
                        : "warning"
                  }
                >
                  {m.status}
                </Badge>
                <span className="text-sm font-mono">{m.mensalidade}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
