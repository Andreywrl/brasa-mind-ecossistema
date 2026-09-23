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
  LogOut,
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
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <BrandMark size="sm" symbolClassName="h-[30px]" />
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
          <div className="px-2.5 pb-1 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Menu
          </div>
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
                  "om-nav relative flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70",
                )}
                onMouseEnter={() => prefetch(item.key, item.api)}
                onClick={() => setMenuOpen(false)}
              >
                {active && (
                  <span
                    className="bg-primary absolute -left-4 top-2 bottom-2 w-[3px] rounded-r-[3px]"
                    aria-hidden
                  />
                )}
                <Icon size={19} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-2.5 rounded-xl border border-border px-2.5 py-2">
            <div className="h-9 w-9 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs font-bold">
              {initials(name)}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[13px] font-bold truncate">{name}</div>
              <div className="text-xs text-muted-foreground">Administrador</div>
            </div>
          </div>
          <button
            type="button"
            className="om-nav flex w-full items-center gap-3 rounded-[9px] px-3 py-2 text-left text-[13px] font-semibold text-muted-foreground hover:bg-secondary/70"
            onClick={() => setConfirmLogout(true)}
          >
            <LogOut size={18} aria-hidden />
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
