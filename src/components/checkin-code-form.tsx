"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import toast from "react-hot-toast";

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
};

declare global {
  interface Window {
    BarcodeDetector?: new (opts?: {
      formats: string[];
    }) => BarcodeDetectorLike;
  }
}

export function CheckinCodeForm({
  onSubmit,
  loading,
}: {
  onSubmit: (code: string) => void | Promise<void>;
  loading?: boolean;
}) {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    return () => stopScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopScan() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function startScan() {
    if (!window.BarcodeDetector) {
      toast.error(
        "Seu navegador não lê QR pela câmera. Digite o código ou use Chrome/Edge.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setScanning(true);
      await new Promise((r) => setTimeout(r, 50));
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      const detector = new window.BarcodeDetector!({ formats: ["qr_code"] });

      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) {
            const value = codes[0].rawValue.trim();
            stopScan();
            setCode(value);
            await onSubmit(value);
            return;
          }
        } catch {
          /* keep scanning */
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      toast.error("Não foi possível abrir a câmera.");
      stopScan();
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="checkin-code">Código do ingresso</Label>
        <Input
          id="checkin-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ex.: A3K9M2P7QX"
          className="font-mono tracking-wider uppercase mt-1"
          autoComplete="off"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          loading={loading}
          disabled={!code.trim()}
          onClick={() => onSubmit(code.trim())}
        >
          {loading ? "Confirmando…" : "Confirmar por código"}
        </Button>
        {!scanning ? (
          <Button type="button" variant="outline" onClick={startScan}>
            Escanear QR Code
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={stopScan}>
            Parar câmera
          </Button>
        )}
      </div>
      {scanning && (
        <video
          ref={videoRef}
          className="w-full max-w-md rounded-xl border border-border bg-black aspect-video object-cover"
          muted
          playsInline
        />
      )}
    </div>
  );
}
