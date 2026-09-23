"use client";

import { useApiQuery } from "@/lib/api-client";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { labelInvoiceStatus } from "@/lib/labels";

type Fin = {
  kpis: { mrr: string; pendencias: number };
  transactions: {
    id: string;
    nome: string;
    tipo: string;
    data: string;
    valor: string;
    status: string;
  }[];
};

export default function AdminFinanceiroPage() {
  const { data, isLoading } = useApiQuery<Fin>(
    ["admin", "financeiro"],
    "/api/admin/financeiro",
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display text-2xl font-extrabold">Financeiro</h1>
      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="text-xs text-muted-foreground">MRR</div>
              <div className="font-mono text-2xl font-extrabold mt-1">{data.kpis.mrr}</div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-muted-foreground">Pendências</div>
              <div className="font-mono text-2xl font-extrabold mt-1">
                {data.kpis.pendencias}
              </div>
            </Card>
          </div>
          <Card className="p-5">
            <h2 className="font-display font-extrabold mb-3">Transações</h2>
            <ul className="space-y-3">
              {data.transactions.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-border pb-2"
                >
                  <div>
                    <div className="font-semibold">{t.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.tipo} · {new Date(t.data).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <span className="font-mono">{t.valor}</span>
                  <Badge
                    variant={
                      t.status === "PAID"
                        ? "success"
                        : t.status === "REFUNDED"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {labelInvoiceStatus(t.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
