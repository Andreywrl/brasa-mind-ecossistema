/**
 * Seed mínimo para desenvolvimento / demo.
 * Contas: 1 membro, 1 admin, 1 portaria · 1 evento ativo · 1 passado com nota.
 */
import {
  PrismaClient,
  MemberCategory,
  PointAction,
  FaqCategory,
  LegalDocType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const checkinCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);

async function wipe() {
  console.log("Limpando…");
  await prisma.eventReview.deleteMany();
  await prisma.memberAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.pointEntry.deleteMany();
  await prisma.pointRule.deleteMany();
  await prisma.negativeRule.deleteMany();
  await prisma.prize.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.eventPrice.deleteMany();
  await prisma.doorAccess.deleteMany();
  await prisma.event.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.membershipInvite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.legalDocument.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminPermission.deleteMany();
  await prisma.memberProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Seed mínimo Brasamind…");
  await wipe();

  const memberPassword = await bcrypt.hash(
    process.env.SEED_MEMBER_PASSWORD ?? "membro123",
    10,
  );
  const adminPassword = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD ?? "admin123",
    10,
  );

  await prisma.category.createMany({
    data: [
      {
        nome: MemberCategory.FUNDADOR,
        descricao: "Sócios fundadores do Brasamind.",
        entradaLabel: "Cortesia",
        entradaCents: 0,
        chipClass: "bg-brasa text-white",
      },
      {
        nome: MemberCategory.PATROCINADOR,
        descricao: "Patrocinadores com destaque nos eventos.",
        entradaLabel: "R$ 100,00",
        entradaCents: 10000,
        chipClass: "bg-secondary text-primary",
      },
      {
        nome: MemberCategory.MEMBRO,
        descricao: "Membros da rede.",
        entradaLabel: "R$ 180,00",
        entradaCents: 18000,
        chipClass: "bg-secondary text-muted-foreground",
      },
    ],
  });

  const joaoUser = await prisma.user.create({
    data: {
      name: "João da Silva",
      email: "joao@silvaalimentos.com.br",
      passwordHash: memberPassword,
      role: "MEMBRO",
      profile: {
        create: {
          empresa: "Silva Alimentos",
          especialidade: "Food service",
          cidade: "Porto Alegre",
          categoria: MemberCategory.FUNDADOR,
          whatsapp: "+55 51 99999 0000",
          descricao: "Fundador do Brasamind. Conecte, indique e feche mais negócios.",
          cep: "90010000",
          addressNumber: "100",
          bairro: "Centro",
          subscription: {
            create: {
              status: "ACTIVE",
              amountCents: 9700,
              billingDay: 5,
              paymentMethod: "CREDIT_CARD",
              nextDueDate: new Date("2026-09-05"),
            },
          },
        },
      },
    },
    include: { profile: true },
  });
  const joao = joaoUser.profile!;

  await prisma.pointEntry.createMany({
    data: [
      {
        memberId: joao.id,
        action: PointAction.PRESENCA,
        pontos: 90,
        occurredAt: new Date("2026-06-21"),
      },
      {
        memberId: joao.id,
        action: PointAction.CONVITE_CONVERTIDO,
        pontos: 50,
        occurredAt: new Date("2026-06-22"),
      },
      {
        memberId: joao.id,
        action: PointAction.ADIMPLENCIA,
        pontos: 20,
        occurredAt: new Date("2026-07-05"),
      },
    ],
  });

  await prisma.invoice.create({
    data: {
      memberId: joao.id,
      kind: "MEMBERSHIP",
      status: "PENDING",
      amountCents: 9700,
      competencia: "Agosto 2026",
      dueDate: new Date("2026-08-05"),
      paymentMethod: "CREDIT_CARD",
    },
  });

  const carla = await prisma.user.create({
    data: {
      name: "Carla Teixeira",
      email: "carla@brasamind.com.br",
      passwordHash: adminPassword,
      role: "ADMIN",
      adminPerms: {
        create: {
          membros: true,
          eventos: true,
          financeiro: true,
          ranking: true,
          usuarios: true,
          termos: true,
        },
      },
    },
  });

  await prisma.membershipInvite.create({
    data: {
      token: "seed-membro-link",
      createdById: carla.id,
      categoria: MemberCategory.MEMBRO,
      maxUses: 50,
      active: true,
    },
  });

  const prices = [
    { tier: "FUNDADOR" as const, amountCents: 0, label: "Fundador" },
    { tier: "PATROCINADOR" as const, amountCents: 10000, label: "Patrocinador" },
    { tier: "MEMBRO" as const, amountCents: 18000, label: "Membro" },
    { tier: "CONVIDADO" as const, amountCents: 20000, label: "Convidado" },
  ];

  const pastEvent = await prisma.event.create({
    data: {
      nome: "Networking de Inverno",
      data: new Date("2026-06-21T19:00:00"),
      hora: "19h00",
      local: "Gramado RS",
      localShort: "Gramado RS",
      descricao: "Encontro de inverno na serra.",
      palestrante: "Marina Fogaça",
      vagas: 80,
      ativo: false,
      prices: { create: prices },
    },
  });

  const activeEvent = await prisma.event.create({
    data: {
      nome: "A mente por trás dos grandes movimentos",
      data: new Date("2026-08-28T19:00:00"),
      hora: "19h00",
      local: "R. Leopoldo Bier, 644, Santana, Porto Alegre RS",
      localShort: "Espaço Brasamind, Porto Alegre RS",
      descricao:
        "Small Meeting com assado, empreendedorismo e network. Palestra com Eduardo Seibel.",
      palestrante: "Eduardo Seibel",
      palestranteBio: "Marketing da Agrofel, Yara e Alibem",
      vagas: 120,
      ativo: true,
      cronograma: [
        { hora: "19h00", item: "Chegada" },
        { hora: "21h00", item: "Palestra" },
        { hora: "23h00", item: "Encerramento" },
      ],
      prices: { create: prices },
    },
  });

  await prisma.user.create({
    data: {
      name: "Portaria 1",
      email: "portaria1@brasamind.com.br",
      passwordHash: adminPassword,
      role: "PORTARIA",
      doorAccess: {
        create: {
          login: "seg-portaria-1",
          eventId: activeEvent.id,
          expiresAt: new Date("2026-08-28T23:59:00"),
          active: true,
        },
      },
    },
  });

  await prisma.invite.create({
    data: {
      token: "seed-guest-invite",
      eventId: activeEvent.id,
      hostId: joao.id,
      message:
        "Te chamo para o próximo encontro do Brasamind, dia 28/08 às 19h no Espaço Brasamind.",
    },
  });

  await prisma.registration.create({
    data: {
      eventId: activeEvent.id,
      memberId: joao.id,
      type: "MEMBER",
      status: "CONFIRMED",
      ticketCents: 0,
      checkinCode: checkinCode(),
    },
  });

  await prisma.registration.create({
    data: {
      eventId: pastEvent.id,
      memberId: joao.id,
      type: "MEMBER",
      status: "CHECKED_IN",
      ticketCents: 0,
      checkinCode: checkinCode(),
      checkinAt: new Date("2026-06-21T19:12:00"),
    },
  });

  await prisma.eventReview.create({
    data: {
      eventId: pastEvent.id,
      stars: 5,
      comment: "Encontro forte: networking fluindo e assado no ponto.",
      authorId: carla.id,
    },
  });

  await prisma.pointRule.createMany({
    data: [
      { action: PointAction.PRESENCA, pontos: 90, label: "Presença no encontro" },
      { action: PointAction.ASSIDUIDADE, pontos: 60, label: "Assiduidade" },
      { action: PointAction.CONVITE_CONVERTIDO, pontos: 50, label: "Indicação que virou membro" },
      { action: PointAction.ADIMPLENCIA, pontos: 20, label: "Mensalidade em dia" },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        category: FaqCategory.MEMBRO,
        question: "O que é o Brasamind?",
        answer:
          "O Brasamind conecta empresários gaúchos em encontros com muito churrasco, palestra e networking.",
        order: 0,
      },
      {
        category: FaqCategory.PAGAMENTO,
        question: "Quanto custa a mensalidade?",
        answer: "R$ 97,00, cobrada via Asaas todo dia 05.",
        order: 1,
      },
    ],
  });

  await prisma.legalDocument.createMany({
    data: [
      {
        type: LegalDocType.TERMS,
        nome: "Termos de Uso",
        versao: "v3.2",
        resumo: "Regras de participação no Brasamind.",
        conteudo:
          "Ao participar do Brasamind você concorda com as regras de networking e mensalidade.",
        published: true,
        publishedAt: new Date("2026-07-01"),
      },
      {
        type: LegalDocType.PRIVACY,
        nome: "Política de Privacidade",
        versao: "v2.1",
        resumo: "Tratamento de dados (LGPD).",
        conteudo:
          "Tratamos dados para operar a rede, cobranças e convites, conforme a LGPD.",
        published: true,
        publishedAt: new Date("2026-07-01"),
      },
    ],
  });

  console.log("Seed OK.");
  console.log(
    "Membro:",
    "joao@silvaalimentos.com.br /",
    process.env.SEED_MEMBER_PASSWORD ?? "membro123",
  );
  console.log(
    "Admin:",
    "carla@brasamind.com.br /",
    process.env.SEED_ADMIN_PASSWORD ?? "admin123",
  );
  console.log("Cadastro: /quero-ser-membro/seed-membro-link");
  console.log("Convite: /convite/seed-guest-invite");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
