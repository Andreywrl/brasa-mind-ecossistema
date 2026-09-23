import { PrismaClient, MemberCategory, PointAction, FaqCategory, LegalDocType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { put } from "@vercel/blob";
import { customAlphabet } from "nanoid";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const checkinCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);

const members = [
  {
    nome: "João da Silva",
    email: "joao@silvaalimentos.com.br",
    empresa: "Silva Alimentos",
    especialidade: "Food service",
    cidade: "Porto Alegre",
    categoria: MemberCategory.FUNDADOR,
    pontos: 2310,
    whatsapp: "+55 51 99999 0000",
    instagram: "@silvaalimentos",
    site: "silvaalimentos.com.br",
    endereco: "Av. Assis Brasil, 3940, Porto Alegre RS",
    youtube: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    descricao:
      "Fundador do Brasa. Trabalha com food service há 18 anos e adora conectar quem compra com quem entrega.",
    foto: "uploads/users/pexels-filipgrobgaard-26150470.jpg",
    subStatus: "ACTIVE" as const,
  },
  {
    nome: "Ana Beatriz Rocha",
    email: "ana@rochaincorporadora.com.br",
    empresa: "Rocha Incorporadora",
    especialidade: "Construção",
    cidade: "Porto Alegre",
    categoria: MemberCategory.FUNDADOR,
    pontos: 2180,
    whatsapp: "+55 51 98888 1111",
    instagram: "@rochaincorp",
    site: "rochaincorporadora.com.br",
    endereco: "R. Padre Chagas, 210, Porto Alegre RS",
    youtube: "https://youtu.be/ysz5S6PUM-U",
    descricao:
      "Cofundadora do Brasa, toca uma incorporadora com foco em bairros planejados. Sempre em busca de fornecedores locais.",
    foto: "uploads/users/pexels-mauricio-casas-454804780-18506626.jpg",
    subStatus: "ACTIVE" as const,
  },
  {
    nome: "Maria Souza",
    email: "maria@souzamarketing.com.br",
    empresa: "Souza Marketing",
    especialidade: "Marketing",
    cidade: "Caxias do Sul",
    categoria: MemberCategory.PATROCINADOR,
    pontos: 1840,
    whatsapp: "+55 54 97777 2222",
    instagram: "@souzamkt",
    site: "souzamarketing.com.br",
    endereco: "R. Sinimbu, 1500, Caxias do Sul RS",
    youtube: "https://www.youtube.com/embed/ysz5S6PUM-U",
    descricao:
      "Patrocinadora do Brasa e dona de uma agência full service na serra. Gosta de fechar parceria de mídia com membros.",
    foto: "uploads/users/pexels-uriel-art-923978-4566871.jpg",
    subStatus: "ACTIVE" as const,
  },
  {
    nome: "Ricardo Menezes",
    email: "ricardo@menezesadvogados.com.br",
    empresa: "Menezes Advogados",
    especialidade: "Jurídico",
    cidade: "Porto Alegre",
    categoria: MemberCategory.PATROCINADOR,
    pontos: 1620,
    whatsapp: "+55 51 96666 3333",
    instagram: "@menezesadv",
    site: "menezesadvogados.com.br",
    endereco: "Av. Carlos Gomes, 700, Porto Alegre RS",
    youtube: "",
    descricao:
      "Advogado empresarial, patrocina o Brasa e oferece a primeira consultoria gratuita para membros.",
    foto: "uploads/users/pexels-artepixel-prostudio-1289782065-28442318.jpg",
    subStatus: "PENDING" as const,
  },
  {
    nome: "Pedro Lima",
    email: "pedro@limalogistica.com.br",
    empresa: "Lima Logística",
    especialidade: "Logística",
    cidade: "Novo Hamburgo",
    categoria: MemberCategory.MEMBRO,
    pontos: 1520,
    whatsapp: "+55 51 95555 4444",
    instagram: "@limalog",
    site: "limalogistica.com.br",
    endereco: "R. Osvaldo Aranha, 88, Novo Hamburgo RS",
    youtube: "",
    descricao:
      "Toca uma transportadora regional. Entrou no Brasa para achar clientes B2B na região metropolitana.",
    foto: "uploads/users/pexels-addy-bronzzz-264850064-14564869.jpg",
    subStatus: "ACTIVE" as const,
  },
  {
    nome: "Carla Figueiredo",
    email: "carla@figueiredocontabil.com.br",
    empresa: "Figueiredo Contábil",
    especialidade: "Contabilidade",
    cidade: "Pelotas",
    categoria: MemberCategory.MEMBRO,
    pontos: 1360,
    whatsapp: "+55 53 94444 5555",
    instagram: "@figueiredocontabil",
    site: "figueiredocontabil.com.br",
    endereco: "R. General Osório, 500, Pelotas RS",
    youtube: "",
    descricao:
      "Contadora com escritório em Pelotas, especialista em abertura e reestruturação de empresas.",
    foto: "uploads/users/pexels-yusif-iskandarov-2160750281-37890054.jpg",
    subStatus: "BLOCKED" as const,
  },
  {
    nome: "Thiago Barros",
    email: "thiago@barrostech.com.br",
    empresa: "Barros Tech",
    especialidade: "Tecnologia",
    cidade: "Porto Alegre",
    categoria: MemberCategory.MEMBRO,
    pontos: 1180,
    whatsapp: "+55 51 93333 6666",
    instagram: "@barrostech",
    site: "barrostech.com.br",
    endereco: "Av. Ipiranga, 6681, Porto Alegre RS",
    youtube: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    descricao:
      "Desenvolve software sob medida para o varejo gaúcho. Procura parceiros de implantação.",
    foto: "uploads/users/pexels-valentin-bogdan-2150176604-31834479.jpg",
    subStatus: "ACTIVE" as const,
  },
  {
    nome: "Juliana Prado",
    email: "juliana@pradoeventos.com.br",
    empresa: "Prado Eventos",
    especialidade: "Eventos",
    cidade: "Gramado",
    categoria: MemberCategory.MEMBRO,
    pontos: 1020,
    whatsapp: "+55 54 92222 7777",
    instagram: "@pradoeventos",
    site: "pradoeventos.com.br",
    endereco: "Av. Borges de Medeiros, 2500, Gramado RS",
    youtube: "",
    descricao:
      "Produtora de eventos corporativos na serra. Fecha muita coisa dentro do próprio Brasa.",
    foto: "uploads/users/pexels-mauricio-casas-454804780-18506626.jpg",
    subStatus: "PENDING" as const,
  },
  {
    nome: "Felipe Andrade",
    email: "felipe@andradeseguros.com.br",
    empresa: "Andrade Seguros",
    especialidade: "Seguros",
    cidade: "Santa Maria",
    categoria: MemberCategory.MEMBRO,
    pontos: 860,
    whatsapp: "+55 55 91111 8888",
    instagram: "@andradeseguros",
    site: "andradeseguros.com.br",
    endereco: "R. do Acampamento, 100, Santa Maria RS",
    youtube: "",
    descricao:
      "Corretor de seguros empresariais no centro do estado. Entrou no Brasa há três meses.",
    foto: "uploads/users/pexels-mohamed-72152375-8495301.jpg",
    subStatus: "ACTIVE" as const,
  },
];

