"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";

export function TicketQr({
  code,
  label = "Apresente este QR na portaria",
}: {
  code: string;
  label?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(code, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#1a120f", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `brasamind-ingresso-${code}.png`;
    a.click();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex justify-center rounded-xl bg-white p-3">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt={`QR ${code}`} width={180} height={180} />
        ) : (
          <div className="h-[180px] w-[180px] animate-pulse bg-muted rounded" />
        )}
      </div>
      <p className="text-center font-mono text-sm font-bold tracking-widest">
        {code}
      </p>
      <Button type="button" variant="outline" className="w-full" onClick={download}>
        Baixar QR Code
      </Button>
    </div>
  );
}
