"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toastActionError } from "@/lib/action-toast";

type Notif = {
  id: string;
  tipo: string;
  titulo: string;
  body: string | null;
  read: boolean;
  createdAt: string;
};

type NotifData = { notifications: Notif[]; unread: number };

export function NotificationBell() {
  const qc = useQueryClient();
  const { data } = useApiQuery<NotifData>(
    ["membro", "notifications"],
    "/api/membro/notifications",
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function markAll() {
    try {
      await apiMutate("/api/membro/notifications", {
        method: "PATCH",
        body: JSON.stringify({ all: true }),
      });
      await qc.invalidateQueries({ queryKey: ["membro", "notifications"] });
      await qc.invalidateQueries({ queryKey: ["membro", "dashboard"] });
    } catch (e) {
      toastActionError(e, "Não foi possível atualizar as notificações.");
    }
  }

  async function markOne(id: string) {
    try {
      await apiMutate("/api/membro/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id }),
      });
      await qc.invalidateQueries({ queryKey: ["membro", "notifications"] });
      await qc.invalidateQueries({ queryKey: ["membro", "dashboard"] });
    } catch (e) {
      toastActionError(e, "Não foi possível atualizar a notificação.");
    }
  }

  const unread = data?.unread ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="om-icon-btn relative"
        aria-label="Notificações"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-brasa text-[10px] font-bold text-white flex items-center justify-center px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-border bg-popover shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">Notificações</span>
            {unread > 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-primary"
                onClick={markAll}
              >
                Marcar todas
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {(data?.notifications ?? []).length === 0 ? (
              <li className="px-4 py-8 text-sm text-muted-foreground text-center">
                Nada por aqui ainda.
              </li>
            ) : (
              data!.notifications.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-border/60 hover:bg-secondary/50 transition-colors",
                      !n.read && "bg-secondary/30",
                    )}
                    onClick={() => {
                      if (!n.read) void markOne(n.id);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-brasa flex-none" />
                      )}
                      <div className={cn(n.read && "pl-4")}>
                        <div className="text-sm font-semibold">{n.titulo}</div>
                        {n.body && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {n.body}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {new Date(n.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
          <a
            href="/membro/notificacoes"
            className="block w-full border-t border-border px-4 py-3 text-center text-[13px] font-semibold text-primary hover:bg-secondary/40"
            onClick={() => setOpen(false)}
          >
            Ver histórico de notificações
          </a>
        </div>
      )}
    </div>
  );
}
