"use client";

type EventMapProps = {
  address: string;
  title?: string | null;
  /** Quando true, omite o rodapé interno (útil dentro de um card Local) */
  bare?: boolean;
};

export function EventMap({ address, title, bare }: EventMapProps) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=pt-BR&z=16&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className={bare ? undefined : "overflow-hidden rounded-xl border border-border"}>
      <div className={bare ? "om-map overflow-hidden rounded-xl border border-border" : undefined}>
        <iframe
          title={`Mapa: ${title || address}`}
          src={src}
          className="h-56 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      {!bare && (
        <div className="flex items-start justify-between gap-3 px-4 py-3 text-sm border-t border-border">
          <div className="min-w-0">
            {title && <div className="font-semibold">{title}</div>}
            <div className="text-muted-foreground text-xs mt-0.5">{address}</div>
          </div>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-semibold text-foreground hover:underline"
          >
            Abrir no Maps
          </a>
        </div>
      )}
    </div>
  );
}
