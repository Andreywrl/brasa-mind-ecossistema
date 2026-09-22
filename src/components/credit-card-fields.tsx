"use client";

import { Input, Label } from "@/components/ui/input";
import { MaskedInput } from "@/components/masked-input";
import type { CreditCardInput } from "@/lib/br";

export type CardFormState = CreditCardInput;

const emptyCard: CardFormState = {
  holderName: "",
  number: "",
  expiryMonth: "",
  expiryYear: "",
  ccv: "",
};

export function emptyCreditCard(): CardFormState {
  return { ...emptyCard };
}

export function CreditCardFields({
  value,
  onChange,
}: {
  value: CardFormState;
  onChange: (next: CardFormState) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Os dados do cartão vão direto ao Asaas e não ficam gravados no Brasamind.
      </p>
      <div className="space-y-1">
        <Label>Nome no cartão *</Label>
        <Input
          value={value.holderName}
          onChange={(e) => onChange({ ...value, holderName: e.target.value })}
          autoComplete="cc-name"
        />
      </div>
      <MaskedInput
        label="Número"
        mask="card"
        value={value.number}
        onChange={(number) => onChange({ ...value, number })}
        autoComplete="cc-number"
        required
      />
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label>Mês</Label>
          <Input
            placeholder="MM"
            value={value.expiryMonth}
            maxLength={2}
            inputMode="numeric"
            autoComplete="cc-exp-month"
            onChange={(e) =>
              onChange({
                ...value,
                expiryMonth: e.target.value.replace(/\D/g, "").slice(0, 2),
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Ano</Label>
          <Input
            placeholder="AAAA"
            value={value.expiryYear}
            maxLength={4}
            inputMode="numeric"
            autoComplete="cc-exp-year"
            onChange={(e) =>
              onChange({
                ...value,
                expiryYear: e.target.value.replace(/\D/g, "").slice(0, 4),
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label>CVV</Label>
          <Input
            placeholder="CVV"
            value={value.ccv}
            maxLength={4}
            inputMode="numeric"
            autoComplete="cc-csc"
            onChange={(e) =>
              onChange({
                ...value,
                ccv: e.target.value.replace(/\D/g, "").slice(0, 4),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
