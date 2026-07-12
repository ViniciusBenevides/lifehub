import { and, asc, desc, eq, gte, inArray, isNull, lt, lte } from "drizzle-orm";
import { addDays, addMonths, addWeeks, format } from "date-fns";

import { getDb } from "@/server/db";
import { goals, tasks } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type { CreateTaskInput, UpdateTaskInput } from "@/shared/schemas/tasks";

export type Task = typeof tasks.$inferSelect;
export type TaskWithGoal = Task & { goalTitle: string | null };

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
        title: template.title,
        notes: template.notes,
        date,
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

export async function listTasksInRange(
  userId: string,
  from: string,
  to: string,
): Promise<TaskWithGoal[]> {
  await ensureRecurringTasks(userId, from, to);
  const rows = await getDb()
    .select({ task: tasks, goalTitle: goals.title })
    .from(tasks)
    .leftJoin(goals, eq(tasks.goalId, goals.id))
    .where(and(eq(tasks.userId, userId), gte(tasks.date, from), lte(tasks.date, to)))
    .orderBy(asc(tasks.date), asc(tasks.order), desc(tasks.priority));

  return rows
    .map(({ task, goalTitle }) => ({ ...task, goalTitle }))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
    );
}

/** Tarefas pendentes com data anterior a `today`. */
export async function listOverdueTasks(userId: string, today: string): Promise<TaskWithGoal[]> {
  const rows = await getDb()
    .select({ task: tasks, goalTitle: goals.title })
    .from(tasks)
    .leftJoin(goals, eq(tasks.goalId, goals.id))
    .where(and(eq(tasks.userId, userId), eq(tasks.status, "todo"), lt(tasks.date, today)))
    .orderBy(asc(tasks.date));
  // Templates recorrentes não contam como atrasados — são geradores, não tarefas.
  return rows
    .map(({ task, goalTitle }) => ({ ...task, goalTitle }))
    .filter((task) => task.recurrenceRule == null);
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

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  if (input.goalId) await assertOwnedGoal(userId, input.goalId);
  const [task] = await getDb()
    .insert(tasks)
    .values({
      userId,
      title: input.title,
      notes: input.notes ?? null,
      date: input.date,
      priority: input.priority,
      goalId: input.goalId ?? null,
      recurrenceRule: input.recurrenceRule ?? null,
    })
    .returning();
  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  await findOwnedTask(userId, taskId);
  if (input.goalId) await assertOwnedGoal(userId, input.goalId);
  const [updated] = await getDb()
    .update(tasks)
    .set({
      ...input,
      completedAt:
        input.status === "done" ? new Date() : input.status === "todo" ? null : undefined,
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
