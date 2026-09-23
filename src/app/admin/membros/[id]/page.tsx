"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { formatPoints } from "@/lib/utils";
import {
  labelCategory,
  labelInvoiceKind,
  labelInvoiceStatus,
  labelRegistrationStatus,
  labelSubscriptionStatus,
} from "@/lib/labels";
import { MemberAvatar } from "@/components/member-avatar";

type MemberDetail = {
  member: {
    id: string;
    nome: string | null;
    email: string;
    empresa: string;
    categoria: string;
    cidade: string | null;
    especialidade: string | null;
    fotoUrl: string | null;
    capaUrl: string | null;
    whatsapp: string | null;
    telefone: string | null;
    instagram: string | null;
    linkedin: string | null;
    site: string | null;
    endereco: string | null;
    cep: string | null;
    addressNumber: string | null;
    addressComplement: string | null;
    bairro: string | null;
    youtube: string | null;
    descricao: string | null;
    pontos: number;
    rank: number | null;
    mensalidade: string;
    status: string;
    nextDue: string | null;
    memberSince: string;
    cardLast4: string | null;
    cardBrand: string | null;
    achievements: { code: string; nome: string; earnedAt: string }[];
    pointEntries: {
      id: string;
      action: string;
      note: string | null;
      occurredAt: string;
      label: string;
    }[];
    invoices: {
      id: string;
      kind: string;
      status: string;
      valor: string;
      dueDate: string;
    }[];
    registrations: {
      id: string;
      status: string;
      eventNome: string;
      eventData: string;
      checkinAt: string | null;
    }[];
    guests: { id: string; nome: string; empresa: string | null; eventNome: string }[];
  };
};

export default function AdminMembroDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useApiQuery<MemberDetail>(
    ["admin", "membros", id],
    `/api/admin/membros/${id}`,
  );

  if (isLoading || !data) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const m = data.member;
  const wa = m.whatsapp?.replace(/\D/g, "");

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        href="/admin/membros"
        className="text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        ‹ Voltar aos membros
      </Link>

      <Card className="overflow-hidden">
        <div className="h-28 bg-secondary relative">
          {m.capaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.capaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end gap-4">
            <MemberAvatar
              name={m.nome ?? m.empresa}
              src={m.fotoUrl}
              size="lg"
              className="!h-20 !w-20 ring-4"
            />
            <div className="flex-1 min-w-0 pt-10">
              <h1 className="font-display text-2xl font-extrabold">{m.nome}</h1>
              <p className="text-sm text-muted-foreground">
                {m.empresa}
                {m.especialidade ? ` · ${m.especialidade}` : ""}
                {m.cidade ? ` · ${m.cidade}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-10">
              <Badge>{labelCategory(m.categoria)}</Badge>
              <Badge
                variant={
                  m.status === "ACTIVE"
                    ? "success"
                    : m.status === "BLOCKED"
                      ? "destructive"
                      : "warning"
                }
              >
                {labelSubscriptionStatus(m.status)}
              </Badge>
            </div>
          </div>
          {m.descricao && (
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              {m.descricao}
            </p>
          )}
        </div>
      </Card>

      <div className="grid sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase">Pontos</div>
          <div className="font-mono text-xl font-extrabold mt-1">
            {formatPoints(m.pontos)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase">Ranking</div>
          <div className="font-mono text-xl font-extrabold mt-1">
            {m.rank ? `${m.rank}º` : "—"}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase">Mensalidade</div>
          <div className="font-mono text-xl font-extrabold mt-1">{m.mensalidade}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase">No Brasamind desde</div>
          <div className="font-mono text-sm font-bold mt-2">
            {new Date(m.memberSince).toLocaleDateString("pt-BR")}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <h2 className="font-display font-extrabold">Contato</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a className="hover:text-primary" href={`mailto:${m.email}`}>
                {m.email}
              </a>
            </li>
            {wa && (
              <li>
                <a
                  className="hover:text-primary"
                  href={`https://wa.me/55${wa}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp {m.whatsapp}
                </a>
              </li>
            )}
            {m.instagram && <li>Instagram {m.instagram}</li>}
            {m.linkedin && <li>LinkedIn {m.linkedin}</li>}
            {m.site && (
              <li>
                <a
                  className="hover:text-primary"
                  href={m.site.startsWith("http") ? m.site : `https://${m.site}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {m.site}
                </a>
              </li>
            )}
            {m.endereco && <li>{m.endereco}</li>}
            {m.cep && (
              <li>
                CEP {m.cep}
                {m.addressNumber ? `, nº ${m.addressNumber}` : ""}
                {m.bairro ? ` · ${m.bairro}` : ""}
              </li>
            )}
            {(m.cardBrand || m.cardLast4) && (
              <li className="text-muted-foreground">
                Cartão {m.cardBrand} ···· {m.cardLast4}
              </li>
            )}
          </ul>
        </Card>

        <Card className="p-5 space-y-3">
          <h2 className="font-display font-extrabold">Conquistas</h2>
          {m.achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ainda.</p>
          ) : (
            <ul className="space-y-2">
              {m.achievements.map((a) => (
                <li key={a.code} className="text-sm flex justify-between gap-2">
                  <span className="font-semibold">{a.nome}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.earnedAt).toLocaleDateString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <h2 className="font-display font-extrabold">Pontos recentes</h2>
          <ul className="space-y-2">
            {m.pointEntries.map((p) => (
              <li key={p.id} className="flex justify-between text-sm gap-2">
                <span className="text-muted-foreground truncate">
                  {p.note ?? p.action}
                </span>
                <span className="font-mono font-semibold">{p.label}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 space-y-3">
          <h2 className="font-display font-extrabold">Financeiro</h2>
          <ul className="space-y-2">
            {m.invoices.map((i) => (
              <li key={i.id} className="flex justify-between text-sm gap-2">
                <span>
                  {labelInvoiceKind(i.kind)} ·{" "}
                  {new Date(i.dueDate).toLocaleDateString("pt-BR")}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono">{i.valor}</span>
                  <Badge variant="secondary">{labelInvoiceStatus(i.status)}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <h2 className="font-display font-extrabold">Eventos</h2>
          <ul className="space-y-2">
            {m.registrations.map((r) => (
              <li key={r.id} className="flex justify-between text-sm gap-2">
                <span className="truncate">
                  {r.eventNome} ·{" "}
                  {new Date(r.eventData).toLocaleDateString("pt-BR")}
                </span>
                <Badge variant="secondary">{labelRegistrationStatus(r.status)}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 space-y-3">
          <h2 className="font-display font-extrabold">Convidados</h2>
          {m.guests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum convidado.</p>
          ) : (
            <ul className="space-y-2">
              {m.guests.map((g) => (
                <li key={g.id} className="text-sm">
                  <span className="font-semibold">{g.nome}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {g.empresa ?? "—"} · {g.eventNome}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
