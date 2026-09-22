const ASAAS_URL = process.env.ASAAS_API_URL ?? "https://sandbox.asaas.com/api/v3";

export function asaasConfigured() {
  return Boolean(process.env.ASAAS_API_KEY);
}

async function asaasFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  if (!process.env.ASAAS_API_KEY) {
    return { ok: false, error: "Asaas sandbox não está configurado." };
  }

  const res = await fetch(`${ASAAS_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: process.env.ASAAS_API_KEY,
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { errors?: { description?: string }[] })?.errors?.[0]?.description ??
      `Asaas HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, data: data as T };
}

export type AsaasCustomer = { id: string };
export type AsaasSubscription = {
  id: string;
  status: string;
  nextDueDate?: string;
  billingType?: string;
};
export type AsaasPayment = {
  id: string;
  status: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  billingType?: string;
};

export async function createCustomer(input: {
  name: string;
  email: string;
  cpfCnpj?: string;
  mobilePhone?: string;
}) {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      cpfCnpj: input.cpfCnpj?.replace(/\D/g, ""),
      mobilePhone: input.mobilePhone?.replace(/\D/g, ""),
    }),
  });
}

export async function createSubscription(input: {
  customer: string;
  value: number;
  nextDueDate: string;
  billingType: "CREDIT_CARD" | "PIX" | "BOLETO";
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}) {
  return asaasFetch<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customer,
      billingType: input.billingType,
      value: input.value,
      nextDueDate: input.nextDueDate,
      cycle: "MONTHLY",
      description: "Mensalidade Brasamind",
      creditCard: input.creditCard,
      creditCardHolderInfo: input.creditCardHolderInfo,
    }),
  });
}

export async function createPayment(input: {
  customer: string;
  value: number;
  dueDate: string;
  billingType: "CREDIT_CARD" | "PIX" | "BOLETO";
  description: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}) {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPixQrCode(paymentId: string) {
  return asaasFetch<{ encodedImage: string; payload: string }>(
    `/payments/${paymentId}/pixQrCode`,
  );
}

export async function updateSubscriptionCreditCard(
  subscriptionId: string,
  input: {
    creditCard: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
    creditCardHolderInfo: {
      name: string;
      email: string;
      cpfCnpj: string;
      postalCode: string;
      addressNumber: string;
      phone: string;
    };
  },
) {
  return asaasFetch<AsaasSubscription>(
    `/subscriptions/${subscriptionId}/creditCard`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}
