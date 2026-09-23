"use client";

import { useState } from "react";
import { cn, initials } from "@/lib/utils";

export function MemberAvatar({
  name,
  src,
  size = "sm",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = src?.trim() || "";
  const showImg = Boolean(url) && !failed;
  const sizeClass =
    size === "lg" ? "om-face-lg text-xl" : size === "md" ? "h-16 w-16 text-sm" : "om-face-sm text-xs";

  return (
    <span
      className={cn(
        "om-face inline-flex items-center justify-center overflow-hidden rounded-full bg-brasa font-bold text-white ring-2 ring-card",
        sizeClass,
        className,
      )}
      aria-hidden={!showImg}
      role={showImg ? undefined : "img"}
      aria-label={showImg ? undefined : name}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name || "BM")
      )}
    </span>
  );
}
