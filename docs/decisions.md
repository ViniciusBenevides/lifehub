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

## 2026-07-12 — Fases 1 a 4

11. **Recorrência de transações: apenas mensal.** É o caso real de finanças pessoais (salário, assinaturas, aluguel). A geração acontece ao carregar o mês (inclusive meses futuros, útil para planejamento) e é idempotente via `recurringSourceId`. Dia 29–31 é clampado ao fim de meses curtos.
12. **Recorrência de tarefas** (diária/semanal/mensal): a tarefa original é o _template_ (fica oculta nas listas e não conta como atrasada); ocorrências são geradas no intervalo consultado com `recurringSourceId` (migration 0001). A primeira ocorrência é a seguinte à data do template.
13. **Streaks respeitam a frequência**: diário conta dias consecutivos (hoje pendente não quebra); dias fixos ignoram dias não agendados; "X por semana" conta **semanas** consecutivas batendo a cota (semana corrente incompleta não quebra). Semana começa no domingo (pt-BR).
14. **"Transformar em meta"**: sonho com custo vira meta **numérica de economia** (alvo em R$, unidade "R$"); sem custo vira percentual manual. A sugestão de aporte mensal = custo ÷ meses até o prazo é informada no toast (não cria orçamento — orçamentos limitam despesas por categoria, não rastreiam poupança). A barra "Economia" do card do sonho reflete o progresso da meta.
15. **Histórico de atualizações da meta adiado** — exigiria uma tabela de eventos; `createdAt`/`completedAt` cobrem o essencial da Fase 1.
16. **Cores dos gráficos validadas** com o validador de paleta (CVD + contraste) nos dois temas: receitas `#059669`, despesas `#e11d48` (claro) / `#f43f5e` (escuro). O donut usa as cores das categorias do usuário com legenda-lista (identidade nunca só por cor) e fatias limitadas a 6 (+ "Outras").
17. **PWA com service worker mínimo**: cache-first apenas para assets estáticos imutáveis (`/_next/static`, `/icons`); dados sempre da rede. `next-pwa` foi dispensado — 40 linhas de SW nativo bastam.
18. **Zustand** usado onde há estado de UI compartilhado/persistente (sidebar recolhida, com `persist` + `skipHydration`); modais e filtros locais ficam em `useState`.
19. **Testes** cobrem as funções puras dos services críticos (streaks, progresso de metas, faixas de mês/ocorrências de recorrência); services com banco são exercitados pelos smoke tests da API.
