"use client";

import { useEffect, useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { labelRegistrationStatus } from "@/lib/labels";
import { ChevronDown, CalendarDays, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

type ConvitesData = {
  event: {
    nome: string;
    data: string;
    hora: string;
    localShort: string | null;
    local: string;
  } | null;
  invite: { token: string; link: string; message: string | null } | null;
  guests: {
    id: string;
    nome: string;
    empresa: string | null;
    email: string;
    registrations: { status: string }[];
  }[];
  stats: { enviados: number; confirmados: number } | null;
};

const DEFAULT_GROUP_MSG =
  "Estou te indicando para o Brasamind. A gente conecta empresários gaúchos em encontros com muito churrasco, palestra e networking. Quer entrar?";

const WA_ICON = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.93-.26-.1-.45-.15-.65.14-.19.29-.74.93-.9 1.12-.17.19-.33.22-.62.07-.29-.14-1.22-.45-2.32-1.44-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.44.13-.59.13-.13.29-.34.44-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.14-.65-1.57-.9-2.15-.24-.56-.48-.48-.65-.49h-.55c-.19 0-.51.07-.77.36-.26.29-1.01.99-1.01 2.42 0 1.43 1.04 2.81 1.19 3 .14.19 2.05 3.13 4.97 4.39.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.7-.7 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34zM12.04 21.5a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.41-9.4 2.51 0 4.87.98 6.65 2.76a9.35 9.35 0 0 1 2.75 6.65c-.01 5.18-4.22 9.4-9.4 9.4z" />
  </svg>
);

export default function ConvitesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<ConvitesData>(
    ["membro", "convites"],
    "/api/membro/convites",
  );
  const [message, setMessage] = useState("");
  const [groupMsg, setGroupMsg] = useState(DEFAULT_GROUP_MSG);
  const [copied, setCopied] = useState(false);
  const [msgCopied, setMsgCopied] = useState(false);
  const [groupCopied, setGroupCopied] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  useEffect(() => {
    if (data?.invite?.message) setMessage(data.invite.message);
  }, [data?.invite?.message]);

  async function save() {
    await apiMutate("/api/membro/convites", {
      method: "PATCH",
      body: JSON.stringify({ message }),
    });
    await qc.invalidateQueries({ queryKey: ["membro", "convites"] });
  }

  async function copyLink() {
    if (!data?.invite?.link) return;
    await navigator.clipboard.writeText(data.invite.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyInviteMsg() {
    if (!data?.invite?.link) return;
    await navigator.clipboard.writeText(`${message}\n\n${data.invite.link}`);
    setMsgCopied(true);
    setTimeout(() => setMsgCopied(false), 2000);
  }

  async function copyGroupMsg() {
    await navigator.clipboard.writeText(groupMsg);
    setGroupCopied(true);
    setTimeout(() => setGroupCopied(false), 2000);
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-5 max-w-4xl">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <div className="om-grid-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const enviados = data.stats?.enviados ?? 0;
  const confirmados = data.stats?.confirmados ?? 0;
  const taxa = enviados > 0 ? Math.round((confirmados / enviados) * 100) : 0;
  const hasEventInvite = Boolean(data.event && data.invite);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Card: convidar para evento (colapsável) */}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-5 px-[22px] py-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="bg-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary-foreground">
              <CalendarDays size={22} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="text-brasa font-display text-[11px] font-extrabold uppercase tracking-[0.08em]">
                Próximo evento do mês
              </div>
              {data.event ? (
                <>
                  <div className="font-display text-base font-extrabold leading-snug mt-0.5">
                    {data.event.nome}
                  </div>
                  <div className="flex flex-wrap gap-x-3.5 text-[13px] text-muted-foreground mt-0.5">
                    <span className="font-mono">
                      {new Date(data.event.data).toLocaleDateString("pt-BR")} ·{" "}
                      {data.event.hora}
                    </span>
                    <span>{data.event.localShort ?? data.event.local}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Sem evento ativo no momento.
                </p>
              )}
            </div>
          </div>
          {hasEventInvite && (
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setEventOpen((v) => !v)}
            >
              Convidar para evento
              <ChevronDown
                size={15}
                className={cn("transition-transform", eventOpen && "rotate-180")}
              />
            </Button>
          )}
        </div>

        {hasEventInvite && eventOpen && data.invite && (
          <div className="border-t border-border p-[22px] space-y-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Seu link exclusivo
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                <code className="font-mono bg-secondary flex-1 min-w-[220px] rounded-[10px] px-3.5 py-2.5 text-[13px] truncate">
                  {data.invite.link}
                </code>
                <Button onClick={copyLink} className="h-11">
                  {copied ? "Copiado" : "Copiar link"}
                </Button>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Mensagem de convite
                </div>
                <span className="text-xs text-muted-foreground">edite se quiser</span>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onBlur={save}
                rows={6}
                className="mt-2"
              />
              <div className="mt-3 flex flex-wrap gap-2.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${message}\n\n${data.invite.link}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button className="bg-[#25D366] hover:bg-[#1ebe57] text-white gap-2">
                    {WA_ICON}
                    Enviar no WhatsApp
                  </Button>
                </a>
                <Button variant="outline" onClick={copyInviteMsg}>
                  {msgCopied ? "Copiado" : "Copiar mensagem"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Card: recrutar para o grupo (colapsável) */}
      <Card className="overflow-hidden p-0 rounded-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-5 px-[26px] py-5">
          <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
            <div className="flex items-center gap-2.5">
              <span className="bg-brasa flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white">
                <UserPlus size={18} aria-hidden />
              </span>
              <h2 className="font-display text-xl font-extrabold m-0">
                Traga um novo membro para o Brasamind
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed m-0">
              Convide alguém para fazer parte do grupo o ano todo, não só de um evento.
              Membros indicados por você contam pontos e aproximam parceiros de confiança
              da sua rede.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={() => setGroupOpen((v) => !v)}
          >
            Convidar para o grupo
            <ChevronDown
              size={15}
              className={cn("transition-transform", groupOpen && "rotate-180")}
            />
          </Button>
        </div>

        {groupOpen && (
          <>
            <div className="om-grid-4 border-t border-border px-6 py-5">
              {[
                { label: "membros ativos", value: "128" },
                { label: "eventos realizados", value: "48" },
                { label: "de grupo", value: "4 anos" },
                { label: "empresas representadas", value: "90+" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-impact text-[28px] leading-none">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-[26px] py-[22px] space-y-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Mensagem de convite para o grupo
                  </div>
                  <span className="text-xs text-muted-foreground">edite se quiser</span>
                </div>
                <Textarea
                  value={groupMsg}
                  onChange={(e) => setGroupMsg(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>
              <p className="text-xs text-muted-foreground m-0">
                O link oficial de cadastro é gerado no painel administrativo. Compartilhe a
                mensagem e peça para a pessoa falar com o Brasamind para receber o acesso.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(groupMsg)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button className="bg-[#25D366] hover:bg-[#1ebe57] text-white gap-2">
                    {WA_ICON}
                    Enviar no WhatsApp
                  </Button>
                </a>
                <Button variant="outline" onClick={copyGroupMsg}>
                  {groupCopied ? "Copiado" : "Copiar mensagem"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* KPIs */}
      <div className="om-grid-3">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Enviados
          </div>
          <div className="font-mono text-[26px] font-extrabold mt-1.5">{enviados}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Convertidos
          </div>
          <div className="font-mono text-[26px] font-extrabold mt-1.5 text-success">
            {confirmados}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Taxa de conversão
          </div>
          <div className="font-mono text-[26px] font-extrabold mt-1.5">{taxa}%</div>
        </Card>
      </div>

      {data.event && data.guests.length > 0 && (
        <Card className="p-5">
          <h2 className="font-display font-extrabold mb-3">Convidados deste evento</h2>
          <ul className="space-y-3">
            {data.guests.map((g) => {
              const st = g.registrations[0]?.status ?? "—";
              return (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-3 text-sm border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-semibold">{g.nome}</div>
                    <div className="text-muted-foreground text-xs">
                      {g.empresa} · {g.email}
                    </div>
                  </div>
                  <Badge
                    variant={
                      st === "CONFIRMED" || st === "CHECKED_IN"
                        ? "success"
                        : st === "PENDING_PAYMENT"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {labelRegistrationStatus(st)}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
