import { sendEmail } from "@/lib/email";
import { labelCategory } from "@/lib/labels";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function emailMembershipInvite(input: {
  to: string;
  link: string;
  categoria: string;
}) {
  return sendEmail({
    to: input.to,
    subject: "Seu link para entrar no Brasamind",
    html: `<p>Olá,</p>
<p>Você foi convidado a se tornar membro do Brasamind (${labelCategory(input.categoria)}).</p>
<p><a href="${input.link}">Quero ser membro</a></p>
<p>Conecte, indique e feche negócios no Brasa.</p>`,
  });
}

export async function emailTicketConfirmed(input: {
  to: string;
  eventName: string;
  checkinCode?: string;
}) {
  return sendEmail({
    to: input.to,
    subject: `Ingresso confirmado · ${input.eventName}`,
    html: `<p>Olá,</p>
<p>Seu ingresso para <strong>${input.eventName}</strong> está confirmado.</p>
${
  input.checkinCode
    ? `<p>Código de check-in: <strong>${input.checkinCode}</strong> (também disponível na área do membro / QR).</p>`
    : ""
}
<p><a href="${appUrl()}/membro/evento">Ver evento</a></p>`,
  });
}

export async function emailGuestTicketConfirmed(input: {
  to: string;
  eventName: string;
  checkinCode: string;
  hostName?: string | null;
}) {
  return sendEmail({
    to: input.to,
    subject: `Presença confirmada · ${input.eventName}`,
    html: `<p>Olá,</p>
<p>Sua presença no encontro <strong>${input.eventName}</strong> do Brasamind está confirmada${
      input.hostName ? `, a convite de ${input.hostName}` : ""
    }.</p>
<p>Código de check-in: <strong>${input.checkinCode}</strong></p>
<p>Apresente o QR ou o código na portaria.</p>`,
  });
}

export async function emailMembershipInvoice(input: {
  to: string;
  competencia?: string | null;
  amountLabel: string;
}) {
  return sendEmail({
    to: input.to,
    subject: `Mensalidade ${input.competencia ?? ""} · Brasamind`.trim(),
    html: `<p>Olá,</p>
<p>Registramos o pagamento da mensalidade ${
      input.competencia ?? ""
    } (${input.amountLabel}).</p>
<p><a href="${appUrl()}/membro/financeiro">Ver financeiro</a></p>`,
  });
}
