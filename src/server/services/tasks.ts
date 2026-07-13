import { and, asc, count, desc, eq, gte, ilike, inArray, isNull, lt, lte, sql } from "drizzle-orm";
import { addDays, addMonths, addWeeks, format } from "date-fns";

import { getDb } from "@/server/db";
import { goals, projects, taskCategories, taskSubtasks, tasks } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type {
  CreateSubtaskInput,
  CreateTaskCategoryInput,
  CreateTaskInput,
  UpdateSubtaskInput,
  UpdateTaskInput,
} from "@/shared/schemas/tasks";

export type Task = typeof tasks.$inferSelect;
export type Subtask = typeof taskSubtasks.$inferSelect;
export type TaskCategory = typeof taskCategories.$inferSelect;

export type TaskWithMeta = Task & {
  goalTitle: string | null;
  projectName: string | null;
  projectColor: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  subtasksTotal: number;
  subtasksDone: number;
};

// Compatibility alias (older components import TaskWithGoal).
export type TaskWithGoal = TaskWithMeta;

const DATE = "yyyy-MM-dd";

function parseKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Próximas ocorrências de um template dentro de [from, to]. */
export function occurrencesInRange(
  templateDate: string,
  rule: "daily" | "weekly" | "monthly",
  from: string,
  to: string,
): string[] {
  const result: string[] = [];
  let cursor = parseKey(templateDate);
  const advance = rule === "daily" ? addDays : rule === "weekly" ? addWeeks : addMonths;
  // A primeira ocorrência gerada é a seguinte à data do template.
  cursor = advance(cursor, 1);
  // Limite de segurança para nunca laçar indefinidamente.
  for (let i = 0; i < 400; i++) {
    const key = format(cursor, DATE);
    if (key > to) break;
    if (key >= from) result.push(key);
    cursor = advance(cursor, 1);
  }
  return result;
}

/**
 * Gera, de forma idempotente, as ocorrências de tarefas recorrentes dentro
 * do intervalo consultado.
 */
export async function ensureRecurringTasks(
  userId: string,
  from: string,
  to: string,
): Promise<number> {
  const db = getDb();
  const templates = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), isNull(tasks.recurringSourceId), lte(tasks.date, to)));
  const recurring = templates.filter(
    (task): task is Task & { recurrenceRule: "daily" | "weekly" | "monthly" } =>
      task.recurrenceRule === "daily" ||
      task.recurrenceRule === "weekly" ||
      task.recurrenceRule === "monthly",
  );
  if (recurring.length === 0) return 0;

  const existing = await db
    .select({ sourceId: tasks.recurringSourceId, date: tasks.date })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        inArray(
          tasks.recurringSourceId,
          recurring.map((task) => task.id),
        ),
        gte(tasks.date, from),
        lte(tasks.date, to),
      ),
    );
  const existingKeys = new Set(existing.map((row) => `${row.sourceId}:${row.date}`));

  const values = recurring.flatMap((template) =>
    occurrencesInRange(template.date, template.recurrenceRule, from, to)
      .filter((date) => !existingKeys.has(`${template.id}:${date}`))
      .map((date) => ({
        userId,
        goalId: template.goalId,
        projectId: template.projectId,
        categoryId: template.categoryId,
        title: template.title,
        notes: template.notes,
        date,
        scheduledTime: template.scheduledTime,
        tags: template.tags,
        reminderEnabled: template.reminderEnabled,
        priority: template.priority,
        recurrenceRule: null,
        recurringSourceId: template.id,
      })),
  );
  if (values.length === 0) return 0;
  await db.insert(tasks).values(values);
  return values.length;
}

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 } as const;

type TaskRow = {
  task: Task;
  goalTitle: string | null;
  projectName: string | null;
  projectColor: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
};

function taskSelection() {
  return {
    task: tasks,
    goalTitle: goals.title,
    projectName: projects.name,
    projectColor: projects.color,
    categoryName: taskCategories.name,
    categoryIcon: taskCategories.icon,
    categoryColor: taskCategories.color,
  };
}

/** Anexa contagens de subtarefas (2ª consulta, agrupada) às linhas de tarefas. */
async function attachSubtaskCounts(rows: TaskRow[]): Promise<TaskWithMeta[]> {
  const ids = rows.map((row) => row.task.id);
  const counts = new Map<string, { total: number; done: number }>();
  if (ids.length > 0) {
    const grouped = await getDb()
      .select({
        taskId: taskSubtasks.taskId,
        total: count(),
        done: sql<number>`count(*) filter (where ${taskSubtasks.done})`.mapWith(Number),
      })
      .from(taskSubtasks)
      .where(inArray(taskSubtasks.taskId, ids))
      .groupBy(taskSubtasks.taskId);
    for (const row of grouped) counts.set(row.taskId, { total: row.total, done: row.done });
  }
  return rows.map(({ task, ...meta }) => ({
    ...task,
    ...meta,
    subtasksTotal: counts.get(task.id)?.total ?? 0,
    subtasksDone: counts.get(task.id)?.done ?? 0,
  }));
}

