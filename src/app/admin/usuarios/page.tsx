"use client";

import { useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Users = {
  admins: {
    id: string;
    name: string | null;
    email: string;
    adminPerms: {
      membros: boolean;
      eventos: boolean;
      financeiro: boolean;
      ranking: boolean;
      usuarios: boolean;
      termos: boolean;
    } | null;
  }[];
  door: {
    id: string;
    login: string;
    active: boolean;
    expiresAt: string;
    user: { name: string | null; email: string };
    event: { nome: string } | null;
  }[];
};

export default function AdminUsuariosPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<Users>(
    ["admin", "usuarios"],
    "/api/admin/usuarios",
  );
  const [doorForm, setDoorForm] = useState({
    name: "",
    email: "",
    password: "",
    login: "",
  });

  async function createDoor() {
    await apiMutate("/api/admin/usuarios", {
      method: "POST",
      body: JSON.stringify({ type: "door", ...doorForm }),
    });
    setDoorForm({ name: "", email: "", password: "", login: "" });
    await qc.invalidateQueries({ queryKey: ["admin", "usuarios"] });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display text-2xl font-extrabold">Usuários</h1>

      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <Card className="p-5 space-y-3">
            <h2 className="font-display font-extrabold">Administradores</h2>
            {data.admins.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap justify-between gap-2 text-sm border-b border-border pb-2"
              >
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.email}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {a.adminPerms &&
                    Object.entries(a.adminPerms)
                      .filter(([, v]) => typeof v === "boolean" && v)
                      .map(([k]) => (
                        <Badge key={k} variant="secondary">
                          {k}
                        </Badge>
                      ))}
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-5 space-y-3">
            <h2 className="font-display font-extrabold">Portaria</h2>
            {data.door.map((d) => (
              <div
                key={d.id}
                className="flex justify-between gap-2 text-sm border-b border-border pb-2"
              >
                <div>
                  <div className="font-semibold">
                    {d.user.name} ({d.login})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {d.event?.nome ?? "Sem evento"} · expira{" "}
                    {new Date(d.expiresAt).toLocaleString("pt-BR")}
                  </div>
                </div>
                <Badge variant={d.active ? "success" : "destructive"}>
                  {d.active ? "Ativo" : "Expirado"}
                </Badge>
              </div>
            ))}
            <div className="grid sm:grid-cols-2 gap-2 pt-2">
              <div>
                <Label>Nome</Label>
                <Input
                  value={doorForm.name}
                  onChange={(e) => setDoorForm({ ...doorForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Login</Label>
                <Input
                  value={doorForm.login}
                  onChange={(e) => setDoorForm({ ...doorForm, login: e.target.value })}
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  value={doorForm.email}
                  onChange={(e) => setDoorForm({ ...doorForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={doorForm.password}
                  onChange={(e) =>
                    setDoorForm({ ...doorForm, password: e.target.value })
                  }
                />
              </div>
            </div>
            <Button onClick={createDoor}>Gerar acesso</Button>
          </Card>
        </>
      )}
    </div>
  );
}
