# LifeHub — Plano de Execução

Life OS pessoal: metas, hábitos, finanças, sonhos, atividades e dashboard.
Stack: Next.js (App Router) + TypeScript strict · Tailwind v4 + shadcn/ui · Neon Postgres + Drizzle · Better Auth · Zod · TanStack Query · Zustand · Recharts · date-fns.

Regra de ouro da arquitetura: **toda lógica de negócio vive em `src/server/services`** (funções puras que recebem `userId` + dados validados) e é exposta por Server Actions **e** REST em `/api/v1` — o futuro app mobile (Expo) reutiliza os services via API.

Ao fim de cada fase: `pnpm build && pnpm lint` sem erros + commit atômico.

---

## Fase 0 — Fundação ✅ (concluída em 2026-07-12)

- [x] Scaffold Next.js + TS strict + Tailwind v4 (pnpm)
- [x] ESLint + Prettier + Husky + lint-staged (pre-commit)
- [x] shadcn/ui (tema zinc + accent indigo, radius 0.75rem) + lucide-react
- [x] next-themes (dark padrão) + Inter via next/font + pt-BR
- [x] Estrutura de pastas (app / server / shared / components / hooks / lib)
- [x] Constantes: áreas da vida + categorias financeiras BR (seeds)
- [x] Schema Drizzle completo (14 tabelas, índices em FKs) + migration inicial
- [x] Better Auth: e-mail/senha, Google (condicional a env), cookie httpOnly, seed no signup
- [x] Proteção de rotas (proxy otimista + validação real no layout)
- [x] Páginas: login, cadastro, recuperar/redefinir senha
- [x] Shell responsivo: sidebar colapsável (desktop) + bottom tabs (mobile)
- [x] Página de perfil (conta, tema, sair) + placeholders dos módulos
- [x] Rodar migration no Neon (14 tabelas aplicadas)
- [x] Verificação fim-a-fim: cadastro → seed → login → rotas protegidas
- [x] Repo GitHub + deploy Vercel funcionando com login real

## Fase 1 — Metas + Hábitos ✅ (concluída em 2026-07-12)

### Metas (5.2)

- [x] Zod schemas + service `goals` (CRUD, progresso, milestones, ownership por userId)
- [x] Server Actions + rotas REST `/api/v1/goals` e `/api/v1/goals/:id/milestones`
- [x] Criação guiada (modal desktop / drawer mobile): título → área → tipo de progresso → prazo
- [x] 3 tipos de progresso: percentual manual (slider), milestones (% automático), numérico (atual/alvo)
- [x] Grid de cards por área + lista com filtros (status, área, prazo)
- [x] Card: barra de progresso, contagem regressiva, badge da área, hábitos vinculados
- [x] Detalhe: progresso, milestones reordenáveis, hábitos com streak, histórico
- [x] Completar meta: confete + `completedAt`
- [x] Empty/loading/error states

### Hábitos (5.3)

- [x] Zod schemas + service `habits` (CRUD, check/uncheck, streaks, estatísticas)
- [x] Server Actions + REST `/api/v1/habits`, `/api/v1/habits/:id/logs`
- [x] Frequências: diária, dias da semana, X vezes/semana
- [x] Rotina agrupada por período (manhã/tarde/noite/qualquer hora)
- [x] Check otimista com desfazer (TanStack Query)
- [x] Streak atual + recorde respeitando a frequência configurada
- [x] Heatmap estilo GitHub (12 meses, por hábito + geral)
- [x] Estatísticas: taxa 7/30 dias, melhor dia da semana
- [x] Vinculação a metas
- [x] Empty/loading/error states

## Fase 2 — Finanças (5.4) ✅ (concluída em 2026-07-12)

- [x] Zod schemas + services `transactions`, `budgets`, `categories`
- [x] Server Actions + REST `/api/v1/transactions|budgets|categories`
- [x] Lançamento rápido (FAB mobile) com máscara BRL — sempre `amountCents`
- [x] Visão mensal navegável: receitas, despesas, saldo
- [x] Gráficos Recharts: pizza por categoria + evolução 6–12 meses
- [x] Orçamentos por categoria/mês com alertas visuais (80% / 100%)
- [x] Lista com filtros (mês, categoria, tipo, busca) e edição inline
- [x] Recorrências: geração idempotente no carregamento do mês
- [x] CRUD de categorias (ícone + cor)
- [x] Empty/loading/error states

## Fase 3 — Sonhos + Atividades + Dashboard ✅ (concluída em 2026-07-12)

### Sonhos (5.5)

- [x] Service + Actions + REST `/api/v1/dreams`
- [x] Mural visual (imagem por URL + preview), reordenação drag-and-drop
- [x] Status sonhando → em progresso → realizado (celebração)
- [x] "Transformar em meta" (+ sugestão de economia mensal = custo ÷ meses)
- [x] Barra de progresso de economia quando vinculado

### Atividades (5.6)

- [x] Service + Actions + REST `/api/v1/tasks`
- [x] Lista por dia (hoje/amanhã/semana) + visão semanal em colunas (desktop)
- [x] Prioridades com cores, vínculo a metas, recorrência simples
- [x] Drag-and-drop entre dias; atrasadas com "mover para hoje"

### Dashboard (5.1 — por último)

- [x] Service agregador com `Promise.all` (sem waterfalls)
- [x] Saudação + data por extenso; cards: hábitos hoje, saldo do mês, metas ativas, tarefas
- [x] Seção "Hoje" (checklist otimista) + mini heatmap 90 dias
- [x] Gráfico compacto do fluxo financeiro (6 meses) + carrossel de sonhos

## Fase 4 — Polimento + preparação mobile ✅ (concluída em 2026-07-12)

- [x] Revisão de todos os empty/loading/error states
- [x] PWA: manifest, ícones, instalável no celular
- [x] Auditoria de performance (waterfalls, `Promise.all`)
- [x] Revisão da API `/api/v1` + documentação em `docs/api.md`
- [x] Testes Vitest dos services críticos: streaks, orçamentos, saldo mensal, recorrência
