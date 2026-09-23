"use client";

import { use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";
import { MemberAvatar } from "@/components/member-avatar";
import { labelCategory } from "@/lib/labels";
import {
  cn,
  formatPoints,
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
    <div className="mx-auto flex max-w-3xl flex-col gap-[22px]">
      <Link
        href="/membro/hub"
        className="inline-flex self-start text-[13px] font-semibold text-muted-foreground no-underline hover:text-foreground"
      >
        Voltar ao hub
      </Link>

      <Card className="overflow-hidden rounded-[20px] p-0">
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
          <div className="absolute left-8 -bottom-10">
            <MemberAvatar
              name={m.nome}
              src={m.fotoUrl}
              size="lg"
              className="ring-4 ring-card"
            />
          </div>
        </div>

        <div className="px-8 pb-7 pt-[52px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display m-0 text-[26px] font-extrabold leading-tight">
                {m.nome}
              </h1>
              <p className="m-0 mt-0.5 text-[15px] text-muted-foreground">
                {[m.empresa, m.especialidade].filter(Boolean).join(", ")}
              </p>
              {m.cidade ? (
                <p className="m-0 mt-0.5 text-sm text-muted-foreground">{m.cidade}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {mine ? (
                <Link
                  href="/membro/perfil"
                  className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground no-underline"
                >
                  Editar perfil
                </Link>
              ) : (
                <>
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-md bg-[#25D366] px-4 text-sm font-semibold text-white no-underline"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                  {ig ? (
                    <a
                      href={ig}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center rounded-md border border-border bg-transparent px-4 text-sm font-semibold no-underline"
                    >
                      Instagram
                    </a>
                  ) : null}
                  {web ? (
                    <a
                      href={web}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center rounded-md border border-border bg-transparent px-4 text-sm font-semibold no-underline"
                    >
                      Site
                    </a>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {m.descricao ? (
            <p className="mt-[18px] max-w-[640px] text-sm leading-relaxed text-muted-foreground">
              {m.descricao}
            </p>
          ) : null}

          <div className="mt-6">
            <div className="font-display mb-2.5 text-sm font-extrabold">
              Vídeo de apresentação
            </div>
            {yt ? (
              <div className="relative aspect-video overflow-hidden rounded-[14px] border border-border bg-[hsl(20_10%_5%)]">
                <iframe
                  src={yt}
                  title={`Vídeo de ${m.nome}`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-border bg-secondary px-6 text-center">
                <span className="text-[13px] text-muted-foreground">
                  Sem vídeo de apresentação ainda
                </span>
              </div>
            )}
          </div>

          <div className="om-grid-4 mt-6">
            <Kpi label="Pontuação" value={formatPoints(m.pontos)} />
            <Kpi label="Ranking" value={`${m.rank}º`} />
            <Kpi label="Eventos" value={String(m.eventos ?? 0)} />
            <Kpi label="Convidados" value={String(m.convidados ?? 0)} />
          </div>

          <div className="om-split mt-5 text-sm">
            {m.whatsapp ? (
              <ContactLink href={wa} label={m.whatsapp} />
            ) : null}
            {m.email ? (
              <ContactLink href={`mailto:${m.email}`} label={m.email} />
            ) : null}
            {m.instagram ? (
              <ContactLink href={ig} label={m.instagram} />
            ) : null}
            {m.site ? <ContactLink href={web} label={m.site} /> : null}
            {m.linkedin ? (
              <ContactLink href={li} label={m.linkedin} />
            ) : null}
            {m.endereco ? (
              <span className="text-muted-foreground">{m.endereco}</span>
            ) : null}
            {m.telefone ? (
              <ContactLink href={`tel:${m.telefone}`} label={m.telefone} />
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function ContactLink({
  href,
  label,
}: {
  href?: string | null;
  label: string;
}) {
  if (!href) {
    return <span>{label}</span>;
  }
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="min-w-0 truncate text-foreground no-underline hover:underline"
    >
      {label}
    </a>
  );
}
