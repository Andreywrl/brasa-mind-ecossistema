"use client";

import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { formatPoints, initials } from "@/lib/utils";
import { use } from "react";

type HubMember = {
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
    whatsapp: string | null;
    telefone: string | null;
    instagram: string | null;
    linkedin: string | null;
    site: string | null;
    youtube: string | null;
    descricao: string | null;
    endereco: string | null;
    email: string;
  }[];
};

export default function MembroPerfilPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useApiQuery<HubMember>(
    ["membro", "hub"],
    "/api/membro/hub",
  );
  const m = data?.members.find((x) => x.id === id);

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!m) {
    return <Card className="p-8">Membro não encontrado.</Card>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          {m.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.fotoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-brasa text-white flex items-center justify-center text-xl font-bold">
              {initials(m.nome)}
            </div>
          )}
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-extrabold">{m.nome}</h1>
            <p className="text-muted-foreground">{m.empresa}</p>
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
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary rounded-xl p-3">
            <div className="text-xs text-muted-foreground">Pontos</div>
            <div className="font-mono font-bold">{formatPoints(m.pontos)}</div>
          </div>
          <div className="bg-secondary rounded-xl p-3">
            <div className="text-xs text-muted-foreground">Ranking</div>
            <div className="font-mono font-bold">{m.rank}º</div>
          </div>
          <div className="bg-secondary rounded-xl p-3">
            <div className="text-xs text-muted-foreground">Cidade</div>
            <div className="font-semibold text-sm">{m.cidade}</div>
          </div>
        </div>
        {m.descricao && (
          <p className="text-sm leading-relaxed text-muted-foreground">{m.descricao}</p>
        )}
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Especialidade: </span>
            {m.especialidade}
          </div>
          <div>
            <span className="text-muted-foreground">E-mail: </span>
            {m.email}
          </div>
          {m.whatsapp && (
            <a className="text-primary font-semibold" href={`https://wa.me/${m.whatsapp.replace(/\D/g, "")}`}>
              WhatsApp: {m.whatsapp}
            </a>
          )}
          {m.telefone && <div>Telefone: {m.telefone}</div>}
          {m.instagram && <div>Instagram: {m.instagram}</div>}
          {m.linkedin && <div>LinkedIn: {m.linkedin}</div>}
          {m.site && (
            <a className="text-primary font-semibold" href={`https://${m.site}`} target="_blank" rel="noreferrer">
              Site: {m.site}
            </a>
          )}
          {m.endereco && <div className="sm:col-span-2">Endereço: {m.endereco}</div>}
        </div>
        {m.youtube && (
          <a href={m.youtube} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
            Ver vídeo no YouTube
          </a>
        )}
      </Card>
    </div>
  );
}
