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

## Fase 1 — Metas + Hábitos

### Metas (5.2)

- [ ] Zod schemas + service `goals` (CRUD, progresso, milestones, ownership por userId)
- [ ] Server Actions + rotas REST `/api/v1/goals` e `/api/v1/goals/:id/milestones`
- [ ] Criação guiada (modal desktop / drawer mobile): título → área → tipo de progresso → prazo
- [ ] 3 tipos de progresso: percentual manual (slider), milestones (% automático), numérico (atual/alvo)
- [ ] Grid de cards por área + lista com filtros (status, área, prazo)
- [ ] Card: barra de progresso, contagem regressiva, badge da área, hábitos vinculados
- [ ] Detalhe: progresso, milestones reordenáveis, hábitos com streak, histórico
- [ ] Completar meta: confete + `completedAt`
- [ ] Empty/loading/error states

### Hábitos (5.3)

- [ ] Zod schemas + service `habits` (CRUD, check/uncheck, streaks, estatísticas)
- [ ] Server Actions + REST `/api/v1/habits`, `/api/v1/habits/:id/logs`
- [ ] Frequências: diária, dias da semana, X vezes/semana
- [ ] Rotina agrupada por período (manhã/tarde/noite/qualquer hora)
- [ ] Check otimista com desfazer (TanStack Query)
- [ ] Streak atual + recorde respeitando a frequência configurada
- [ ] Heatmap estilo GitHub (12 meses, por hábito + geral)
- [ ] Estatísticas: taxa 7/30 dias, melhor dia da semana
- [ ] Vinculação a metas
- [ ] Empty/loading/error states

## Fase 2 — Finanças (5.4)

- [ ] Zod schemas + services `transactions`, `budgets`, `categories`
- [ ] Server Actions + REST `/api/v1/transactions|budgets|categories`
- [ ] Lançamento rápido (FAB mobile) com máscara BRL — sempre `amountCents`
- [ ] Visão mensal navegável: receitas, despesas, saldo
- [ ] Gráficos Recharts: pizza por categoria + evolução 6–12 meses
- [ ] Orçamentos por categoria/mês com alertas visuais (80% / 100%)
- [ ] Lista com filtros (mês, categoria, tipo, busca) e edição inline
- [ ] Recorrências: geração idempotente no carregamento do mês
- [ ] CRUD de categorias (ícone + cor)
- [ ] Empty/loading/error states

## Fase 3 — Sonhos + Atividades + Dashboard

### Sonhos (5.5)

- [ ] Service + Actions + REST `/api/v1/dreams`
- [ ] Mural visual (imagem por URL + preview), reordenação drag-and-drop
- [ ] Status sonhando → em progresso → realizado (celebração)
- [ ] "Transformar em meta" (+ sugestão de economia mensal = custo ÷ meses)
- [ ] Barra de progresso de economia quando vinculado

### Atividades (5.6)

- [ ] Service + Actions + REST `/api/v1/tasks`
- [ ] Lista por dia (hoje/amanhã/semana) + visão semanal em colunas (desktop)
- [ ] Prioridades com cores, vínculo a metas, recorrência simples
- [ ] Drag-and-drop entre dias; atrasadas com "mover para hoje"

### Dashboard (5.1 — por último)

- [ ] Service agregador com `Promise.all` (sem waterfalls)
- [ ] Saudação + data por extenso; cards: hábitos hoje, saldo do mês, metas ativas, tarefas
- [ ] Seção "Hoje" (checklist otimista) + mini heatmap 90 dias
- [ ] Gráfico compacto do fluxo financeiro (6 meses) + carrossel de sonhos

## Fase 4 — Polimento + preparação mobile

- [ ] Revisão de todos os empty/loading/error states
- [ ] PWA: manifest, ícones, instalável no celular
- [ ] Auditoria de performance (waterfalls, `Promise.all`)
- [ ] Revisão da API `/api/v1` + documentação em `docs/api.md`
- [ ] Testes Vitest dos services críticos: streaks, orçamentos, saldo mensal, recorrência
