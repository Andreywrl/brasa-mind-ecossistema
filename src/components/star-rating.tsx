"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = 22,
  readOnly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const Comp = readOnly ? "span" : "button";
        return (
          <Comp
            key={n}
            type={readOnly ? undefined : "button"}
            className={cn(
              "p-0.5",
              !readOnly && "cursor-pointer hover:scale-110 transition-transform",
            )}
            onClick={readOnly ? undefined : () => onChange?.(n)}
            aria-label={readOnly ? undefined : `Dar ${n} estrela${n > 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              className={cn(
                filled ? "fill-ember text-ember" : "text-muted-foreground",
              )}
            />
          </Comp>
        );
      })}
    </div>
  );
}