async function resolveImageUrl(relativePath: string): Promise<string> {
  const abs = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(abs)) return `/${relativePath}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const buf = fs.readFileSync(abs);
    const blob = await put(relativePath.replace(/^uploads\//, ""), buf, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return blob.url;
  }

  // Fallback local path for seed without Blob (dev only)
  return `/${relativePath}`;
}

async function main() {
  console.log("Seeding Brasamind…");

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
        descricao: "Sócios fundadores do Brasa. Prioridade máxima no hub e voz nas decisões.",
        entradaLabel: "Cortesia",
        entradaCents: 0,
        chipClass: "bg-brasa text-white",
      },
      {
        nome: MemberCategory.PATROCINADOR,
        descricao: "Empresas que patrocinam o Brasa e recebem destaque nos eventos.",
        entradaLabel: "R$ 100,00",
        entradaCents: 10000,
        chipClass: "bg-secondary text-primary",
      },
      {
        nome: MemberCategory.MEMBRO,
        descricao: "Membros gerais da rede, com acesso completo à plataforma.",
        entradaLabel: "R$ 180,00",
        entradaCents: 18000,
        chipClass: "bg-secondary text-muted-foreground",
      },
    ],
  });

  const profileIds: string[] = [];
  for (const m of members) {
    const fotoUrl = await resolveImageUrl(m.foto);
    const user = await prisma.user.create({
      data: {
        name: m.nome,
        email: m.email,
        passwordHash: memberPassword,
        role: "MEMBRO",
        image: fotoUrl,
        profile: {
          create: {
            empresa: m.empresa,
            especialidade: m.especialidade,
            cidade: m.cidade,
            categoria: m.categoria,
            whatsapp: m.whatsapp,
            instagram: m.instagram,
            site: m.site,
            endereco: m.endereco,
            cep: "90010000",
            addressNumber: "100",
            bairro: "Centro",
            addressComplement: null,
            youtube: m.youtube || null,
            descricao: m.descricao,
            fotoUrl,
            subscription: {
              create: {
                status: m.subStatus,
                amountCents: 9700,
                billingDay: 5,
                paymentMethod: "CREDIT_CARD",
                nextDueDate: new Date("2026-09-05"),
                overdueSince:
                  m.subStatus === "BLOCKED" ? new Date("2026-06-05") : null,
              },
            },
          },
        },
      },
      include: { profile: true },
    });
    profileIds.push(user.profile!.id);

    // Point ledger approximating totals
    let remaining = m.pontos;
    const chunks = [
      { action: PointAction.PRESENCA, pontos: 90 },
      { action: PointAction.CONVITE_CONVERTIDO, pontos: 50 },
      { action: PointAction.ADIMPLENCIA, pontos: 20 },
      { action: PointAction.ASSIDUIDADE, pontos: 60 },
    ];
    let i = 0;
    const base = new Date("2026-01-15");
    while (remaining > 0) {
      const chunk = chunks[i % chunks.length]!;
      const pts = Math.min(chunk.pontos, remaining);
      const occurredAt = new Date(base);
      occurredAt.setDate(base.getDate() + i * 7);
      await prisma.pointEntry.create({
        data: {
          memberId: user.profile!.id,
          action: chunk.action,
          pontos: pts,
          occurredAt,
        },
      });
      remaining -= pts;
      i++;
    }

    // Invoices for João (demo finance)
    if (m.email === "joao@silvaalimentos.com.br") {
      const months = [
        { competencia: "Agosto 2026", due: "2026-08-05", status: "PENDING" as const },
        { competencia: "Julho 2026", due: "2026-07-05", status: "PAID" as const },
        { competencia: "Junho 2026", due: "2026-06-05", status: "PAID" as const },
        { competencia: "Maio 2026", due: "2026-05-05", status: "PAID" as const },
        { competencia: "Abril 2026", due: "2026-04-05", status: "PAID" as const },
        { competencia: "Março 2026", due: "2026-03-05", status: "PAID" as const },
      ];
      for (const inv of months) {
        await prisma.invoice.create({
          data: {
            memberId: user.profile!.id,
            kind: "MEMBERSHIP",
            status: inv.status,
            amountCents: 9700,
            competencia: inv.competencia,
            dueDate: new Date(inv.due),
            paidAt: inv.status === "PAID" ? new Date(inv.due) : null,
            paymentMethod: "CREDIT_CARD",
          },
        });
      }
      await prisma.memberProfile.update({
        where: { id: user.profile!.id },
        data: { cardLast4: "4821", cardBrand: "mastercard" },
      });
      await prisma.notification.createMany({
        data: [
          {
            userId: user.id,
            tipo: "FINANCEIRO",
            titulo: "Mensalidade de agosto pendente",
          },
          {
            userId: user.id,
            tipo: "EVENTO",
            titulo: "Próximo encontro em 28/08",
          },
          {
            userId: user.id,
            tipo: "CONVITE",
            titulo: "Bruno Carvalho confirmou presença",
          },
          {
            userId: user.id,
            tipo: "RANKING",
            titulo: "Você está em 1º no ranking",
          },
        ],
      });
    }
  }

  const admins = [
    {
      nome: "Carla Teixeira",
      email: "carla@brasamind.com.br",
      papel: { membros: true, eventos: true, financeiro: true, ranking: true, usuarios: true, termos: true },
      foto: "uploads/users/pexels-uriel-art-923978-4566871.jpg",
    },
    {
      nome: "Rafael Munhoz",
      email: "rafael@brasamind.com.br",
      papel: { membros: true, eventos: false, financeiro: true, ranking: false, usuarios: false, termos: false },
      foto: "uploads/users/pexels-amer-khatib-khatib-161193011-10806265.jpg",
    },
    {
      nome: "Beatriz Nunes",
      email: "beatriz@brasamind.com.br",
      papel: { membros: true, eventos: true, financeiro: false, ranking: true, usuarios: false, termos: false },
      foto: "uploads/users/pexels-yusif-iskandarov-2160750281-37890054.jpg",
    },
    {
      nome: "Diego Alves",
      email: "diego@brasamind.com.br",
      papel: { membros: true, eventos: false, financeiro: false, ranking: false, usuarios: false, termos: false },
      foto: "uploads/users/pexels-olly-3823495.jpg",
    },
  ];

  for (const a of admins) {
    const image = await resolveImageUrl(a.foto);
    const user = await prisma.user.create({
      data: {
        name: a.nome,
        email: a.email,
        passwordHash: adminPassword,
        role: "ADMIN",
        image,
        adminPerms: { create: a.papel },
      },
    });
    if (a.email === "carla@brasamind.com.br") {
      await prisma.membershipInvite.create({
        data: {
          token: "seed-membro-link",
          createdById: user.id,
          categoria: MemberCategory.MEMBRO,
          maxUses: 50,
          active: true,
        },
      });
    }
  }

  const pastEvents = [
    {
      nome: "Networking de Inverno",
      data: new Date("2026-06-21T19:00:00"),
      hora: "19h00",
      local: "Gramado RS",
      localShort: "Gramado RS",
      descricao: "Encontro de inverno na serra, com fondue e rodada de conexões entre membros.",
      palestrante: "Marina Fogaça",
      palestranteBio: "Fundadora da Fogaça Digital, especialista em branding B2B.",
      capa: "uploads/imagens-gerais/IMG_3921.PNG",
      vagas: 80,
      ativo: false,
      cronograma: [
        { hora: "19h00", item: "Recepção" },
        { hora: "19h30", item: "Jantar" },
        { hora: "21h00", item: "Rodada de conexões" },
        { hora: "22h30", item: "Encerramento" },
      ],
    },
    {
      nome: "Talk: Escala e Cultura",
      data: new Date("2026-05-17T19:00:00"),
      hora: "19h00",
      local: "Porto Alegre RS",
      localShort: "Porto Alegre RS",
      descricao: "Talk sobre escalar times mantendo a cultura, com case de membro.",
      palestrante: "Ricardo Menezes",
      palestranteBio: "Sócio da Menezes Advogados, mentor de governança.",
      capa: "uploads/imagens-gerais/IMG_3914.PNG",
      vagas: 70,
      ativo: false,
      cronograma: [
        { hora: "19h00", item: "Abertura" },
        { hora: "19h30", item: "Talk principal" },
        { hora: "20h30", item: "Perguntas" },
        { hora: "21h30", item: "Networking" },
      ],
    },
    {
      nome: "Happy Hour Fundadores",
      data: new Date("2026-04-19T18:30:00"),
      hora: "18h30",
      local: "Bento Gonçalves RS",
      localShort: "Bento Gonçalves RS",
      descricao: "Happy hour reservado aos fundadores, em vinícola parceira.",
      palestrante: "João da Silva",
      palestranteBio: "Fundador do Brasa.",
      capa: "uploads/imagens-gerais/IMG_3919.PNG",
      vagas: 50,
      ativo: false,
      cronograma: [
        { hora: "18h30", item: "Chegada" },
        { hora: "19h00", item: "Degustação" },
        { hora: "21h00", item: "Encerramento" },
      ],
    },
    {
      nome: "Churrasco de Abertura 2026",
      data: new Date("2026-03-15T12:00:00"),
      hora: "12h00",
      local: "Porto Alegre RS",
      localShort: "Porto Alegre RS",
      descricao: "Churrasco de abertura do ano, com apresentação de todos os membros.",
      palestrante: "Ana Beatriz Rocha",
      palestranteBio: "Cofundadora do Brasa, Rocha Incorporadora.",
      capa: "uploads/imagens-gerais/IMG_3913.PNG",
      vagas: 100,
      ativo: false,
      cronograma: [
        { hora: "12h00", item: "Recepção" },
        { hora: "13h00", item: "Almoço" },
        { hora: "15h00", item: "Apresentações" },
        { hora: "17h00", item: "Encerramento" },
      ],
    },
  ];

  for (const e of pastEvents) {
    const capaUrl = await resolveImageUrl(e.capa);
    await prisma.event.create({
      data: {
        nome: e.nome,
        data: e.data,
        hora: e.hora,
        local: e.local,
        localShort: e.localShort,
        descricao: e.descricao,
        palestrante: e.palestrante,
        palestranteBio: e.palestranteBio,
        capaUrl,
        vagas: e.vagas,
        ativo: false,
        cronograma: e.cronograma,
        prices: {
          create: [
            { tier: "FUNDADOR", amountCents: 0, label: "Fundador" },
            { tier: "PATROCINADOR", amountCents: 10000, label: "Patrocinador" },
            { tier: "MEMBRO", amountCents: 18000, label: "Membro" },
            { tier: "CONVIDADO", amountCents: 20000, label: "Convidado" },
          ],
        },
      },
    });
  }

  const activeCapa = await resolveImageUrl("uploads/imagens-gerais/IMG_3917.PNG");
  const activeEvent = await prisma.event.create({
    data: {
      nome: "A mente por trás dos grandes movimentos",
      data: new Date("2026-08-28T19:00:00"),
      hora: "19h00",
      local: "R. Leopoldo Bier, 644, Santana, Porto Alegre RS",
      localShort: "Espaço Brasa, Porto Alegre RS",
      descricao:
        "Uma Small Meeting com muito ASSADO, EMPREENDEDORISMO & NETWORK. Palestra com Eduardo Seibel.",
      palestrante: "Eduardo Seibel",
      palestranteBio: "A mente por trás do marketing da Agrofel, Yara e Alibem",
      capaUrl: activeCapa,
      vagas: 120,
      ativo: true,
      cronograma: [
        { hora: "19h00", item: "Chegada" },
        { hora: "19h01", item: "Open food e integração do Grupo" },
        { hora: "20h30", item: "Apresentação individual" },
        { hora: "21h00", item: "Palestra com Eduardo Seibel" },
        { hora: "22h30", item: "Perguntas" },
        { hora: "23h00", item: "Encerramento" },
      ],
      prices: {
        create: [
          { tier: "FUNDADOR", amountCents: 0, label: "Fundador" },
          { tier: "PATROCINADOR", amountCents: 10000, label: "Patrocinador" },
          { tier: "MEMBRO", amountCents: 18000, label: "Membro" },
          { tier: "CONVIDADO", amountCents: 20000, label: "Convidado" },
        ],
      },
    },
  });

  // Door access users
  for (const door of [
    { nome: "Portaria 1", login: "seg-portaria-1", email: "portaria1@brasamind.com.br" },
    { nome: "Portaria 2", login: "seg-portaria-2", email: "portaria2@brasamind.com.br" },
    { nome: "Apoio recepção", login: "seg-apoio-1", email: "apoio1@brasamind.com.br", expired: true },
  ]) {
    const user = await prisma.user.create({
      data: {
        name: door.nome,
        email: door.email,
        passwordHash: adminPassword,
        role: "PORTARIA",
        doorAccess: {
          create: {
            login: door.login,
            eventId: door.expired ? null : activeEvent.id,
            expiresAt: door.expired
              ? new Date("2026-06-21T23:59:00")
              : new Date("2026-08-28T23:59:00"),
            active: !door.expired,
          },
        },
      },
    });
    void user;
  }

  // Offers for patrocinadores/fundador
  const maria = await prisma.memberProfile.findFirst({
    where: { user: { email: "maria@souzamarketing.com.br" } },
  });
  const ricardo = await prisma.memberProfile.findFirst({
    where: { user: { email: "ricardo@menezesadvogados.com.br" } },
  });
  const joao = await prisma.memberProfile.findFirst({
    where: { user: { email: "joao@silvaalimentos.com.br" } },
  });

  if (maria) {
    await prisma.offer.create({
      data: {
        memberId: maria.id,
        titulo: "Diagnóstico de Marketing B2B gratuito para membros do Brasa",
        bannerUrl: await resolveImageUrl("uploads/imagens-gerais/IMG_3913.PNG"),
        tipoDestino: "WHATSAPP",
        destino: "https://wa.me/5554977772222?text=Ol%C3%A1!%20Vi%20a%20oferta%20no%20Brasamind",
        destRotulo: "WhatsApp (+55 54 97777 2222)",
        ativo: true,
        views: 428,
        clicks: 36,
      },
    });
  }
  if (ricardo) {
    await prisma.offer.create({
      data: {
        memberId: ricardo.id,
        titulo: "Primeira consultoria jurídica societária e contratual sem custo",
        bannerUrl: await resolveImageUrl("uploads/imagens-gerais/IMG_3915.PNG"),
        tipoDestino: "SITE",
        destino: "https://menezesadvogados.com.br",
        destRotulo: "menezesadvogados.com.br",
        ativo: false,
        views: 310,
        clicks: 22,
      },
    });
  }
  if (joao) {
    await prisma.offer.create({
      data: {
        memberId: joao.id,
        titulo: "Condição exclusiva em carnes nobres e cortes para eventos corporativos",
        bannerUrl: await resolveImageUrl("uploads/imagens-gerais/IMG_3911.PNG"),
        tipoDestino: "WHATSAPP",
        destino: "https://wa.me/5551999990000?text=Ol%C3%A1!%20Quero%20saber%20da%20oferta%20do%20Brasamind",
        destRotulo: "WhatsApp (+55 51 99999 0000)",
        ativo: false,
        views: 140,
        clicks: 9,
      },
    });

    await prisma.invite.create({
      data: {
        token: "seed-guest-invite",
        eventId: activeEvent.id,
        hostId: joao.id,
        message:
          'Fala! Estou te chamando para o próximo encontro do Brasamind: "A mente por trás dos grandes movimentos", dia 28/08 às 19h, no Espaço Brasa, em Porto Alegre.',
      },
    });
  }

  // Ingressos do evento ativo + histórico (para QR e detalhe)
  const allMembers = await prisma.memberProfile.findMany({
    include: { user: { select: { email: true } } },
  });
  const past = await prisma.event.findMany({
    where: { ativo: false },
    orderBy: { data: "desc" },
  });

  for (const m of allMembers) {
    await prisma.registration.create({
      data: {
        eventId: activeEvent.id,
        memberId: m.id,
        type: "MEMBER",
        status: "CONFIRMED",
        ticketCents: m.categoria === "FUNDADOR" ? 0 : m.categoria === "PATROCINADOR" ? 10000 : 18000,
        checkinCode: checkinCode(),
      },
    });
  }

  if (joao && past[0]) {
    await prisma.registration.create({
      data: {
        eventId: past[0].id,
        memberId: joao.id,
        type: "MEMBER",
        status: "CHECKED_IN",
        ticketCents: 0,
        checkinCode: checkinCode(),
        checkinAt: new Date("2026-06-21T19:12:00"),
      },
    });
    const invitePast = await prisma.invite.create({
      data: {
        token: "seed-past-invite",
        eventId: past[0].id,
        hostId: joao.id,
        message: "Convite do Networking de Inverno",
      },
    });
    const guest = await prisma.guest.create({
      data: {
        inviteId: invitePast.id,
        nome: "Bruno Carvalho",
        empresa: "Carvalho Advocacia",
        email: "bruno@carvalho.adv.br",
      },
    });
    await prisma.registration.create({
      data: {
        eventId: past[0].id,
        guestId: guest.id,
        type: "GUEST",
        status: "CHECKED_IN",
        ticketCents: 20000,
        checkinCode: checkinCode(),
        checkinAt: new Date("2026-06-21T19:20:00"),
      },
    });
  }
  if (joao && past[1]) {
    await prisma.registration.create({
      data: {
        eventId: past[1].id,
        memberId: joao.id,
        type: "MEMBER",
        status: "NO_SHOW",
        ticketCents: 0,
        checkinCode: checkinCode(),
      },
    });
  }

  const carla = await prisma.user.findUnique({
    where: { email: "carla@brasamind.com.br" },
  });
  if (carla && past[0]) {
    await prisma.eventReview.create({
      data: {
        eventId: past[0].id,
        stars: 5,
        comment: "Encontro forte: networking fluindo e assado no ponto.",
        authorId: carla.id,
      },
    });
  }
  if (carla && past[1]) {
    await prisma.eventReview.create({
      data: {
        eventId: past[1].id,
        stars: 3,
        comment: "Talk boa, mas o ritmo do networking ficou curto.",
        authorId: carla.id,
      },
    });
  }

  await prisma.pointRule.createMany({
    data: [
      { action: PointAction.PRESENCA, pontos: 90, label: "Presença no evento" },
      { action: PointAction.ASSIDUIDADE, pontos: 60, label: "Assiduidade (3 meses)" },
      { action: PointAction.CONVITE_CONVERTIDO, pontos: 50, label: "Convite convertido" },
      { action: PointAction.ADIMPLENCIA, pontos: 20, label: "Adimplência mensal" },
    ],
  });

  await prisma.negativeRule.createMany({
    data: [
      { texto: "Faltar sem avisar com 48h de antecedência", order: 0 },
      { texto: "Cancelar presença em cima da hora", order: 1 },
      { texto: "Mensalidade em atraso acima de 30 dias", order: 2 },
      { texto: "Indicar convidado que não comparece", order: 3 },
    ],
  });

  await prisma.prize.createMany({
    data: [
      { kind: "perf", titulo: "Kit Brasamind no último encontro", detalhe: "Quem manter o ritmo de conexão o ano inteiro entra na disputa.", order: 0 },
      { kind: "perf", titulo: "Convite extra para um parceiro", detalhe: "Leve alguém da sua confiança para o encerramento e continue indicando.", order: 1 },
      { kind: "top3", pos: "1º", titulo: "Primeiro do ano", detalhe: "Duas passagens de ida e volta para o Rio de Janeiro.", order: 0 },
      { kind: "top3", pos: "2º", titulo: "Segundo do ano", detalhe: "Uma caixa de vinhos.", order: 1 },
      { kind: "top3", pos: "3º", titulo: "Terceiro do ano", detalhe: "Kit de churrasco no encerramento do Brasa.", order: 2 },
    ],
  });

  const achievements = [
    { code: "assiduo", nome: "Assíduo", descricao: "6 meses seguidos presente" },
    { code: "conector", nome: "Conector", descricao: "10 indicações feitas" },
    { code: "anfitriao", nome: "Anfitrião", descricao: "5 convidados levados" },
    { code: "pontual", nome: "Pontual", descricao: "Check-in nos primeiros 10" },
    { code: "emdia", nome: "Em dia", descricao: "12 meses adimplente" },
    { code: "topmes", nome: "Top do mês", descricao: "1º lugar no ranking mensal" },
  ];
  for (const a of achievements) {
    await prisma.achievement.create({ data: a });
  }
  if (joao) {
    const earned = await prisma.achievement.findMany({
      where: { code: { in: ["assiduo", "conector", "anfitriao", "pontual", "topmes"] } },
    });
    for (const a of earned) {
      await prisma.memberAchievement.create({
        data: { memberId: joao.id, achievementId: a.id },
      });
    }
  }

  await prisma.faq.createMany({
    data: [
      {
        category: FaqCategory.MEMBRO,
        question: "O que é o Brasamind?",
        answer:
          "O Brasamind é um grupo gaúcho de networking: um encontro por mês para conectar empresários, indicar parceiros e fechar negócios. Empreendedorismo, churrasco e rede de confiança.",
        order: 0,
      },
      {
        category: FaqCategory.MEMBRO,
        question: "Como funcionam as ofertas de patrocinadores?",
        answer:
          "Patrocinadores e Fundadores do Brasamind podem cadastrar até 3 banners de oferta na Área do Membro. Uma oferta fica ativa por vez e roda em destaque no Início, no Hub, nos Eventos e no Ranking.",
        order: 1,
      },
      {
        category: FaqCategory.PAGAMENTO,
        question: "Quanto custa a mensalidade?",
        answer:
          "A mensalidade é R$ 97,00, cobrada de forma recorrente via Asaas todo dia 05. Você pode pagar com cartão, PIX ou boleto quando houver pendência.",
        order: 2,
      },
      {
        category: FaqCategory.EVENTO,
        question: "O ingresso do evento está incluso?",
        answer:
          "Membros compram o ingresso do mês com desconto na Área do Membro. A mensalidade mantém seu acesso à rede; o ingresso garante a vaga no encontro. Fundador entra por cortesia, Patrocinador paga R$ 100, Membro R$ 180 e Convidado R$ 200.",
        order: 3,
      },
      {
        category: FaqCategory.EVENTO,
        question: "Posso levar um convidado?",
        answer:
          "Sim. Na área de Convites você gera o link do evento, compartilha e acompanha quem confirmou e pagou. Não há limite de convidados por encontro. Convidados que viram membros entram no seu histórico de indicações.",
        order: 4,
      },
      {
        category: FaqCategory.MEMBRO,
        question: "Como funcionam os pontos e o ranking?",
        answer:
          "Você ganha pontos por presença, convites convertidos e adimplência. O ranking mensal, geral e anual mostra quem mais conecta na rede.",
        order: 5,
      },
      {
        category: FaqCategory.PAGAMENTO,
        question: "Como alterar o cartão de cobrança?",
        answer:
          "Em Financeiro, abra Cartão de cobrança e escolha Alterar cartão. O pagamento continua recorrente via Asaas com a nova forma cadastrada.",
        order: 6,
      },
      {
        category: FaqCategory.CONTA,
        question: "Esqueci minha senha. O que faço?",
        answer:
          "Na tela de Entrar, use Esqueci a senha. Enviamos um token por e-mail para você criar uma nova.",
        order: 7,
      },
      {
        category: FaqCategory.CONTA,
        question: "Como atualizo meu perfil no hub?",
        answer:
          "Abra seu perfil, Editar perfil, e atualize foto, descrição, contatos e vídeo do YouTube.",
        order: 8,
      },
      {
        category: FaqCategory.EVENTO,
        question: "Posso cancelar minha presença no evento?",
        answer:
          "Sim. No painel do ingresso, use Cancelar presença. A vaga é liberada e você pode comprar o ingresso de novo se mudar de ideia.",
        order: 9,
      },
    ],
  });

  await prisma.legalDocument.createMany({
    data: [
      {
        type: LegalDocType.TERMS,
        nome: "Termos de Uso",
        versao: "v3.2",
        resumo: "Regras de participação, ingressos, convites e conduta nos eventos do Brasa.",
        conteudo:
          "Ao participar do Brasamind você concorda com as regras de networking, pagamento de mensalidade e conduta nos encontros. Ingressos de convidados são pagos. Novos membros entram apenas por link gerado pelo admin.",
        published: true,
        publishedAt: new Date("2026-07-01"),
      },
      {
        type: LegalDocType.PRIVACY,
        nome: "Política de Privacidade",
        versao: "v2.1",
        resumo: "Como coletamos, usamos e protegemos os dados dos membros e convidados (LGPD).",
        conteudo:
          "Tratamos dados pessoais para operar a rede, cobranças via Asaas e convites. Você pode solicitar acesso, correção ou exclusão conforme a LGPD.",
        published: true,
        publishedAt: new Date("2026-07-01"),
      },
    ],
  });

  console.log("Seed OK.");
  console.log("Membro demo: joao@silvaalimentos.com.br /", process.env.SEED_MEMBER_PASSWORD ?? "membro123");
  console.log("Admin demo: carla@brasamind.com.br /", process.env.SEED_ADMIN_PASSWORD ?? "admin123");
  console.log("Link cadastro: /quero-ser-membro/seed-membro-link");
  console.log("Convite convidado: /convite/seed-guest-invite");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
