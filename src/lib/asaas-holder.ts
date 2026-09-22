import type { MemberProfile } from "@prisma/client";
import { asaasCpfCnpj, asaasPhone, asaasPostalCode } from "@/lib/br";

export type HolderInfo = {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
};

export function holderFromProfile(
  profile: Pick<
    MemberProfile,
    "empresa" | "cnpj" | "cep" | "addressNumber" | "whatsapp" | "telefone"
  >,
  user: { name?: string | null; email: string },
): HolderInfo | { error: string } {
  if (!profile.cnpj) return { error: "CNPJ ausente no perfil. Atualize em Meu perfil." };
  if (!profile.cep) return { error: "CEP ausente no perfil. Atualize em Meu perfil." };
  if (!profile.addressNumber) {
    return { error: "Número do endereço ausente. Atualize em Meu perfil." };
  }
  const phone = profile.whatsapp || profile.telefone;
  if (!phone) return { error: "WhatsApp/telefone ausente no perfil." };

  return {
    name: user.name ?? profile.empresa,
    email: user.email,
    cpfCnpj: asaasCpfCnpj(profile.cnpj),
    postalCode: asaasPostalCode(profile.cep),
    addressNumber: profile.addressNumber,
    phone: asaasPhone(phone),
  };
}

export function holderFromGuest(input: {
  nome: string;
  email: string;
  cpf: string;
  cep: string;
  addressNumber: string;
  whatsapp?: string;
}): HolderInfo {
  return {
    name: input.nome,
    email: input.email,
    cpfCnpj: asaasCpfCnpj(input.cpf),
    postalCode: asaasPostalCode(input.cep),
    addressNumber: input.addressNumber,
    phone: asaasPhone(input.whatsapp ?? ""),
  };
}
