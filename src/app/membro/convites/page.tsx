"use client";

import { useEffect, useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

type ConvitesData = {
  event: { nome: string; data: string; hora: string; localShort: string | null; local: string } | null;
  invite: { token: string; link: string; message: string | null } | null;
  guests: { id: string; nome: string; empresa: string | null; email: string; registrations: { status: string }[] }[];
  stats: { enviados: number; confirmados: number } | null;
};

export default function ConvitesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<ConvitesData>(
    ["membro", "convites"],
    "/api/membro/convites",
  );
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

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

  if (isLoading || !data) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!data.event || !data.invite) {
    return <Card className="p-8">Sem evento ativo para gerar convites.</Card>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Convites</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gere o link do evento. O convidado paga R$ 200 para garantir a vaga. Sem limite por encontro.
        </p>
      </div>

      <Card className="p-5 space-y-2">
        <div className="font-semibold">{data.event.nome}</div>
        <p className="text-sm text-muted-foreground">
          {new Date(data.event.data).toLocaleDateString("pt-BR")} · {data.event.hora} ·{" "}
          {data.event.localShort ?? data.event.local}
        </p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-xs uppercase text-muted-foreground">Enviados</div>
          <div className="font-mono text-2xl font-extrabold mt-1">
            {data.stats?.enviados ?? 0}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase text-muted-foreground">Confirmados</div>
          <div className="font-mono text-2xl font-extrabold mt-1">
            {data.stats?.confirmados ?? 0}
          </div>
        </Card>
      </div>

      <Card className="p-5 space-y-3">
        <div className="font-semibold">Link do convite</div>
        <code className="block text-xs break-all bg-secondary rounded-xl p-3">
          {data.invite.link}
        </code>
        <div className="flex gap-2">
          <Button onClick={copyLink}>{copied ? "Copiado" : "Copiar link"}</Button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${message}\n\n${data.invite.link}`)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline">Enviar no WhatsApp</Button>
          </a>
        </div>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
        <Button variant="secondary" onClick={save}>
          Salvar mensagem
        </Button>
      </Card>

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
                    {st}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
