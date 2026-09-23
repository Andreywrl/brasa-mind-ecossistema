"use client";

import { useState } from "react";
import { MaskedInput } from "@/components/masked-input";
import { Input, Label } from "@/components/ui/input";
import { formatCep, formatCnpj, formatCpf } from "@/lib/br";

/** Página de laboratório para e2e de máscaras (sem banco). */
export default function MascarasLabPage() {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cep, setCep] = useState("");

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="font-display text-2xl font-extrabold">Máscaras</h1>
      <div className="space-y-1">
        <Label htmlFor="lab-email">E-mail</Label>
        <Input
          id="lab-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <MaskedInput
        label="CPF"
        mask="cpf"
        value={cpf}
        onChange={(v) => setCpf(formatCpf(v))}
      />
      <MaskedInput
        label="CNPJ"
        mask="cnpj"
        value={cnpj}
        onChange={(v) => setCnpj(formatCnpj(v))}
      />
      <MaskedInput
        label="CEP"
        mask="cep"
        value={cep}
        onChange={(v) => setCep(formatCep(v))}
      />
    </main>
  );
}
