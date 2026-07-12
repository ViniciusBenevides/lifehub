# LifeHub

Seu **Life OS** pessoal: metas, hábitos, finanças, sonhos e atividades em um só lugar — mobile-first, em português, com dark mode.

> Projeto em construção por fases. Acompanhe o progresso em [PLAN.md](./PLAN.md) e as decisões de arquitetura em [docs/decisions.md](./docs/decisions.md).

## Stack

| Camada          | Tecnologia                                                  |
| --------------- | ----------------------------------------------------------- |
| Framework       | Next.js (App Router) + TypeScript strict                    |
| UI              | Tailwind CSS v4 + shadcn/ui + lucide-react                  |
| Banco           | Neon Postgres (serverless)                                  |
| ORM             | Drizzle ORM + drizzle-kit (migrations versionadas)          |
| Auth            | Better Auth (e-mail/senha + Google OAuth, cookies httpOnly) |
| Validação       | Zod (schemas compartilhados client/server)                  |
| Dados no client | TanStack Query v5 (apenas onde há interatividade)           |
| Gráficos        | Recharts                                                    |
| Datas           | date-fns (locale pt-BR)                                     |
| Deploy          | Vercel                                                      |

## Arquitetura

```
src/
├── app/                # Rotas (App Router) — camada fina
│   ├── (auth)/         # login, cadastro, recuperar/redefinir senha
│   ├── (app)/          # rotas protegidas (dashboard, metas, hábitos…)
│   └── api/
│       ├── auth/[...all]/  # handler do Better Auth
│       └── v1/             # REST API (será consumida pelo app mobile)
├── server/
│   ├── db/             # schema Drizzle, client Neon, migrations
│   ├── services/       # TODA a lógica de negócio (pura, testável)
│   └── actions/        # Server Actions (Zod → sessão → service → revalidate)
├── shared/             # Zod schemas, tipos e constantes reutilizáveis
├── components/         # ui/ (shadcn) e features/ (por módulo)
├── hooks/
└── lib/                # utils, auth client, formatação
```

Regras: services nunca importam React/Next; todo dado é escopado por `userId`; dinheiro sempre em centavos (integer); toda entrada é validada com Zod no servidor.

## Rodando localmente

Pré-requisitos: Node 20+, [pnpm](https://pnpm.io) e uma conta gratuita no [Neon](https://neon.tech).

1. **Clone e instale**

   ```bash
   git clone https://github.com/ViniciusBenevides/lifehub.git
   cd lifehub
   pnpm install
   ```

2. **Configure o ambiente**

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL`: crie um projeto no [Neon](https://console.neon.tech) e copie a connection string (pooled).
   - `BETTER_AUTH_SECRET`: gere com `npx @better-auth/cli secret` (ou `openssl rand -base64 32`).
   - `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`: opcionais — sem eles o login com Google fica oculto.

3. **Crie as tabelas**

   ```bash
   pnpm db:migrate
   ```

4. **Suba o app**

   ```bash
   pnpm dev
   ```

   Acesse http://localhost:3000, crie sua conta e pronto — as áreas da vida e categorias financeiras padrão são criadas automaticamente.

## Scripts

| Script                      | O que faz                                 |
| --------------------------- | ----------------------------------------- |
| `pnpm dev`                  | Servidor de desenvolvimento               |
| `pnpm build` / `pnpm start` | Build e servidor de produção              |
| `pnpm lint` / `pnpm format` | ESLint / Prettier                         |
| `pnpm db:generate`          | Gera migration a partir do schema Drizzle |
| `pnpm db:migrate`           | Aplica migrations no banco                |
| `pnpm db:studio`            | Abre o Drizzle Studio                     |

## Deploy (Vercel)

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
2. Adicione as variáveis de ambiente do `.env.example` (em `BETTER_AUTH_URL`, use a URL do deploy).
3. Cada branch ganha um preview deployment automaticamente.
