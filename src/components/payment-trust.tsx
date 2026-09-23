import { cn } from "@/lib/utils";

const badges = [
  { src: "/payments/asaas.svg", alt: "Asaas" },
  { src: "/payments/pix.svg", alt: "Pix" },
  { src: "/payments/visa.svg", alt: "Visa" },
  { src: "/payments/mastercard.svg", alt: "Mastercard" },
  { src: "/payments/elo.svg", alt: "Elo" },
] as const;

type PaymentTrustProps = {
  className?: string;
  caption?: string;
};

export function PaymentTrust({
  className,
  caption = "Pagamento processado com segurança pela Asaas",
}: PaymentTrustProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-3">
        {badges.map((b) => (
          <img
            key={b.src}
            src={b.src}
            alt={b.alt}
            className="h-5 w-auto opacity-80"
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}
