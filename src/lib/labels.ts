/** Rótulos em português para enums internos (API continua em inglês). */

export function labelRegistrationStatus(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmado";
    case "PENDING_PAYMENT":
      return "Aguardando pagamento";
    case "CHECKED_IN":
      return "Entrada registrada";
    case "NO_SHOW":
      return "Faltou";
    case "CANCELED":
      return "Cancelado";
    default:
      return status === "-" ? "Sem inscrição" : status;
  }
}

export function labelInvoiceStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "Em aberto";
    case "PAID":
      return "Pago";
    case "OVERDUE":
      return "Em atraso";
    case "REFUNDED":
      return "Estornado";
    case "CANCELED":
      return "Cancelado";
    default:
      return status;
  }
}

export function labelSubscriptionStatus(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Em dia";
    case "PENDING":
      return "Pendente";
    case "PAST_DUE":
      return "Em atraso";
    case "BLOCKED":
      return "Bloqueado";
    case "CANCELED":
      return "Cancelado";
    default:
      return status;
  }
}

export function labelCategory(categoria: string) {
  switch (categoria) {
    case "FUNDADOR":
      return "Fundador";
    case "PATROCINADOR":
      return "Patrocinador";
    case "MEMBRO":
      return "Membro";
    case "CONVIDADO":
      return "Convidado";
    default:
      return categoria;
  }
}

export function labelRegistrationType(type: string) {
  switch (type) {
    case "MEMBER":
      return "Membro";
    case "GUEST":
      return "Convidado";
    default:
      return type;
  }
}

export function labelInvoiceKind(kind: string) {
  switch (kind) {
    case "MEMBERSHIP":
      return "Mensalidade";
    case "EVENT_TICKET":
      return "Ingresso";
    case "GUEST_TICKET":
      return "Ingresso convidado";
    default:
      return kind;
  }
}

export function labelPointAction(action: string) {
  switch (action) {
    case "PRESENCA":
      return "Presença no encontro";
    case "ASSIDUIDADE":
      return "Assiduidade";
    case "CONVITE_CONVERTIDO":
      return "Indicação que virou membro";
    case "ADIMPLENCIA":
      return "Mensalidade em dia";
    case "MANUAL":
      return "Pontos extras";
    default:
      return action;
  }
}

export function labelPaymentMethod(method: string) {
  switch (method) {
    case "CREDIT_CARD":
      return "Cartão";
    case "PIX":
      return "PIX";
    case "BOLETO":
      return "Boleto";
    default:
      return method;
  }
}
