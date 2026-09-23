import { cn } from "@/lib/utils";

export type GalleryEvent = {
  id: string;
  nome: string;
  data: string;
  capaUrl: string | null;
  localShort?: string | null;
  blurb?: string | null;
};

type EventGalleryProps = {
  title: string;
  eyebrow?: string;
  events: GalleryEvent[];
  className?: string;
};

export function EventGallery({
  title,
  eyebrow = "Encontros anteriores",
  events,
  className,
}: EventGalleryProps) {
  if (events.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {eyebrow}
          </div>
          <h2 className="font-display text-2xl font-extrabold mt-1">{title}</h2>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          arraste para o lado
        </span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {events.map((e) => {
          const when = new Date(e.data).toLocaleDateString("pt-BR", {
            month: "short",
            year: "numeric",
          });
          return (
            <article
              key={e.id}
              className="snap-start flex-none w-[296px] overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative h-[168px] bg-secondary">
                {e.capaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.capaUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
                <span className="absolute left-3 top-3 z-[2] rounded-full bg-black/80 px-2.5 py-1 font-mono text-[11px] text-white">
                  {when}
                </span>
              </div>
              <div className="p-4">
                <div className="font-display text-base font-extrabold">{e.nome}</div>
                {(e.blurb || e.localShort) && (
                  <p className="mt-1.5 text-[13px] text-muted-foreground">
                    {e.blurb ?? e.localShort}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
