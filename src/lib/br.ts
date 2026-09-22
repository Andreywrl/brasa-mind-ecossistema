import { z } from "zod";

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCpf(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCnpj(value: string) {
  const d = onlyDigits(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatCep(value: string) {
  const d = onlyDigits(value).slice(0, 8);
  return d.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

export function formatPhoneBr(value: string) {
  const d = onlyDigits(value).slice(0, 13);
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  // 11 digits local or with country 55
  if (d.startsWith("55") && d.length > 11) {
    const local = d.slice(2);
    return `+55 ${local
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")}`;
  }
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatCardNumber(value: string) {
  return onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function isValidCpf(raw: string) {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let dig = (sum * 10) % 11;
  if (dig === 10) dig = 0;
  if (dig !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  dig = (sum * 10) % 11;
  if (dig === 10) dig = 0;
  return dig === Number(cpf[10]);
}

export function isValidCnpj(raw: string) {
  const cnpj = onlyDigits(raw);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (base: string, factors: number[]) => {
    const sum = factors.reduce((s, f, i) => s + Number(base[i]) * f, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const f1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(cnpj, f1);
  if (d1 !== Number(cnpj[12])) return false;
  const f2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d2 = calc(cnpj, f2);
  return d2 === Number(cnpj[13]);
}

export function isValidCep(raw: string) {
  return onlyDigits(raw).length === 8;
}

/** BR phone: 10-11 digits local, or 12-13 with country 55 */
export function isValidPhoneBr(raw: string) {
  const d = onlyDigits(raw);
  if (d.length >= 10 && d.length <= 11) return true;
  if (d.startsWith("55") && d.length >= 12 && d.length <= 13) return true;
  return false;
}

export function isValidEmail(raw: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

export function luhnOk(raw: string) {
  const d = onlyDigits(raw);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export const emailSchema = z
  .string()
  .trim()
  .min(1, "E-mail obrigatório")
  .refine(isValidEmail, "E-mail inválido")
  .max(190, "E-mail muito longo");

export const cnpjSchema = z
  .string()
  .min(1, "CNPJ obrigatório")
  .refine((v) => isValidCnpj(v), "CNPJ inválido");

export const cpfSchema = z
  .string()
  .min(1, "CPF obrigatório")
  .refine((v) => isValidCpf(v), "CPF inválido");

export const cepSchema = z
  .string()
  .min(1, "CEP obrigatório")
  .refine((v) => isValidCep(v), "CEP inválido");

export const phoneSchema = z
  .string()
  .min(1, "Telefone obrigatório")
  .refine((v) => isValidPhoneBr(v), "Telefone inválido");

export const optionalPhoneSchema = z
  .string()
  .optional()
  .refine((v) => v === undefined || v === "" || isValidPhoneBr(v), "Telefone inválido");

export const creditCardSchema = z.object({
  holderName: z.string().trim().min(2, "Nome no cartão obrigatório").max(80),
  number: z
    .string()
    .refine((v) => luhnOk(v), "Número do cartão inválido"),
  expiryMonth: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, "Mês inválido (MM)"),
  expiryYear: z
    .string()
    .regex(/^\d{4}$/, "Ano inválido (AAAA)")
    .refine((y) => Number(y) >= new Date().getFullYear(), "Cartão vencido"),
  ccv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
});

export type CreditCardInput = z.infer<typeof creditCardSchema>;

export const signupBodySchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório").max(120),
  email: emailSchema,
  whatsapp: phoneSchema,
  password: z.string().min(8, "Senha: mínimo 8 caracteres").max(72),
  empresa: z.string().trim().min(2, "Empresa obrigatória").max(160),
  cnpj: cnpjSchema,
  especialidade: z.string().trim().max(120).optional().or(z.literal("")),
  cidade: z.string().trim().max(80).optional().or(z.literal("")),
  cep: cepSchema,
  addressNumber: z.string().trim().min(1, "Número obrigatório").max(20),
  addressComplement: z.string().trim().max(80).optional().or(z.literal("")),
  bairro: z.string().trim().min(1, "Bairro obrigatório").max(80),
  endereco: z.string().trim().min(2, "Endereço obrigatório").max(200),
  paymentMethod: z.enum(["CREDIT_CARD", "PIX", "BOLETO"]),
  creditCard: creditCardSchema.optional(),
});

export const guestPayBodySchema = z.object({
  nome: z.string().trim().min(2, "Nome obrigatório").max(120),
  empresa: z.string().trim().max(160).optional().or(z.literal("")),
  email: emailSchema,
  whatsapp: optionalPhoneSchema,
  cpf: cpfSchema,
  cep: cepSchema,
  addressNumber: z.string().trim().min(1, "Número obrigatório").max(20),
  paymentMethod: z.enum(["CREDIT_CARD", "PIX", "BOLETO"]),
  creditCard: creditCardSchema.optional(),
});

export const profilePatchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: emailSchema.optional(),
  empresa: z.string().trim().min(2).max(160).optional(),
  cnpj: z
    .string()
    .optional()
    .refine((v) => !v || isValidCnpj(v), "CNPJ inválido"),
  especialidade: z.string().max(120).optional(),
  cidade: z.string().max(80).optional(),
  whatsapp: optionalPhoneSchema,
  telefone: optionalPhoneSchema,
  instagram: z.string().max(80).optional(),
  linkedin: z.string().max(160).optional(),
  site: z.string().max(200).optional(),
  endereco: z.string().max(200).optional(),
  cep: z
    .string()
    .optional()
    .refine((v) => !v || isValidCep(v), "CEP inválido"),
  addressNumber: z.string().max(20).optional(),
  addressComplement: z.string().max(80).optional(),
  bairro: z.string().max(80).optional(),
  youtube: z.string().max(300).optional(),
  descricao: z.string().max(4000).optional(),
  fotoUrl: z.string().max(500).optional(),
  capaUrl: z.string().max(500).optional(),
  password: z.string().min(8).max(72).optional(),
  currentPassword: z.string().optional(),
});

export function zodErrorMessage(err: z.ZodError) {
  return err.issues[0]?.message ?? "Dados inválidos";
}

export function asaasCpfCnpj(value: string) {
  return onlyDigits(value);
}

export function asaasPostalCode(cep: string) {
  return onlyDigits(cep);
}

export function asaasPhone(phone: string) {
  return onlyDigits(phone);
}
