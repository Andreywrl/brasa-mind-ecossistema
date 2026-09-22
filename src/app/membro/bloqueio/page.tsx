"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery } from "@/lib/api-client";
import { Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BloqueioPage() {
  const router = useRouter();
  const { data, isLoading } = useApiQuery<{
    profile: { subscription: { status: string } | null };
  }>(["membro", "me"], "/api/membro/me");

  useEffect(() => {
    if (data && data.profile.subscription?.status !== "BLOCKED") {
      router.replace("/membro");
    }
  }, [data, router]);

  if (isLoading || !data) {
    return <Skeleton className="h-64 max-w-lg" />;
  }

  return (
    <Card className="max-w-lg mx-auto p-8 space-y-4 text-center">
      <h1 className="font-display text-2xl font-extrabold">Acesso bloqueado</h1>
      <p className="text-muted-foreground text-sm">
        Sua mensalidade está em atraso há mais de 30 dias. Quite as competências
        em aberto para voltar a conectar na rede.
      </p>
      <Link href="/membro/financeiro">
        <Button className="w-full">Pagar e liberar</Button>
      </Link>
    </Card>
  );
}
