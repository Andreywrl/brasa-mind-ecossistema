"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useApiQuery, usePrefetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { labelCategory } from "@/lib/labels";
import { useMemo, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { BrandMark } from "@/components/brand-mark";
import { MemberAvatar } from "@/components/member-avatar";
import {
  CalendarDays,
  CircleHelp,
  History,
  Home,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MoreHorizontal,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type NavItem = {
  href: string;
  label: string;
  key: string[];
  api: string;
  icon: typeof Home;
};

const menuNav: NavItem[] = [
  { href: "/membro", label: "Início", key: ["membro", "dashboard"], api: "/api/membro/dashboard", icon: Home },
  { href: "/membro/evento", label: "Evento do mês", key: ["membro", "evento"], api: "/api/membro/evento", icon: CalendarDays },
  { href: "/membro/hub", label: "Hub de membros", key: ["membro", "hub"], api: "/api/membro/hub", icon: Users },
  { href: "/membro/convites", label: "Convites", key: ["membro", "convites"], api: "/api/membro/convites", icon: Mail },
  { href: "/membro/ofertas", label: "Ofertas", key: ["membro", "ofertas"], api: "/api/membro/ofertas", icon: Megaphone },
  { href: "/membro/ranking", label: "Ranking", key: ["membro", "ranking"], api: "/api/membro/ranking?period=geral", icon: Trophy },
];

const moreNav: NavItem[] = [
  { href: "/membro/financeiro", label: "Financeiro", key: ["membro", "financeiro"], api: "/api/membro/financeiro", icon: Wallet },
  { href: "/membro/historico", label: "Histórico", key: ["membro", "historico"], api: "/api/membro/historico", icon: History },
  { href: "/membro/faq", label: "FAQ", key: ["faq"], api: "/api/faq", icon: CircleHelp },
];

const bottom = [
  { href: "/membro", label: "Início", icon: Home },
  { href: "/membro/evento", label: "Evento", icon: CalendarDays },
  { href: "/membro/hub", label: "Hub", icon: Users },
  { href: "/membro/ranking", label: "Ranking", icon: Trophy },
];

const moreHrefs = [
  "/membro/convites",
  "/membro/ofertas",
  "/membro/financeiro",
  "/membro/historico",
  "/membro/faq",
  "/membro/perfil",
];

function isActive(pathname: string, href: string) {
  return href === "/membro" ? pathname === "/membro" : pathname.startsWith(href);
}

function pageMeta(pathname: string, firstName: string): { title: string; sub: string } {
  if (pathname === "/membro") {
    return {
      title: `${greeting()}, ${firstName}`,
      sub: "Churrasco, palestra e networking, num lugar só.",
    };
  }
  if (pathname.startsWith("/membro/evento")) {
    return { title: "Evento do mês", sub: "Um único evento ativo por mês. Garanta sua vaga." };
  }
  if (pathname.startsWith("/membro/hub")) {
    return { title: "Hub de membros", sub: "Cada card é uma empresa da rede." };
  }
  if (pathname.startsWith("/membro/membros/")) {
    return { title: "Perfil do membro", sub: "Conecte, indique, feche negócios." };
  }
  if (pathname.startsWith("/membro/convites")) {
    return { title: "Meus convites", sub: "Traga empresários e ganhe pontos." };
  }
  if (pathname.startsWith("/membro/ofertas")) {
    return {
      title: "Ofertas do Patrocinador",
      sub: "Banners e ofertas da sua empresa para a rede do Brasa.",
    };
  }
  if (pathname.startsWith("/membro/ranking")) {
    return { title: "Ranking", sub: "Pontos, medalhas e prêmios no encerramento do ano." };
  }
  if (pathname.startsWith("/membro/financeiro")) {
    return { title: "Meu financeiro", sub: "Mensalidades, histórico e pendências." };
  }
  if (pathname.match(/^\/membro\/historico\/[^/]+/)) {
    return { title: "Detalhe do evento", sub: "Detalhes da sua participação." };
  }
  if (pathname.startsWith("/membro/historico")) {
    return { title: "Meu histórico", sub: "Onde você esteve e quanto pontuou." };
  }
  if (pathname.startsWith("/membro/faq")) {
    return { title: "FAQ", sub: "Perguntas frequentes e suporte do Brasamind." };
  }
  if (pathname.startsWith("/membro/perfil")) {
    return { title: "Meu perfil", sub: "Seus dados na rede para conectar, indicar e fechar negócios." };
  }
  return { title: "Área do Membro", sub: "" };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function NavLink({
  item,
  active,
  onPrefetch,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onPrefetch: () => void;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "om-nav relative flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-sm font-semibold transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/70",
      )}
      onMouseEnter={onPrefetch}
      onClick={onNavigate}
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
}

export default function MembroLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const prefetch = usePrefetch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { data: me } = useApiQuery<{
    profile: { categoria: string; fotoUrl: string | null };
  }>(["membro", "me"], "/api/membro/me");

  const name = session?.user?.name ?? "Membro";
  const firstName = name.split(" ")[0] ?? name;
  const moreOn = moreHrefs.some((h) => pathname.startsWith(h));
  const meta = useMemo(() => pageMeta(pathname, firstName), [pathname, firstName]);
  const catLabel = me?.profile?.categoria
    ? labelCategory(me.profile.categoria)
    : "Membro";

  return (
    <div className="om-shell">
      <a href="#conteudo-principal" className="om-skip">
        Ir para o conteúdo
      </a>

      <aside className={cn("om-sidebar", menuOpen && "is-open")} aria-label="Menu do membro">
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

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Navegação do membro">
          <div className="px-2.5 pb-1 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Menu
          </div>
          {menuNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              onPrefetch={() => prefetch(item.key, item.api)}
              onNavigate={() => setMenuOpen(false)}
            />
          ))}

          <div className="px-2.5 pb-1 pt-4 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Mais
          </div>
          {moreNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              onPrefetch={() => prefetch(item.key, item.api)}
              onNavigate={() => setMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/membro/perfil"
            onClick={() => setMenuOpen(false)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl border border-border px-2.5 py-2 text-left transition-colors hover:bg-secondary/60",
              pathname.startsWith("/membro/perfil") && "bg-secondary",
            )}
          >
            <MemberAvatar
              name={name}
              src={me?.profile?.fotoUrl ?? session?.user?.image}
              size="sm"
              className="!h-9 !w-9"
            />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[13px] font-bold">{name}</span>
              <span className="block text-xs text-muted-foreground">{catLabel}</span>
            </span>
          </Link>
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
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="om-header-inner !max-w-none !px-4 lg:!px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                className="om-menu-btn om-icon-btn"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="font-display m-0 truncate text-[22px] font-extrabold tracking-[-0.01em]">
                  {meta.title}
                </h1>
                {meta.sub && (
                  <p className="om-hide-sm m-0 truncate text-[13px] text-muted-foreground">
                    {meta.sub}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </header>
        <main id="conteudo-principal" className="om-main" tabIndex={-1}>
          {children}
        </main>
      </div>

      <nav className="om-bottom" aria-label="Navegação principal">
        {bottom.map((item) => {
          const Icon = item.icon;
          const on = isActive(pathname, item.href);
          return (
            <button
              key={item.href}
              type="button"
              className={cn(on && "is-on")}
              onClick={() => router.push(item.href)}
            >
              <Icon size={20} aria-hidden />
              {item.label}
            </button>
          );
        })}
        <button
          type="button"
          className={cn(moreOn && "is-on")}
          onClick={() => setMenuOpen(true)}
        >
          <MoreHorizontal size={20} aria-hidden />
          Mais
        </button>
      </nav>

      <Modal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Sair da conta?"
        description="Você será desconectado da Área do Membro e precisará entrar de novo."
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
