"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export async function uploadImageFile(file: File, folder: string) {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Falha no upload");
  }
  return data.url;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = "members",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImageFile(file, folder);
      onChange(url);
      toast.success("Imagem enviada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-24 w-24 rounded-xl object-cover border border-border"
        />
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Enviando…" : "Enviar imagem"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
          >
            Remover
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ou cole a URL"
        className="text-xs"
      />
    </div>
  );
}
