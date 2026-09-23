"use client";

import { useMemo, useState } from "react";
import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";

type FaqData = {
  faqs: {
    id: string;
    category: string;
    question: string;
    answer: string;
  }[];
};

const labels: Record<string, string> = {
  MEMBRO: "Membros",
  EVENTO: "Eventos",
  PAGAMENTO: "Pagamentos",
  CONTA: "Conta",
};

export default function FaqPage() {
  const { data, isLoading } = useApiQuery<FaqData>(["faq"], "/api/faq");
  const [cat, setCat] = useState("TODOS");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (cat === "TODOS") return data.faqs;
    return data.faqs.filter((f) => f.category === cat);
  }, [data, cat]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold">FAQ</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Dúvidas sobre a rede, eventos e pagamentos.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["TODOS", "MEMBRO", "EVENTO", "PAGAMENTO", "CONTA"].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border border-border ${
              cat === c ? "bg-secondary" : "text-muted-foreground"
            }`}
          >
            {c === "TODOS" ? "Todos" : labels[c]}
          </button>
        ))}
      </div>

      {isLoading || !data ? (
        <div className="space-y-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => (
            <Card key={f.id} className="overflow-hidden">
              <button
                className="w-full text-left p-4 font-semibold text-sm flex justify-between gap-3"
                onClick={() => setOpen(open === f.id ? null : f.id)}
              >
                <span>{f.question}</span>
                <span className="text-muted-foreground">{open === f.id ? "−" : "+"}</span>
              </button>
              {open === f.id && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {f.answer}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card className="p-5 space-y-3">
        <h2 className="font-display font-extrabold">Ainda precisa de ajuda?</h2>
        <p className="text-sm text-muted-foreground">
          Fale com o time do Brasa no WhatsApp e a gente te conecta com quem resolve.
        </p>
        <a
          href="https://wa.me/5551999990000?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20o%20Brasamind."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-md bg-brasa px-4 text-sm font-semibold text-white"
        >
          Chamar no WhatsApp
        </a>
      </Card>
    </div>
  );
}