function baseTaskQuery() {
  return getDb()
    .select(taskSelection())
    .from(tasks)
    .leftJoin(goals, eq(tasks.goalId, goals.id))
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(taskCategories, eq(tasks.categoryId, taskCategories.id));
}

export async function listTasksInRange(
  userId: string,
  from: string,
  to: string,
): Promise<TaskWithMeta[]> {
  await ensureRecurringTasks(userId, from, to);
  const rows = await baseTaskQuery()
    .where(and(eq(tasks.userId, userId), gte(tasks.date, from), lte(tasks.date, to)))
    .orderBy(asc(tasks.date), asc(tasks.order), desc(tasks.priority));

  const withMeta = await attachSubtaskCounts(rows);
  return withMeta.sort(
    (a, b) =>
      a.date.localeCompare(b.date) || PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
  );
}

/**
 * Lista geral (sem gerar recorrências): usada pelas abas Todas/Pendentes/
 * Concluídas, pelo Kanban e pela busca. Exclui templates recorrentes.
 */
export async function listAllTasks(
  userId: string,
  options: {
    statuses?: Task["status"][];
    search?: string;
    projectId?: string;
    limit?: number;
  } = {},
): Promise<TaskWithMeta[]> {
  const conditions = [eq(tasks.userId, userId)];
  if (options.statuses && options.statuses.length > 0) {
    conditions.push(inArray(tasks.status, options.statuses));
  }
  if (options.search) {
    conditions.push(ilike(tasks.title, `%${options.search}%`));
  }
  if (options.projectId) {
    conditions.push(eq(tasks.projectId, options.projectId));
  }
  const rows = await baseTaskQuery()
    .where(and(...conditions))
    .orderBy(desc(tasks.date), asc(tasks.order))
    .limit(options.limit ?? 300);

  const withMeta = await attachSubtaskCounts(rows);
  return withMeta.filter((task) => task.recurrenceRule == null);
}

/** Tarefas pendentes com data anterior a `today`. */
export async function listOverdueTasks(userId: string, today: string): Promise<TaskWithMeta[]> {
  const rows = await baseTaskQuery()
    .where(
      and(
        eq(tasks.userId, userId),
        inArray(tasks.status, ["todo", "in_progress"]),
        lt(tasks.date, today),
      ),
    )
    .orderBy(asc(tasks.date));
  // Templates recorrentes não contam como atrasados — são geradores, não tarefas.
  const withMeta = await attachSubtaskCounts(rows);
  return withMeta.filter((task) => task.recurrenceRule == null);
}

async function findOwnedTask(userId: string, taskId: string): Promise<Task> {
  const [task] = await getDb()
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);
  if (!task) throw new NotFoundError("Tarefa não encontrada");
  return task;
}

async function assertOwnedGoal(userId: string, goalId: string): Promise<void> {
  const [goal] = await getDb()
    .select({ id: goals.id })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);
  if (!goal) throw new NotFoundError("Meta não encontrada");
}

async function assertOwnedProject(userId: string, projectId: string): Promise<void> {
  const [project] = await getDb()
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  if (!project) throw new NotFoundError("Projeto não encontrado");
}

