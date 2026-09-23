"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { usePrefetch } from "@/lib/api-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn, initials } from "@/lib/utils";
import { useState } from "react";

const nav = [
  { href: "/admin", label: "Visão geral", key: ["admin", "overview"], api: "/api/admin/overview" },
  { href: "/admin/membros", label: "Membros", key: ["admin", "membros"], api: "/api/admin/membros" },
  { href: "/admin/eventos", label: "Eventos", key: ["admin", "eventos"], api: "/api/admin/eventos" },
  { href: "/admin/financeiro", label: "Financeiro", key: ["admin", "financeiro"], api: "/api/admin/financeiro" },
  { href: "/admin/ranking", label: "Ranking", key: ["admin", "ranking"], api: "/api/admin/ranking" },
  { href: "/admin/check-in", label: "Check-in", key: ["admin", "checkin"], api: "/api/admin/checkin" },
  { href: "/admin/categorias", label: "Categorias", key: ["admin", "categorias"], api: "/api/admin/categorias" },
  { href: "/admin/ofertas", label: "Ofertas", key: ["admin", "ofertas"], api: "/api/admin/ofertas" },
  { href: "/admin/usuarios", label: "Usuários", key: ["admin", "usuarios"], api: "/api/admin/usuarios" },
  { href: "/admin/termos", label: "Termos", key: ["admin", "termos"], api: "/api/admin/termos" },
  { href: "/admin/faq", label: "FAQ", key: ["faq"], api: "/api/faq" },
  { href: "/admin/convites-membro", label: "Links de cadastro", key: ["admin", "membership-invites"], api: "/api/admin/membership-invites" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();
  const prefetch = usePrefetch();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = data?.user?.name ?? "Admin";

  return (
    <div className="om-shell">
      <a href="#conteudo-principal" className="skip-link">
        Ir para o conteúdo
      </a>
      <aside className={cn("om-sidebar", menuOpen && "om-open")} aria-label="Menu administrativo">
        <div>
          <div className="font-impact text-xl text-brasa">Brasamind</div>
          <p className="text-xs text-muted-foreground mt-1">Painel administrativo</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto" aria-label="Navegação administrativa">
          {nav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
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
          <div className="h-10 w-10 rounded-full bg-secondary text-foreground flex items-center justify-center text-sm font-bold">
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
          <div className="font-display font-bold text-lg flex-1">Painel Administrativo</div>
          <ThemeToggle />
        </header>
        <main id="conteudo-principal" className="flex-1 p-4 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
