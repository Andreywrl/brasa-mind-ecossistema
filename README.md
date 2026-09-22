# Brasamind

App Next.js do Brasamind: área do membro, painel administrativo, portaria, cadastro por link do admin e convite de convidado.

O protótipo estático anterior (HTML DC) está em [`prototype/`](prototype/).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- MySQL 8 + Prisma (sem Docker: use MySQL local ou remoto)
- Auth.js (credenciais + Google opcional)
- Asaas (opcional até configurar a chave)
- Vercel Blob, Sentry e Analytics (opcionais)
- pnpm · funções em `gru1` (`vercel.js`)

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

- Membro: `joao@silvaalimentos.com.br` / `membro123`
- Admin: `carla@brasamind.com.br` / `admin123`
- Cadastro: `/quero-ser-membro/seed-membro-link`
- Convite convidado: `/convite/seed-guest-invite`

## Regras de negócio

- Mensalidade R$ 97 (dia 05), não inclui ingresso
- Ingresso: Fundador cortesia, Patrocinador R$ 100, Membro R$ 180, Convidado R$ 200
- Novos membros só por link do admin
- Convidados pagam R$ 200, sem limite por evento
- Imagens de perfil/evento/oferta no Vercel Blob (sem galeria no fim da página)
