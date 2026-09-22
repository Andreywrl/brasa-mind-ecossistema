"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

type Termos = {
  docs: {
    id: string;
    type: string;
    nome: string;
    versao: string;
    resumo: string | null;
    published: boolean;
    _count: { consents: number };
  }[];
};

export default function AdminTermosPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<Termos>(
    ["admin", "termos"],
    "/api/admin/termos",
  );
  const [form, setForm] = useState({
    type: "TERMS" as "TERMS" | "PRIVACY",
    nome: "",
    versao: "",
    resumo: "",
    conteudo: "",
    published: true,
  });

  async function publish() {
    await apiMutate("/api/admin/termos", {
      method: "POST",
      body: JSON.stringify(form),
    });
    await qc.invalidateQueries({ queryKey: ["admin", "termos"] });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold">Termos e privacidade</h1>
      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {data.docs.map((d) => (
            <Card key={d.id} className="p-5 space-y-2">
              <div className="flex justify-between gap-2">
                <h2 className="font-semibold">
                  {d.nome} · {d.versao}
                </h2>
                <Badge variant={d.published ? "success" : "secondary"}>
                  {d.published ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{d.resumo}</p>
              <p className="text-xs text-muted-foreground">
                {d._count.consents} aceites
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-5 space-y-3">
        <h2 className="font-display font-extrabold">Publicar nova versão</h2>
        <Label>Tipo</Label>
        <select
          className="h-11 w-full rounded-xl border border-border bg-secondary px-3 text-sm"
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value as "TERMS" | "PRIVACY" })
          }
        >
          <option value="TERMS">Termos de Uso</option>
          <option value="PRIVACY">Privacidade</option>
        </select>
        <Label>Nome</Label>
        <Input
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
        <Label>Versão</Label>
        <Input
          value={form.versao}
          onChange={(e) => setForm({ ...form, versao: e.target.value })}
        />
        <Label>Resumo</Label>
        <Input
          value={form.resumo}
          onChange={(e) => setForm({ ...form, resumo: e.target.value })}
        />
        <Label>Conteúdo</Label>
        <Textarea
          value={form.conteudo}
          onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
        />
        <Button onClick={publish}>Publicar</Button>
      </Card>
    </div>
  );
}
