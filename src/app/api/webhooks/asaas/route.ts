import { prisma } from "@/lib/db";
import {
  emailGuestTicketConfirmed,
  emailMembershipInvoice,
  emailTicketConfirmed,
} from "@/lib/email-templates";
import { formatCurrency } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const token = req.headers.get("asaas-access-token");
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  if (isProd && !process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json(
      { error: "ASAAS_WEBHOOK_TOKEN obrigatório em produção" },
      { status: 500 },
    );
  }

  if (
    process.env.ASAAS_WEBHOOK_TOKEN &&
    token !== process.env.ASAAS_WEBHOOK_TOKEN
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as {
    event?: string;
    payment?: {
      id: string;
      status: string;
      customer?: string;
      subscription?: string;
      value?: number;
    };
  };

  const paymentId = payload.payment?.id;
  const status = payload.payment?.status;

  if (!paymentId || !status) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const invoice = await prisma.invoice.findFirst({
    where: { asaasPaymentId: paymentId },
    include: {
      registration: {
        include: {
          event: true,
          guest: { include: { invite: { include: { host: { include: { user: true } } } } } },
          member: { include: { user: true } },
        },
      },
      member: { include: { user: true } },
    },
  });

  const paid = ["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"].includes(status);
  const wasUnpaid = invoice?.status !== "PAID";

  if (invoice) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: paid ? "PAID" : status === "REFUNDED" ? "REFUNDED" : "PENDING",
        paidAt: paid ? new Date() : null,
      },
    });

    if (invoice.registrationId && paid) {
      await prisma.registration.update({
        where: { id: invoice.registrationId },
        data: { status: "CONFIRMED" },
      });

      if (invoice.kind === "GUEST_TICKET" && invoice.registration?.guestId) {
        const reg = invoice.registration;
        const guest = reg.guest;
        if (guest?.invite) {
          await prisma.pointEntry.create({
            data: {
              memberId: guest.invite.hostId,
              action: "CONVITE_CONVERTIDO",
              pontos: 50,
              note: `Indicação de ${guest.nome}`,
              eventId: reg.eventId,
            },
          });
          if (wasUnpaid) {
            void emailGuestTicketConfirmed({
              to: guest.email,
              eventName: reg.event.nome,
              checkinCode: reg.checkinCode,
              hostName: guest.invite.host.user.name ?? null,
            });
          }
        }
      }

      if (
        wasUnpaid &&
        invoice.kind === "EVENT_TICKET" &&
        invoice.registration?.member?.user.email
      ) {
        void emailTicketConfirmed({
          to: invoice.registration.member.user.email,
          eventName: invoice.registration.event.nome,
          checkinCode: invoice.registration.checkinCode,
        });
      }
    }

    if (invoice.kind === "MEMBERSHIP" && invoice.memberId && paid) {
      await prisma.subscription.update({
        where: { memberId: invoice.memberId },
        data: { status: "ACTIVE", overdueSince: null },
      });
      if (invoice.member) {
        await prisma.notification.create({
          data: {
            userId: invoice.member.userId,
            tipo: "FINANCEIRO",
            titulo: "Mensalidade confirmada",
          },
        });
        if (wasUnpaid && invoice.member.user.email) {
          void emailMembershipInvoice({
            to: invoice.member.user.email,
            competencia: invoice.competencia,
            amountLabel: formatCurrency(invoice.amountCents),
          });
        }
      }
    }
  }

  // Overdue handling via subscription events
  if (payload.event === "PAYMENT_OVERDUE" && payload.payment?.subscription) {
    const sub = await prisma.subscription.findFirst({
      where: { asaasSubscriptionId: payload.payment.subscription },
      include: { member: true },
    });
    if (sub) {
      const overdueSince = sub.overdueSince ?? new Date();
      const days =
        (Date.now() - overdueSince.getTime()) / (1000 * 60 * 60 * 24);
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: days > 30 ? "BLOCKED" : "PAST_DUE",
          overdueSince,
        },
      });
      await prisma.notification.create({
        data: {
          userId: sub.member.userId,
          tipo: "FINANCEIRO",
          titulo:
            days > 30
              ? "Acesso bloqueado por inadimplência"
              : "Mensalidade em atraso",
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
