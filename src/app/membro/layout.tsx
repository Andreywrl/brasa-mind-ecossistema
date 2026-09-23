"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { usePrefetch } from "@/lib/api-client";
import { cn, initials } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";

const nav = [
  { href: "/membro", label: "Início", key: ["membro", "dashboard"], api: "/api/membro/dashboard" },
  { href: "/membro/evento", label: "Evento", key: ["membro", "evento"], api: "/api/membro/evento" },
  { href: "/membro/hub", label: "Hub", key: ["membro", "hub"], api: "/api/membro/hub" },
  { href: "/membro/convites", label: "Convites", key: ["membro", "convites"], api: "/api/membro/convites" },
  { href: "/membro/ofertas", label: "Ofertas", key: ["membro", "ofertas"], api: "/api/membro/ofertas" },
  { href: "/membro/ranking", label: "Ranking", key: ["membro", "ranking"], api: "/api/membro/ranking?period=geral" },
  { href: "/membro/financeiro", label: "Financeiro", key: ["membro", "financeiro"], api: "/api/membro/financeiro" },
  { href: "/membro/historico", label: "Histórico", key: ["membro", "historico"], api: "/api/membro/historico" },
  { href: "/membro/faq", label: "FAQ", key: ["faq"], api: "/api/faq" },
  { href: "/membro/perfil", label: "Perfil", key: ["membro", "me"], api: "/api/membro/me" },
];

export default function MembroLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();
  const prefetch = usePrefetch();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = data?.user?.name ?? "Membro";

  return (
    <div className="om-shell">
      <a href="#conteudo-principal" className="skip-link">
        Ir para o conteúdo
      </a>
      <aside className={cn("om-sidebar", menuOpen && "om-open")} aria-label="Menu do membro">
        <div>
          <div className="font-impact text-xl text-brasa">Brasamind</div>
          <p className="text-xs text-muted-foreground mt-1">Área do membro</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1" aria-label="Navegação do membro">
          {nav.map((item) => {
            const active =
              item.href === "/membro"
                ? pathname === "/membro"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "om-nav rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60",
                )}
                onMouseEnter={() => prefetch(item.key, item.api)}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <div className="h-10 w-10 rounded-full bg-brasa text-white flex items-center justify-center text-sm font-bold">
            {initials(name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{name}</div>
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sair
            </button>
          </div>
        </div>
      </aside>
      {menuOpen && (
        <button className="om-scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />
      )}
      <div className="om-maincol">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/90 backdrop-blur px-4 py-3 lg:px-8">
          <button
            className="om-menu-btn om-icon-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <div className="font-display font-bold text-lg flex-1">Área do Membro</div>
          <NotificationBell />
          <ThemeToggle />
        </header>
        <main id="conteudo-principal" className="flex-1 p-4 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
