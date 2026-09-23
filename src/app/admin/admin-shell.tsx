"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { usePrefetch } from "@/lib/api-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { cn, initials } from "@/lib/utils";
import { useState } from "react";
import {
  CalendarDays,
  CircleHelp,
  LayoutDashboard,
  Link2,
  Menu,
  ScrollText,
  Shield,
  Tags,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const nav = [
  { href: "/admin", label: "Visão geral", key: ["admin", "overview"], api: "/api/admin/overview", icon: LayoutDashboard },
  { href: "/admin/membros", label: "Membros", key: ["admin", "membros"], api: "/api/admin/membros", icon: Users },
  { href: "/admin/eventos", label: "Eventos", key: ["admin", "eventos"], api: "/api/admin/eventos", icon: CalendarDays },
  { href: "/admin/financeiro", label: "Financeiro", key: ["admin", "financeiro"], api: "/api/admin/financeiro", icon: Wallet },
  { href: "/admin/ranking", label: "Ranking", key: ["admin", "ranking"], api: "/api/admin/ranking", icon: Trophy },
  { href: "/admin/check-in", label: "Portaria", key: ["admin", "checkin"], api: "/api/admin/checkin", icon: Shield },
  { href: "/admin/categorias", label: "Categorias", key: ["admin", "categorias"], api: "/api/admin/categorias", icon: Tags },
  { href: "/admin/ofertas", label: "Ofertas", key: ["admin", "ofertas"], api: "/api/admin/ofertas", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários", key: ["admin", "usuarios"], api: "/api/admin/usuarios", icon: Shield },
  { href: "/admin/termos", label: "Termos e privacidade", key: ["admin", "termos"], api: "/api/admin/termos", icon: ScrollText },
  { href: "/admin/faq", label: "FAQ", key: ["faq"], api: "/api/faq", icon: CircleHelp },
  { href: "/admin/convites-membro", label: "Links de cadastro", key: ["admin", "membership-invites"], api: "/api/admin/membership-invites", icon: Link2 },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();
  const prefetch = usePrefetch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const name = data?.user?.name ?? "Admin";

  return (
    <div className="om-shell">
      <a href="#conteudo-principal" className="om-skip">
        Ir para o conteúdo
      </a>
      <aside className={cn("om-sidebar", menuOpen && "is-open")} aria-label="Menu administrativo">
        <div className="flex items-start justify-between gap-3">
          <div>
            <BrandMark />
            <p className="text-xs text-muted-foreground mt-1">Painel administrativo</p>
          </div>
          <button
            type="button"
            className="om-sidebar-close om-icon-btn"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto" aria-label="Navegação administrativa">
          {nav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "om-nav rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2.5 border-l-2",
                  active
                    ? "bg-secondary text-foreground border-primary"
                    : "text-muted-foreground hover:bg-secondary/60 border-transparent",
                )}
                onMouseEnter={() => prefetch(item.key, item.api)}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} aria-hidden />
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
            <div className="text-xs text-muted-foreground">Administrador</div>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => setConfirmLogout(true)}
          >
            Sair
          </button>
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
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0 lg:hidden">
            <BrandMark size="sm" symbolClassName="h-7" />
          </div>
          <div className="hidden lg:block flex-1 font-display font-bold text-lg">
            Painel Administrativo
          </div>
          <ThemeToggle />
        </header>
        <main id="conteudo-principal" className="om-main" tabIndex={-1}>
          {children}
        </main>
      </div>

      <Modal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Sair da conta?"
        description="Você será desconectado do Painel Administrativo e precisará entrar de novo."
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmLogout(false)}
            >
              Continuar logado
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sair da conta
            </Button>
          </>
        }
      />
    </div>
  );
}
