# Brasamind

App Next.js do Brasamind: área do membro, painel administrativo, portaria, cadastro por link do admin e convite de convidado.

O protótipo estático anterior (HTML DC) está em [`prototype/`](prototype/).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- MySQL 8 + Prisma (sem Docker: use MySQL local ou remoto)
- Auth.js (credenciais + Google opcional)
- Asaas (opcional até configurar a chave)
- Vercel Blob, Sentry e Analytics (opcionais)
- Resend (e-mails transacionais opcionais)
- pnpm · funções em `gru1` (`vercel.json`)

## Setup local

1. Suba um MySQL 8 (instalador oficial, XAMPP, etc.) e crie o banco `brasamind`.
2. Configure o ambiente:

```bash
pnpm install
cp .env.example .env
# preencha DATABASE_URL (mysql://user:pass@127.0.0.1:3306/brasamind) e AUTH_SECRET
pnpm db:push
pnpm db:seed
pnpm dev
```

Sem `DATABASE_URL` válido o schema continua pronto e o seed espera a conexão. Sem Asaas/Blob/Sentry/Google/e-mail, essas integrações ficam desligadas.

### Contas do seed

Seed mínimo (não é dump de produção):

- Membro: `joao@silvaalimentos.com.br` / `membro123`
- Admin: `carla@brasamind.com.br` / `admin123`
- Cadastro: `/quero-ser-membro/seed-membro-link`
- Convite convidado: `/convite/seed-guest-invite`

## Checklist de produção

Antes do deploy:

1. `pnpm db:push` (ou migrate) e `pnpm db:seed` só em ambiente novo
2. Env obrigatórios: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`
3. Asaas: `ASAAS_API_KEY`, `ASAAS_API_URL` e **`ASAAS_WEBHOOK_TOKEN` (obrigatório em produção)**
4. Resend: `RESEND_API_KEY` + `EMAIL_FROM` (sem chave, e-mails não saem; `devToken` de reset **não** é devolvido em produção)
5. Blob: `BLOB_READ_WRITE_TOKEN` para upload de capas/banners/perfil
6. Sentry (opcional): `NEXT_PUBLIC_SENTRY_DSN` (+ org/project/token se for usar upload de sourcemaps)

Smoke operacional (MySQL + Asaas reais): signup por link, pagamento de convidado, check-in na portaria e nota admin em evento passado.

## Qualidade

```bash
pnpm test          # máscaras BR + smoke de rotas críticas
pnpm test:e2e      # Playwright leve (formulários mascarados)
pnpm smoke:api     # HTTP smoke (servidor em http://localhost:3000)
```

## Regras de negócio

- Mensalidade R$ 97 (dia 05), não inclui ingresso
- Ingresso: Fundador cortesia, Patrocinador R$ 100, Membro R$ 180, Convidado R$ 200
- Novos membros só por link do admin
- Convidados pagam R$ 200, sem limite por evento
- Imagens de perfil/evento/oferta no Vercel Blob (sem galeria no fim da página)
- Nota de evento (1–5 estrelas + comentário) é interna do admin, só em eventos anteriores
