# API REST v1

Base: `/api/v1`. Autenticação por **cookie de sessão** do Better Auth (o app mobile fará login via `/api/auth/sign-in/email` e reutilizará o cookie). Todas as respostas são JSON; erros seguem `{ "error": string }` com status `401` (não autenticado), `400` (validação, inclui `issues` do Zod), `404` (recurso inexistente ou de outro usuário) ou `500`.

Datas usam `AAAA-MM-DD`; meses usam `AAAA-MM`; dinheiro é sempre **centavos** (integer).

## Áreas da vida

| Método | Rota          | Descrição                             |
| ------ | ------------- | ------------------------------------- |
| GET    | `/life-areas` | Lista as áreas do usuário (ordenadas) |

## Metas

| Método | Rota                                 | Descrição                                                                            |
| ------ | ------------------------------------ | ------------------------------------------------------------------------------------ |
| GET    | `/goals?status=&lifeAreaId=`         | Lista com progresso, contagem de marcos e hábitos                                    |
| POST   | `/goals`                             | Cria (`title`, `lifeAreaId`, `progressType`, `targetDate?`, `targetValue?`, `unit?`) |
| GET    | `/goals/:id`                         | Detalhe com marcos e hábitos vinculados                                              |
| PATCH  | `/goals/:id`                         | Atualiza campos/status (status `completed` grava `completedAt`)                      |
| DELETE | `/goals/:id`                         | Exclui (marcos caem em cascata)                                                      |
| PATCH  | `/goals/:id/progress`                | `{ currentValue }` — % manual ou valor numérico                                      |
| POST   | `/goals/:id/progress`                | Marca como concluída                                                                 |
| POST   | `/goals/:id/milestones`              | Adiciona marco (`title`, `dueDate?`)                                                 |
| PATCH  | `/goals/:id/milestones`              | Reordena: `{ orderedIds: [] }`                                                       |
| PATCH  | `/goals/:id/milestones/:milestoneId` | Atualiza (`title?`, `done?`, `dueDate?`)                                             |
| DELETE | `/goals/:id/milestones/:milestoneId` | Exclui marco                                                                         |

## Hábitos

| Método | Rota                           | Descrição                                                                               |
| ------ | ------------------------------ | --------------------------------------------------------------------------------------- |
| GET    | `/habits?incluirInativos=true` | Lista com `doneToday`, `scheduledToday` e `streak`                                      |
| POST   | `/habits`                      | Cria (`name`, `frequencyType`, `weeklyDays?`, `timesPerWeek?`, `timeOfDay`, `goalId?`…) |
| GET    | `/habits/:id`                  | Detalhe com streaks, estatísticas 7/30 dias e heatmap de 365 dias                       |
| PATCH  | `/habits/:id`                  | Atualiza (inclui `active`)                                                              |
| DELETE | `/habits/:id`                  | Exclui com histórico                                                                    |
| PUT    | `/habits/:id/logs`             | Marca/desmarca: `{ date, done }` (idempotente)                                          |
| GET    | `/heatmap?dias=365`            | Heatmap geral de conclusões por dia                                                     |

## Finanças

