"use client";

import { Input, Label } from "@/components/ui/input";
import {
  formatCardNumber,
  formatCep,
  formatCnpj,
  formatCpf,
  formatPhoneBr,
} from "@/lib/br";
import { useId } from "react";

type Mask = "cpf" | "cnpj" | "cep" | "phone" | "card";

const formatters: Record<Mask, (v: string) => string> = {
  cpf: formatCpf,
  cnpj: formatCnpj,
  cep: formatCep,
  phone: formatPhoneBr,
  card: formatCardNumber,
};

export function MaskedInput({
  label,
  mask,
  value,
  onChange,
  id,
  required,
  autoComplete,
  inputMode,
  placeholder,
}: {
  label?: string;
  mask: Mask;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="space-y-1">
      {label && (
        <Label htmlFor={inputId}>
          {label}
          {required ? " *" : ""}
        </Label>
      )}
      <Input
        id={inputId}
        value={value}
        onChange={(e) => onChange(formatters[mask](e.target.value))}
        autoComplete={autoComplete}
        inputMode={inputMode ?? "numeric"}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
