"use client";

import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function PixResult({
  encodedImage,
  payload,
}: {
  encodedImage?: string | null;
  payload?: string | null;
}) {
  if (!encodedImage && !payload) return null;

  async function copy() {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    toast.success("Código PIX copiado.");
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
            Copiar código PIX
          </Button>
        </div>
      )}
    </div>
  );
}
