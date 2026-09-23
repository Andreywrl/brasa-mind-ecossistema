"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/member-avatar";
import { formatPoints } from "@/lib/utils";

export type PodiumMember = {
  id: string;
  nome: string;
  empresa?: string | null;
  especialidade?: string | null;
  pontos: number;
  fotoUrl: string | null;
  rank: number;
};

function Slot({
  member,
  place,
  large,
}: {
  member?: PodiumMember;
  place: 1 | 2 | 3;
  large?: boolean;
}) {
  const medal =
    place === 1 ? "om-medal-gold" : place === 2 ? "om-medal-silver" : "om-medal-bronze";
  const pedestalH = place === 1 ? "h-[134px] bg-brasa" : place === 2 ? "h-24" : "h-[74px]";
  const numberColor =
    place === 1 ? "text-white" : place === 2 ? "text-muted-foreground" : "text-[hsl(24_55%_56%)]";
  const numberSize = place === 1 ? "text-[52px]" : place === 2 ? "text-[40px]" : "text-4xl";

  return (
    <div className={`flex flex-col items-center gap-2.5 ${large ? "w-[184px]" : "w-[168px]"}`}>
      {member ? (
        <Link href={`/membro/membros/${member.id}`} className="flex flex-col items-center gap-2.5">
          <div className={large ? "om-podium-photo om-podium-photo-lg" : "om-podium-photo"}>
            <MemberAvatar
              name={member.nome}
              src={member.fotoUrl}
              size={large ? "lg" : "md"}
              className="!h-full !w-full !ring-0"
            />
            <span className={`om-medal ${medal}`} aria-hidden />
          </div>
          <div className="text-center">
            <div className="font-display font-extrabold text-[15px] max-w-[160px] truncate">
              {member.nome}
            </div>
            {member.empresa && (
              <div className="text-xs text-muted-foreground max-w-[160px] truncate">
                {member.empresa}
              </div>
            )}
            <div className="font-mono text-[13px] mt-0.5">
              {formatPoints(member.pontos)} pts
            </div>
          </div>
        </Link>
      ) : (
        <div className="opacity-40 flex flex-col items-center gap-2">
          <div className={large ? "om-podium-photo om-podium-photo-lg" : "om-podium-photo"}>
            <div className="h-full w-full rounded-full bg-secondary" />
            <span className={`om-medal ${medal}`} aria-hidden />
          </div>
        </div>
      )}
      <div
        className={`w-full rounded-t-xl flex items-center justify-center border border-b-0 border-border ${pedestalH} ${place !== 1 ? "bg-secondary" : ""}`}
      >
        <span className={`font-impact ${numberSize} ${numberColor}`}>{place}</span>
      </div>
    </div>
  );
}

export function RankingPodium({ rank }: { rank: PodiumMember[] }) {
  const first = rank.find((r) => r.rank === 1) ?? rank[0];
  const second = rank.find((r) => r.rank === 2) ?? rank[1];
  const third = rank.find((r) => r.rank === 3) ?? rank[2];

  if (rank.length === 0) return null;

  return (
    <Card className="px-6 pt-7 pb-0 overflow-hidden">
      <div className="flex items-end justify-center gap-4 sm:gap-[18px]">
        <Slot member={second} place={2} />
        <Slot member={first} place={1} large />
        <Slot member={third} place={3} />
      </div>
    </Card>
  );
}

type OfferCard = {
  id?: string;
  titulo: string;
  bannerUrl?: string | null;
  destRotulo?: string | null;
  destino?: string | null;
  member?: { user?: { name?: string | null } | null } | null;
};

function trackOffer(id: string | undefined, type: "view" | "click") {
  if (!id) return;
  void fetch("/api/membro/ofertas/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, type }),
  }).catch(() => undefined);
}

export function OfferHighlight({
  offer,
  offers,
}: {
  offer?: OfferCard | null;
  offers?: OfferCard[] | null;
}) {
  const list = (offers?.length ? offers : offer ? [offer] : []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const current = list[list.length ? index % list.length : 0];

  useEffect(() => {
    if (current?.id) trackOffer(current.id, "view");
  }, [current?.id]);

  if (dismissed || !current) return null;

  const multi = list.length > 1;
  const num = list.length ? (index % list.length) + 1 : 1;

  function go(delta: number) {
    if (!multi) return;
    setIndex((i) => (i + delta + list.length) % list.length);
  }

  function onCta() {
    trackOffer(current.id, "click");
    if (!current.destino) setDismissed(true);
  }

  return (
    <Card className="om-offer-slot overflow-hidden p-0">
      <div className="om-offer-img-box relative bg-secondary">
        {current.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Oferta da rede
          </div>
        )}
        <Badge variant="ember" className="absolute left-3 top-3 z-[2]">
          ★ Oferta
        </Badge>
        {multi ? (
          <div className="absolute right-3 top-3 z-[2] flex items-center gap-1.5 rounded-lg border border-border bg-card/90 px-2 py-1">
            <button
              type="button"
              aria-label="Oferta anterior"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border"
              onClick={() => go(-1)}
            >
              ‹
            </button>
            <span className="font-mono text-xs text-muted-foreground">
              {num} / {list.length}
            </span>
            <button
              type="button"
              aria-label="Próxima oferta"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border"
              onClick={() => go(1)}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
      <div className="space-y-3 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ofertas da rede: conecte com quem patrocina o Brasamind
          </div>
          <h3 className="font-display text-lg font-extrabold mt-1">{current.titulo}</h3>
          {current.member?.user?.name && (
            <p className="text-sm text-muted-foreground mt-1">
              {current.member.user.name}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {current.destino ? (
            <a
              href={current.destino}
              target="_blank"
              rel="noreferrer"
              onClick={onCta}
            >
              <Button>{current.destRotulo || "Aproveitar oferta"}</Button>
            </a>
          ) : (
            <Button type="button" onClick={onCta}>
              Aproveitar oferta
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
