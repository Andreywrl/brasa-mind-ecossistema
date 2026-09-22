"use client";

import { Input, Label } from "@/components/ui/input";
import {
  formatCardNumber,
  formatCep,
  formatCnpj,
  formatCpf,
  formatPhoneBr,
} from "@/lib/br";

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
  return (
    <div className="space-y-1">
      {label && <Label htmlFor={id}>{label}{required ? " *" : ""}</Label>}
      <Input
        id={id}
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
