"use client";

import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  tipo: string;
  titulo: string;
  body: string | null;
  read: boolean;
  createdAt: string;
};

const TIPO_LABEL: Record<string, string> = {
  EVENTO: "Evento",
  FINANCEIRO: "Financeiro",
  PONTOS: "Pontuação",
  CONVITE: "Convite",
  SISTEMA: "Aviso",
};

export default function NotificacoesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<{
    notifications: Notif[];
    unread: number;
  }>(["membro", "notifications"], "/api/membro/notifications?all=1");

  async function markAll() {
    await apiMutate("/api/membro/notifications", {
      method: "PATCH",
      body: JSON.stringify({ all: true }),
    });
    await qc.invalidateQueries({ queryKey: ["membro", "notifications"] });
    await qc.invalidateQueries({ queryKey: ["membro", "dashboard"] });
  }

  async function markOne(id: string) {
    await apiMutate("/api/membro/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    });
    await qc.invalidateQueries({ queryKey: ["membro", "notifications"] });
    await qc.invalidateQueries({ queryKey: ["membro", "dashboard"] });
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-sm text-muted-foreground">
          {data.unread > 0
            ? `${data.unread} não lida${data.unread > 1 ? "s" : ""}`
            : "Todas lidas"}
        </p>
        {data.unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAll}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        {data.notifications.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nada por aqui ainda.
          </p>
        ) : (
          <ul>
            {data.notifications.map((n) => (
              <li key={n.id} className="border-b border-border last:border-0">
                <button
                  type="button"
                  className={cn(
                    "flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/50",
                    n.read && "opacity-60",
                  )}
                  onClick={() => {
                    if (!n.read) void markOne(n.id);
                  }}
                >
                  <span
                    className={cn(
                      "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                      n.read ? "bg-border" : "bg-info",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-snug">
                      {n.titulo}
                    </span>
                    {n.body && (
                      <span className="mt-0.5 block text-[13px] text-muted-foreground">
                        {n.body}
                      </span>
                    )}
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {TIPO_LABEL[n.tipo] ?? n.tipo} ·{" "}
                      {new Date(n.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </span>
                  {!n.read && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-info" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
