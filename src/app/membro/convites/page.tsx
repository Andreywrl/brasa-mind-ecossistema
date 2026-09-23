"use client";

import { useEffect, useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { labelRegistrationStatus } from "@/lib/labels";

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
  "Estou te indicando para o Brasamind, o grupo gaúcho de networking. Conectamos empresários, indicamos parceiros e fechamos negócios em um encontro por mês. Quer entrar?";

export default function ConvitesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<ConvitesData>(
    ["membro", "convites"],
    "/api/membro/convites",
  );
  const [message, setMessage] = useState("");
  const [groupMsg, setGroupMsg] = useState(DEFAULT_GROUP_MSG);
  const [copied, setCopied] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupCopied, setGroupCopied] = useState(false);

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

  async function copyGroupMsg() {
    await navigator.clipboard.writeText(groupMsg);
    setGroupCopied(true);
    setTimeout(() => setGroupCopied(false), 2000);
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const enviados = data.stats?.enviados ?? 0;
  const confirmados = data.stats?.confirmados ?? 0;
  const taxa =
    enviados > 0 ? Math.round((confirmados / enviados) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Convites</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Traga convidados para o evento e indique novos membros para o Brasa.
        </p>
      </div>

      {data.event && data.invite ? (
        <Card className="p-5 space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Próximo evento do mês
            </div>
            <div className="font-semibold mt-1">{data.event.nome}</div>
            <p className="text-sm text-muted-foreground">
              {new Date(data.event.data).toLocaleDateString("pt-BR")} · {data.event.hora} ·{" "}
              {data.event.localShort ?? data.event.local}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs uppercase text-muted-foreground">Enviados</div>
              <div className="font-mono text-2xl font-extrabold mt-1">{enviados}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs uppercase text-muted-foreground">Convertidos</div>
              <div className="font-mono text-2xl font-extrabold mt-1">{confirmados}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs uppercase text-muted-foreground">Taxa de conversão</div>
              <div className="font-mono text-2xl font-extrabold mt-1">{taxa}%</div>
            </div>
          </div>
          <div>
            <div className="font-semibold text-sm mb-1">Seu link exclusivo</div>
            <code className="block text-xs break-all bg-secondary rounded-xl p-3">
              {data.invite.link}
            </code>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyLink}>{copied ? "Copiado" : "Copiar link"}</Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${message}\n\n${data.invite.link}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline">Convidar para evento</Button>
            </a>
          </div>
          <div>
            <div className="font-semibold text-sm mb-1">Mensagem de convite</div>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
            <Button variant="secondary" className="mt-2" onClick={save}>
              Salvar mensagem
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-sm text-muted-foreground">
          Sem evento ativo para gerar convites de encontro. Você ainda pode indicar alguém
          para entrar no grupo.
        </Card>
      )}

      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-display text-xl font-extrabold">
            Traga um novo membro para o Brasa
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Convide alguém para fazer parte do grupo o ano todo, não só de um evento. Membros
            indicados por você aproximam parceiros de confiança da sua rede.
          </p>
        </div>
        {!groupOpen ? (
          <Button onClick={() => setGroupOpen(true)}>Convidar para o grupo</Button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "membros ativos", value: "128" },
                { label: "eventos realizados", value: "48" },
                { label: "de grupo", value: "4 anos" },
                { label: "empresas representadas", value: "90+" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border p-3 text-center">
                  <div className="font-impact text-lg">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="font-semibold text-sm mb-1">Mensagem de convite para o grupo</div>
              <p className="text-xs text-muted-foreground mb-2">edite se quiser</p>
              <Textarea
                value={groupMsg}
                onChange={(e) => setGroupMsg(e.target.value)}
                rows={4}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              O link oficial de cadastro é gerado no painel administrativo. Compartilhe a
              mensagem e peça para a pessoa falar com o Brasa para receber o acesso.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(groupMsg)}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button>Enviar no WhatsApp</Button>
              </a>
              <Button variant="outline" onClick={copyGroupMsg}>
                {groupCopied ? "Copiado" : "Copiar mensagem"}
              </Button>
              <Button variant="ghost" onClick={() => setGroupOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Card>

      {data.event && (
        <Card className="p-5">
          <h2 className="font-display font-extrabold mb-3">Convidados</h2>
          {data.guests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ninguém usou seu link ainda.</p>
          ) : (
            <ul className="space-y-3">
              {data.guests.map((g) => {
                const st = g.registrations[0]?.status ?? "—";
                return (
                  <li
                    key={g.id}
                    className="flex items-center justify-between gap-3 text-sm border-b border-border pb-3"
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
          )}
        </Card>
      )}
    </div>
  );
}
