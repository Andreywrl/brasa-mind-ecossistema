"use client";

import { Input, Label } from "@/components/ui/input";
import { MaskedInput } from "@/components/masked-input";
import { useViaCep } from "@/lib/viacep";

export type AddressForm = {
  cep: string;
  endereco: string;
  addressNumber: string;
  addressComplement: string;
  bairro: string;
  cidade: string;
};

export function AddressFields({
  value,
  onChange,
  showCity = true,
}: {
  value: AddressForm;
  onChange: (next: AddressForm) => void;
  showCity?: boolean;
}) {
  const { lookup, loading } = useViaCep();

  async function onCep(cep: string) {
    onChange({ ...value, cep });
    const digits = cep.replace(/\D/g, "");
    if (digits.length === 8) {
      const data = await lookup(cep);
      if (data) {
        onChange({
          ...value,
          cep: data.cep,
          endereco: data.endereco || value.endereco,
          bairro: data.bairro || value.bairro,
          cidade: data.cidade || value.cidade,
          addressComplement: value.addressComplement || data.complemento,
          addressNumber: value.addressNumber,
        });
      }
    }
  }

  return (
    <div className="space-y-3">
      <MaskedInput
        label="CEP"
        mask="cep"
        value={value.cep}
        onChange={onCep}
        required
        placeholder="00000-000"
        autoComplete="postal-code"
      />
      {loading && (
        <p className="text-xs text-muted-foreground">Buscando endereço…</p>
      )}
      <div className="space-y-1">
        <Label>Endereço *</Label>
        <Input
          value={value.endereco}
          onChange={(e) => onChange({ ...value, endereco: e.target.value })}
          autoComplete="street-address"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label>Número *</Label>
          <Input
            value={value.addressNumber}
            onChange={(e) =>
              onChange({ ...value, addressNumber: e.target.value })
            }
            autoComplete="address-line2"
          />
        </div>
        <div className="space-y-1">
          <Label>Complemento</Label>
          <Input
            value={value.addressComplement}
            onChange={(e) =>
              onChange({ ...value, addressComplement: e.target.value })
            }
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Bairro *</Label>
        <Input
          value={value.bairro}
          onChange={(e) => onChange({ ...value, bairro: e.target.value })}
        />
      </div>
      {showCity && (
        <div className="space-y-1">
          <Label>Cidade</Label>
          <Input
            value={value.cidade}
            onChange={(e) => onChange({ ...value, cidade: e.target.value })}
            autoComplete="address-level2"
          />
        </div>
      )}
    </div>
  );
}
