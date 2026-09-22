"use client";

import { useCallback, useState } from "react";
import { formatCep, onlyDigits } from "@/lib/br";

export type ViaCepResult = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export function useViaCep() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookup = useCallback(async (cepRaw: string) => {
    const cep = onlyDigits(cepRaw);
    if (cep.length !== 8) {
      setError("");
      return null;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!res.ok) throw new Error("Falha ao consultar CEP");
      const data = (await res.json()) as ViaCepResult;
      if (data.erro) {
        setError("CEP não encontrado");
        return null;
      }
      return {
        cep: formatCep(data.cep || cep),
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
        complemento: data.complemento || "",
      };
    } catch {
      setError("Não foi possível consultar o CEP");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { lookup, loading, error, setError };
}
