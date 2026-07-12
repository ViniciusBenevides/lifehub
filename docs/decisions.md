# Decisões de produto e arquitetura

Registro das decisões tomadas quando o spec deixava margem de escolha — sempre a opção mais simples que preserva a arquitetura.

## 2026-07-12 — Fase 0

1. **Next.js 16 (App Router).** O spec pede "Next.js 15+"; o `create-next-app@latest` entrega a 16, que atende o requisito e usa `proxy.ts` no lugar do antigo `middleware.ts`.
2. **Google OAuth adiado.** O código está pronto (`socialProviders.google` no Better Auth), mas só ativa quando `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` existirem no ambiente. O botão "Continuar com Google" só renderiza nesse caso. Login por e-mail/senha é o caminho principal por ora.
3. **Recuperação de senha sem e-mail transacional.** Não há provedor de e-mail configurado (Resend fica para depois). O fluxo completo existe (solicitar → link com token → redefinir), mas o link é registrado no log do servidor em vez de enviado por e-mail.
4. **Tema: dark como padrão, sistema opcional.** `next-themes` com `defaultTheme="dark"` e `enableSystem` — o usuário pode escolher claro/escuro/sistema no perfil ou no menu do usuário.
5. **Dinheiro em centavos.** Todas as colunas monetárias são `integer` em centavos (`amountCents`, `limitCents`, `estimatedCostCents`); formatação com `Intl.NumberFormat("pt-BR", { currency: "BRL" })` em `src/lib/format.ts`.
6. **IDs.** Tabelas de domínio usam `uuid` com `gen_random_uuid()`; tabelas do Better Auth usam `text` (padrão da biblioteca).
7. **Driver Neon HTTP.** `drizzle-orm/neon-http` (sem transações interativas — adequado a serverless). A idempotência de operações compostas (ex.: seed, recorrências) é garantida na camada de service, com verificação antes da escrita.
8. **Seed no cadastro.** Áreas da vida (6) e categorias financeiras BR (14) são criadas via `databaseHooks.user.create.after` do Better Auth, em `src/server/services/user-setup.ts` (idempotente).
9. **Recorrência de transações.** Coluna `recurringSourceId` liga a ocorrência gerada à transação recorrente de origem, permitindo geração idempotente por mês (Fase 2).
10. **Categoria com transações não pode ser excluída** (`onDelete: restrict`) — o usuário precisa reatribuir as transações antes; orçamentos caem junto com a categoria (`cascade`).
