import { cn } from "@/lib/utils";

type BrandMarkProps = {
  /** orange: fundo claro · white: fundo escuro/laranja · dark: arte preta */
  variant?: "orange" | "white" | "dark";
  className?: string;
  symbolClassName?: string;
  /** false = só o símbolo (watermark) */
  showWordmark?: boolean;
  /** true = logo completa (símbolo + Brasamind + tagline na arte) */
  lockup?: boolean;
  /** tamanho do wordmark em texto (modo compacto) */
  size?: "sm" | "md" | "lg";
};

const LOCKUPS = {
  orange: "/brand/brasamind-lockup-laranja.png",
  white: "/brand/brasamind-lockup-branco.png",
  dark: "/brand/brasamind-lockup-preto.png",
} as const;

const SYMBOLS = {
  orange: "/brand/simbolo-laranja.png",
  white: "/brand/simbolo-branco.png",
  dark: "/brand/simbolo-preto.png",
} as const;

const WORD_SIZE = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-[27px]",
} as const;

const LOCKUP_SIZE = {
  sm: "h-16",
  md: "h-24",
  lg: "h-32",
} as const;

export function BrandMark({
  variant = "orange",
  className,
  symbolClassName,
  showWordmark = true,
  lockup = false,
  size = "md",
}: BrandMarkProps) {
  if (lockup && showWordmark) {
    return (
      <img
        src={LOCKUPS[variant]}
        alt="Brasamind: empreendedorismo, churrasco e network"
        className={cn(LOCKUP_SIZE[size], "w-auto object-contain", className)}
      />
    );
  }

  return (
    <div
      className={cn("flex items-center gap-2.5", className)}
      role="img"
      aria-label="Brasamind"
    >
      <img
        src={SYMBOLS[variant]}
        alt=""
        aria-hidden
        className={cn("h-8 w-auto shrink-0", symbolClassName)}
      />
      {showWordmark && (
        <span
          className={cn(
            "font-impact leading-none tracking-wide",
            WORD_SIZE[size],
            variant === "white"
              ? "text-white"
              : variant === "dark"
                ? "text-foreground"
                : "text-brasa",
          )}
        >
          Brasamind
        </span>
      )}
    </div>
  );
}
