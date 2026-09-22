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
