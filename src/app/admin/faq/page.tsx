"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ActionMenu } from "@/components/ui/action-menu";
import toast from "react-hot-toast";
import { toastActionError } from "@/lib/action-toast";

type FaqData = {
  faqs: { id: string; category: string; question: string; answer: string }[];
};

export default function AdminFaqPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<FaqData>(["faq"], "/api/faq");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    category: "MEMBRO",
    question: "",
    answer: "",
  });
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function create() {
    setSaving(true);
    try {
      await apiMutate("/api/admin/faq", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Pergunta publicada.");
      setForm({ category: "MEMBRO", question: "", answer: "" });
      setFormOpen(false);
      await qc.invalidateQueries({ queryKey: ["faq"] });
    } catch (e) {
      toastActionError(e, "Não foi possível salvar a pergunta.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setRemoving(true);
    try {
      await apiMutate(`/api/admin/faq?id=${id}`, { method: "DELETE" });
      toast.success("Pergunta excluída.");
      setRemoveId(null);
      await qc.invalidateQueries({ queryKey: ["faq"] });
    } catch (e) {
      toastActionError(e, "Não foi possível excluir a pergunta.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">FAQ</h1>
          <p className="text-sm text-muted-foreground">
            Editar aqui altera a mesma tabela que a Área do Membro lê.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ category: "MEMBRO", question: "", answer: "" });
            setFormOpen(true);
          }}
        >
          Nova pergunta
        </Button>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="flex flex-col gap-2">
          {data.faqs.map((f) => (
            <Card key={f.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{f.category}</div>
                <div className="text-sm font-semibold">{f.question}</div>
                <p className="text-sm text-muted-foreground">{f.answer}</p>
              </div>
              <ActionMenu
                label="Ações da pergunta"
                items={[
                  {
                    label: "Excluir",
                    destructive: true,
                    onSelect: () => setRemoveId(f.id),
                  },
                ]}
              />
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nova pergunta"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={create} loading={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
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
        </div>
      </Modal>

      <Modal
        open={Boolean(removeId)}
        onClose={() => setRemoveId(null)}
        title="Excluir pergunta"
        description="A pergunta some da FAQ do membro e do admin."
        footer={
          <>
            <Button variant="outline" onClick={() => setRemoveId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={removing}
              onClick={() => removeId && remove(removeId)}
            >
              {removing ? "Excluindo…" : "Excluir"}
            </Button>
          </>
        }
      />
    </div>
  );
}
