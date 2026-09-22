"use client";

export function EventMap({ address }: { address: string }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=pt-BR&z=16&output=embed`;
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <iframe
        title={`Mapa: ${address}`}
        src={src}
        className="h-56 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
        {address}
      </div>
    </div>
  );
}
