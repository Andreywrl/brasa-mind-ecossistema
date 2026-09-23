import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatPoints(n: number) {
  return n.toLocaleString("pt-BR");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const MEMBERSHIP_CENTS = 9700;
export const TICKET_FULL_CENTS = 20000;

export const TICKET_PRICES = {
  FUNDADOR: 0,
  PATROCINADOR: 10000,
  MEMBRO: 18000,
  CONVIDADO: 20000,
} as const;

export function youtubeEmbedUrl(url: string | null | undefined) {
  if (!url) return "";
  const s = String(url).trim();
  const m =
    s.match(/[?&]v=([A-Za-z0-9_-]{6,})/) ||
    s.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
    s.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/) ||
    s.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/) ||
    (/^[A-Za-z0-9_-]{6,}$/.test(s) ? ([null, s] as const) : null);
  const id = m?.[1];
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : "";
}

export function waMeUrl(phone: string | null | undefined) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function instagramUrl(handle: string | null | undefined) {
  if (!handle) return "";
  const s = handle.trim();
  if (/^https?:\/\//i.test(s)) return s;
  return `https://instagram.com/${s.replace(/^@/, "")}`;
}

export function siteUrl(site: string | null | undefined) {
  if (!site) return "";
  const s = site.trim();
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

export function linkedinUrl(handle: string | null | undefined) {
  if (!handle) return "";
  const s = handle.trim();
  if (/^https?:\/\//i.test(s)) return s;
  return `https://linkedin.com/in/${s.replace(/^@/, "")}`;
}

export function memberBannerClass(categoria: string) {
  return categoria === "FUNDADOR" ? "bg-brasa" : "bg-secondary";
}

export function memberCatBadgeClass(categoria: string) {
  if (categoria === "FUNDADOR") return "bg-brasa text-white";
  if (categoria === "PATROCINADOR") return "bg-secondary text-primary";
  return "bg-secondary text-muted-foreground";
}
