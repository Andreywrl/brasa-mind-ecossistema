"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PixResult({
  encodedImage,
  payload,
}: {
  encodedImage?: string | null;
  payload?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  if (!encodedImage && !payload) return null;

  async function copy() {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3 rounded-xl border border-border p-4 bg-secondary/30">
      <p className="text-sm font-semibold">PIX gerado</p>
      {encodedImage && (
        <div className="flex justify-center rounded-lg bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              encodedImage.startsWith("data:")
                ? encodedImage
                : `data:image/png;base64,${encodedImage}`
            }
            alt="QR Code PIX"
            className="h-44 w-44"
          />
        </div>
      )}
      {payload && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground break-all font-mono">{payload}</p>
          <Button type="button" variant="outline" className="w-full" onClick={copy}>
            {copied ? "Copiado" : "Copiar código PIX"}
          </Button>
        </div>
      )}
    </div>
  );
}