async function assertOwnedCategory(userId: string, categoryId: string): Promise<void> {
  const [category] = await getDb()
    .select({ id: taskCategories.id })
    .from(taskCategories)
    .where(and(eq(taskCategories.id, categoryId), eq(taskCategories.userId, userId)))
    .limit(1);
  if (!category) throw new NotFoundError("Categoria não encontrada");
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  if (input.goalId) await assertOwnedGoal(userId, input.goalId);
  if (input.projectId) await assertOwnedProject(userId, input.projectId);
  if (input.categoryId) await assertOwnedCategory(userId, input.categoryId);
  const db = getDb();
  const [task] = await db
    .insert(tasks)
    .values({
      userId,
      title: input.title,
      notes: input.notes ?? null,
      date: input.date,
      scheduledTime: input.scheduledTime ?? null,
      priority: input.priority,
      goalId: input.goalId ?? null,
      projectId: input.projectId ?? null,
      categoryId: input.categoryId ?? null,
      tags: input.tags ?? null,
      reminderEnabled: input.reminderEnabled ?? false,
      recurrenceRule: input.recurrenceRule ?? null,
    })
    .returning();

  if (input.subtasks && input.subtasks.length > 0) {
    await db.insert(taskSubtasks).values(
      input.subtasks.map((title, order) => ({
        taskId: task.id,
        title,
        order,
      })),
    );
  }
  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  await findOwnedTask(userId, taskId);
  if (input.goalId) await assertOwnedGoal(userId, input.goalId);
  if (input.projectId) await assertOwnedProject(userId, input.projectId);
  if (input.categoryId) await assertOwnedCategory(userId, input.categoryId);
  const [updated] = await getDb()
    .update(tasks)
    .set({
      ...input,
      completedAt:
        input.status === "done" ? new Date() : input.status !== undefined ? null : undefined,
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();
  return updated;
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  await findOwnedTask(userId, taskId);
  await getDb()
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

// ---------------------------------------------------------------------------
// Subtarefas
// ---------------------------------------------------------------------------

export async function listSubtasks(userId: string, taskId: string): Promise<Subtask[]> {
  await findOwnedTask(userId, taskId);
  return getDb()
    .select()
    .from(taskSubtasks)
    .where(eq(taskSubtasks.taskId, taskId))
    .orderBy(asc(taskSubtasks.order), asc(taskSubtasks.id));
}

export async function createSubtask(
  userId: string,
  taskId: string,
  input: CreateSubtaskInput,
): Promise<Subtask> {
  await findOwnedTask(userId, taskId);
  const [{ value: total }] = await getDb()
    .select({ value: count() })
    .from(taskSubtasks)
    .where(eq(taskSubtasks.taskId, taskId));
  const [subtask] = await getDb()
    .insert(taskSubtasks)
    .values({ taskId, title: input.title, order: total })
    .returning();
  return subtask;
}

async function findOwnedSubtask(userId: string, subtaskId: string): Promise<Subtask> {
  const [row] = await getDb()
    .select({ subtask: taskSubtasks })
    .from(taskSubtasks)
    .innerJoin(tasks, eq(taskSubtasks.taskId, tasks.id))
    .where(and(eq(taskSubtasks.id, subtaskId), eq(tasks.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Subtarefa não encontrada");
  return row.subtask;
}

export async function updateSubtask(
  userId: string,
  subtaskId: string,
  input: UpdateSubtaskInput,
): Promise<Subtask> {
  await findOwnedSubtask(userId, subtaskId);
  const [updated] = await getDb()
    .update(taskSubtasks)
    .set(input)
    .where(eq(taskSubtasks.id, subtaskId))
    .returning();
  return updated;
}

export async function deleteSubtask(userId: string, subtaskId: string): Promise<void> {
  await findOwnedSubtask(userId, subtaskId);
  await getDb().delete(taskSubtasks).where(eq(taskSubtasks.id, subtaskId));
}

// ---------------------------------------------------------------------------
// Categorias de tarefas
// ---------------------------------------------------------------------------

const DEFAULT_TASK_CATEGORIES: Array<Pick<TaskCategory, "name" | "icon" | "color">> = [
  { name: "Pessoal", icon: "👤", color: "#a855f7" },
  { name: "Trabalho", icon: "💼", color: "#3b82f6" },
  { name: "Estudo", icon: "📚", color: "#10b981" },
  { name: "Casa", icon: "🏠", color: "#f59e0b" },
  { name: "Saúde", icon: "🩺", color: "#ef4444" },
];

/** Lista as categorias do usuário, semeando as padrão na primeira visita. */
export async function listTaskCategories(userId: string): Promise<TaskCategory[]> {
  const db = getDb();
  const existing = await db
    .select()
    .from(taskCategories)
    .where(eq(taskCategories.userId, userId))
    .orderBy(asc(taskCategories.order), asc(taskCategories.name));
  if (existing.length > 0) return existing;

  await db
    .insert(taskCategories)
    .values(DEFAULT_TASK_CATEGORIES.map((category, order) => ({ ...category, userId, order })));
  return db
    .select()
    .from(taskCategories)
    .where(eq(taskCategories.userId, userId))
    .orderBy(asc(taskCategories.order), asc(taskCategories.name));
}

export async function createTaskCategory(
  userId: string,
  input: CreateTaskCategoryInput,
): Promise<TaskCategory> {
  const [category] = await getDb()
    .insert(taskCategories)
    .values({ userId, ...input, order: 99 })
    .returning();
  return category;
}
