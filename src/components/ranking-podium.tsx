"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPoints, initials } from "@/lib/utils";

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
            {member.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.fotoUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-brasa text-sm font-bold text-white">
                {initials(member.nome)}
              </div>
            )}
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
  titulo: string;
  bannerUrl?: string | null;
  destRotulo?: string | null;
  destino?: string | null;
  member?: { user?: { name?: string | null } | null } | null;
};

export function OfferHighlight({ offer }: { offer: OfferCard | null | undefined }) {
  const [open, setOpen] = useState(true);
  if (!offer || !open) return null;

  return (
    <Card className="om-offer-slot overflow-hidden p-0">
      <div className="om-offer-img-box relative bg-secondary">
        {offer.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={offer.bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Oferta da rede
          </div>
        )}
        <Badge variant="ember" className="absolute left-3 top-3 z-[2]">
          ★ Oferta
        </Badge>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ofertas da rede: conecte com quem patrocina o Brasa
          </div>
          <h3 className="font-display text-lg font-extrabold mt-1">{offer.titulo}</h3>
          {offer.member?.user?.name && (
            <p className="text-sm text-muted-foreground mt-1">
              {offer.member.user.name}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {offer.destino ? (
            <a href={offer.destino} target="_blank" rel="noreferrer">
              <Button>{offer.destRotulo || "Aproveitar oferta"}</Button>
            </a>
          ) : (
            <Button type="button" onClick={() => setOpen(false)}>
              Aproveitar oferta
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
