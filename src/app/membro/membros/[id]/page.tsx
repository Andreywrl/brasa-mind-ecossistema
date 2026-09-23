"use client";

import { use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";
import { labelCategory } from "@/lib/labels";
import {
  cn,
  formatPoints,
  initials,
  instagramUrl,
  linkedinUrl,
  memberBannerClass,
  memberCatBadgeClass,
  siteUrl,
  waMeUrl,
  youtubeEmbedUrl,
} from "@/lib/utils";

type Member = {
  id: string;
  userId: string;
  nome: string;
  empresa: string;
  especialidade: string | null;
  cidade: string | null;
  categoria: string;
  fotoUrl: string | null;
  capaUrl: string | null;
  pontos: number;
  rank: number;
  eventos?: number;
  convidados?: number;
  whatsapp: string | null;
  instagram: string | null;
  linkedin: string | null;
  site: string | null;
  telefone: string | null;
  youtube: string | null;
  descricao: string | null;
  endereco: string | null;
  email: string | null;
};

export default function PublicMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { data, isLoading } = useApiQuery<{ members: Member[] }>(
    ["hub-all"],
    "/api/membro/hub",
  );
  const m = data?.members.find((x) => x.id === id);
  const mine = Boolean(m && session?.user?.id && m.userId === session.user.id);
  const yt = youtubeEmbedUrl(m?.youtube);
  const wa = waMeUrl(m?.whatsapp);
  const ig = instagramUrl(m?.instagram);
  const web = siteUrl(m?.site);
  const li = linkedinUrl(m?.linkedin);

  if (isLoading) return <Skeleton className="h-80" />;
  if (!m) return <p>Membro não encontrado.</p>;

  return (
    <div className="space-y-4">
      <Link
        href="/membro/hub"
        className="inline-flex text-sm font-semibold text-muted-foreground no-underline hover:text-foreground"
      >
        Voltar ao hub
      </Link>

      <Card className="overflow-hidden p-0">
        <div
          className={cn("relative h-[130px]", memberBannerClass(m.categoria))}
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
              "absolute right-6 top-5 rounded-full px-[13px] py-[5px] text-xs font-bold",
              memberCatBadgeClass(m.categoria),
            )}
          >
            {labelCategory(m.categoria)}
          </span>
        </div>
        <div className="relative px-6 pb-6">
          <div className="-mt-[52px] mb-3">
            {m.fotoUrl ? (
              <span className="om-face om-face-lg ring-4 ring-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.fotoUrl} alt="" />
              </span>
            ) : (
              <span className="om-face om-face-lg flex items-center justify-center bg-secondary font-display text-xl font-bold text-muted-foreground ring-4 ring-card">
                {initials(m.nome)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight">{m.nome}</h1>
              <p className="text-sm text-muted-foreground">{m.empresa}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {[m.especialidade, m.cidade].filter(Boolean).join(" · ")}
              </p>
            </div>
            {mine ? (
              <Link
                href="/membro/perfil"
                className="inline-flex h-9 items-center rounded-md bg-secondary px-4 text-xs font-semibold no-underline"
              >
                Editar perfil
              </Link>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center rounded-md bg-[#25D366] px-3 text-sm font-bold text-white no-underline"
              >
                WhatsApp
              </a>
            ) : null}
            {ig ? (
              <a
                href={ig}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center rounded-md bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-3 text-sm font-bold text-white no-underline"
              >
                Instagram
              </a>
            ) : null}
            {web ? (
              <a
                href={web}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-bold no-underline"
              >
                Site
              </a>
            ) : null}
          </div>

          {m.descricao ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {m.descricao}
            </p>
          ) : null}
        </div>
      </Card>

      {yt ? (
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-video w-full">
            <iframe
              src={yt}
              title={`Vídeo de ${m.nome}`}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          Este membro ainda não publicou um vídeo no perfil.
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Pontos" value={formatPoints(m.pontos)} />
        <Kpi label="Ranking" value={`${m.rank}º`} />
        <Kpi label="Eventos" value={String(m.eventos ?? 0)} />
        <Kpi label="Convidados" value={String(m.convidados ?? 0)} />
      </div>

      <Card className="space-y-2 p-4 text-sm">
        {m.email ? <ContactRow label="E-mail" value={m.email} href={`mailto:${m.email}`} /> : null}
        {m.telefone ? <ContactRow label="Telefone" value={m.telefone} href={`tel:${m.telefone}`} /> : null}
        {m.whatsapp ? (
          <ContactRow label="WhatsApp" value={m.whatsapp} href={wa || undefined} />
        ) : null}
        {m.instagram ? (
          <ContactRow label="Instagram" value={m.instagram} href={ig || undefined} />
        ) : null}
        {m.linkedin ? (
          <ContactRow label="LinkedIn" value={m.linkedin} href={li || undefined} />
        ) : null}
        {m.site ? <ContactRow label="Site" value={m.site} href={web || undefined} /> : null}
        {m.endereco ? <ContactRow label="Endereço" value={m.endereco} /> : null}
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3 text-center">
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </Card>
  );
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex justify-between gap-3 border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
  if (!href) return inner;
  return (
    <a href={href} target={href.startsWith("mailto") || href.startsWith("tel") ? undefined : "_blank"} rel="noreferrer" className="block no-underline text-inherit">
      {inner}
    </a>
  );
}
