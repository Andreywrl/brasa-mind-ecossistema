"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

type FaqData = {
  faqs: { id: string; category: string; question: string; answer: string }[];
};

export default function AdminFaqPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<FaqData>(["faq"], "/api/faq");
  const [form, setForm] = useState({
    category: "MEMBRO",
    question: "",
    answer: "",
  });

  async function create() {
    await apiMutate("/api/admin/faq", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setForm({ category: "MEMBRO", question: "", answer: "" });
    await qc.invalidateQueries({ queryKey: ["faq"] });
  }

  async function remove(id: string) {
    await apiMutate(`/api/admin/faq?id=${id}`, { method: "DELETE" });
    await qc.invalidateQueries({ queryKey: ["faq"] });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold">FAQ</h1>
      <p className="text-sm text-muted-foreground">
        Editar aqui altera a mesma tabela que a Área do Membro lê.
      </p>

      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-2">
          {data.faqs.map((f) => (
            <Card key={f.id} className="p-4 space-y-2">
              <div className="text-xs text-muted-foreground">{f.category}</div>
              <div className="font-semibold text-sm">{f.question}</div>
              <p className="text-sm text-muted-foreground">{f.answer}</p>
              <Button size="sm" variant="outline" onClick={() => remove(f.id)}>
                Excluir
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-5 space-y-3">
        <h2 className="font-display font-extrabold">Nova pergunta</h2>
        <Label>Categoria</Label>
        <select
          className="h-11 w-full rounded-xl border border-border bg-secondary px-3 text-sm"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="MEMBRO">Membros</option>
          <option value="EVENTO">Eventos</option>
          <option value="PAGAMENTO">Pagamentos</option>
          <option value="CONTA">Conta</option>
        </select>
        <Label>Pergunta</Label>
        <Input
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
        />
        <Label>Resposta</Label>
        <Textarea
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
        />
        <Button onClick={create}>Salvar</Button>
      </Card>
    </div>
  );
}