| Método | Rota                                         | Descrição                                                                                                                       |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/transactions?mes=&categoria=&tipo=&busca=` | Lista com categoria embutida                                                                                                    |
| POST   | `/transactions`                              | Cria (`description`, `amountCents`, `type`, `categoryId`, `date`, `isRecurring?`, `recurrenceRule: "monthly"?`)                 |
| PATCH  | `/transactions/:id`                          | Atualiza                                                                                                                        |
| DELETE | `/transactions/:id`                          | Exclui                                                                                                                          |
| GET    | `/categories`                                | Lista categorias                                                                                                                |
| POST   | `/categories`                                | Cria (`name`, `type`, `icon?`, `color?`)                                                                                        |
| PATCH  | `/categories/:id`                            | Atualiza (tipo é imutável)                                                                                                      |
| DELETE | `/categories/:id`                            | Exclui (recusa se houver transações)                                                                                            |
| GET    | `/budgets?mes=`                              | Orçamentos do mês com `spentCents`                                                                                              |
| PUT    | `/budgets`                                   | Upsert: `{ categoryId, month, limitCents }`                                                                                     |
| DELETE | `/budgets/:id`                               | Exclui                                                                                                                          |
| GET    | `/finance/overview?mes=`                     | Totais, transações, despesas por categoria, orçamentos e fluxo de 6 meses; **gera as recorrências do mês** de forma idempotente |

## Sonhos

| Método | Rota                  | Descrição                                                                        |
| ------ | --------------------- | -------------------------------------------------------------------------------- |
| GET    | `/dreams`             | Mural ordenado, com progresso da meta vinculada                                  |
| POST   | `/dreams`             | Cria (`title`, `imageUrl?`, `estimatedCostCents?`, `targetDate?`…)               |
| PATCH  | `/dreams/:id`         | Atualiza (inclui `status`)                                                       |
| DELETE | `/dreams/:id`         | Exclui                                                                           |
| PATCH  | `/dreams/reorder`     | `{ orderedIds: [] }`                                                             |
| POST   | `/dreams/:id/convert` | `{ lifeAreaId }` → cria meta de economia vinculada; retorna `monthlySavingCents` |

## Atividades

| Método | Rota                                    | Descrição                                                                                |
| ------ | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| GET    | `/tasks?de=&ate=&incluirAtrasadas=true` | Tarefas no intervalo (**gera recorrências** no intervalo) + atrasadas                    |
| POST   | `/tasks`                                | Cria (`title`, `date`, `priority`, `goalId?`, `recurrenceRule: daily\|weekly\|monthly?`) |
| PATCH  | `/tasks/:id`                            | Atualiza (status `done` grava `completedAt`; `date` move de dia)                         |
| DELETE | `/tasks/:id`                            | Exclui                                                                                   |

## Dashboard

| Método | Rota         | Descrição                                                                                                              |
| ------ | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| GET    | `/dashboard` | Agregado: hábitos de hoje, tarefas, saldo do mês, metas ativas com % médio, heatmap 90d, fluxo 6m e sonhos em destaque |

## Tarefas 2.0

| Método | Rota                  | Descrição                                                                                                 |
| ------ | --------------------- | --------------------------------------------------------------------------------------------------------- |
| POST   | `/tasks`              | Aceita também `scheduledTime?`, `tags?[]`, `categoryId?`, `projectId?`, `reminderEnabled?`, `subtasks?[]` |
| GET    | `/tasks/:id/subtasks` | Lista subtarefas                                                                                          |
| POST   | `/tasks/:id/subtasks` | Cria subtarefa (`title`)                                                                                  |
| PATCH  | `/subtasks/:id`       | Atualiza (`title?`, `done?`)                                                                              |
| DELETE | `/subtasks/:id`       | Exclui subtarefa                                                                                          |
| GET    | `/task-categories`    | Lista categorias (semeia as padrão na primeira chamada)                                                   |
| POST   | `/task-categories`    | Cria categoria (`name`, `icon`, `color`)                                                                  |

## Projetos

| Método | Rota                | Descrição                                           |
| ------ | ------------------- | --------------------------------------------------- |
| GET    | `/projects?status=` | Lista com progresso (tarefas concluídas/total)      |
| POST   | `/projects`         | Cria (`name`, `description?`, `color`, `deadline?`) |
| GET    | `/projects/:id`     | Detalhe com progresso                               |
| PATCH  | `/projects/:id`     | Atualiza (inclui `status`)                          |
| DELETE | `/projects/:id`     | Exclui (tarefas ficam sem projeto)                  |

## Notas

| Método | Rota                       | Descrição                                        |
| ------ | -------------------------- | ------------------------------------------------ |
| GET    | `/notes?categoria=&busca=` | Lista (fixadas primeiro)                         |
| POST   | `/notes`                   | Cria (`title`, `category`, `content`, `pinned?`) |
| PATCH  | `/notes/:id`               | Atualiza                                         |
| DELETE | `/notes/:id`               | Exclui                                           |

## Pomodoro e Estudos

| Método | Rota              | Descrição                                                                     |
| ------ | ----------------- | ----------------------------------------------------------------------------- |
| GET    | `/pomodoro?data=` | Estatísticas do dia (`focusSessions`, `focusMinutes`)                         |
| POST   | `/pomodoro`       | Registra sessão (`kind`, `durationMinutes`, `date`, `taskId?`)                |
| GET    | `/study/plans`    | Planos ativos com matérias, progresso semanal e meta diária                   |
| POST   | `/study/plans`    | Cria plano (`name`, `icon`, `durationDays`, `dailyGoalMinutes`, `subjects[]`) |
| POST   | `/study/sessions` | Registra sessão de estudo (`planId`, `subjectId?`, `date`, `minutes`)         |

## Compras

| Método | Rota                  | Descrição                                          |
| ------ | --------------------- | -------------------------------------------------- |
| GET    | `/shopping-lists`     | Listas com itens, contagens e totais em centavos   |
| POST   | `/shopping-lists`     | Cria lista (`name`)                                |
| PATCH  | `/shopping-lists/:id` | Atualiza (`name?`, `done?`)                        |
| POST   | `/shopping-lists/:id` | Adiciona item (`name`, `quantity?`, `priceCents?`) |
| DELETE | `/shopping-lists/:id` | Exclui lista e itens                               |
| PATCH  | `/shopping-items/:id` | Atualiza item (inclui `purchased`)                 |
| DELETE | `/shopping-items/:id` | Exclui item                                        |

## Vida Pessoal

| Método | Rota                      | Descrição                                                                          |
| ------ | ------------------------- | ---------------------------------------------------------------------------------- |
| GET    | `/birthdays`              | Aniversários ordenados pela proximidade (`daysUntil`, `turnsAge`)                  |
| POST   | `/birthdays`              | Cria (`name`, `birthDate`, `relationship`, `notes?`)                               |
| PATCH  | `/birthdays/:id`          | Atualiza                                                                           |
| DELETE | `/birthdays/:id`          | Exclui                                                                             |
| GET    | `/moods?de=&ate=`         | Registros de humor                                                                 |
| POST   | `/moods`                  | Upsert do dia (`date`, `mood`, `note?`) — 1 registro por dia                       |
| GET    | `/moods/analysis`         | Total, sequência, últimos 7 dias, humor mais frequente e distribuição              |
| GET    | `/diary`                  | Entradas do diário (desc)                                                          |
| POST   | `/diary`                  | Cria (`date`, `title?`, `content`, `mood?`)                                        |
| PATCH  | `/diary/:id`              | Atualiza                                                                           |
| DELETE | `/diary/:id`              | Exclui                                                                             |
| GET    | `/dream-journal`          | Sonhos registrados (desc)                                                          |
| POST   | `/dream-journal`          | Cria (`date`, `title`, `description?`, `lucid?`, `nightmare?`, `clarity`, `mood?`) |
| PATCH  | `/dream-journal/:id`      | Atualiza                                                                           |
| DELETE | `/dream-journal/:id`      | Exclui                                                                             |
| GET    | `/dream-journal/analysis` | Total, lúcidos, pesadelos, clareza média e distribuição por humor                  |

## Backup

| Método | Rota      | Descrição                                                              |
| ------ | --------- | ---------------------------------------------------------------------- |
| GET    | `/backup` | Exporta todos os dados do usuário em JSON (`version`, `data`)          |
| POST   | `/backup` | Restaura um backup exportado (idempotente: ids existentes são pulados) |
