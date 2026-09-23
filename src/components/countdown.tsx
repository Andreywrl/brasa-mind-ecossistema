"use client";

import { useEffect, useState } from "react";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

export function useCountdown(target: string | Date | null | undefined): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    done: true,
  });

  useEffect(() => {
    if (!target) {
      setParts({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
      return;
    }
    const end = typeof target === "string" ? new Date(target).getTime() : target.getTime();

    function tick() {
      const diff = Math.max(0, end - Date.now());
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1000);
      setParts({
        days,
        hours,
        minutes,
        seconds,
        done: diff <= 0,
      });
    }

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return parts;
}

export function CountdownGrid({ target }: { target: string | Date | null | undefined }) {
  const c = useCountdown(target);
  const cells = [
    { label: "dias", value: c.days },
    { label: "horas", value: c.hours },
    { label: "min", value: c.minutes },
    { label: "seg", value: c.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="rounded-xl border border-border bg-secondary/60 px-2 py-3 text-center"
        >
          <div className="font-mono text-xl font-extrabold tabular-nums">
            {String(cell.value).padStart(2, "0")}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  );
}
