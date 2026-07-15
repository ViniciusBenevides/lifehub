import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/server/db";
import {
  birthdays,
  budgets,
  diaryEntries,
  dreamEntries,
  dreams,
  goalMilestones,
  goals,
  habitLogs,
  habits,
  lifeAreas,
  moodEntries,
  notes,
  pomodoroSessions,
  projects,
  shoppingItems,
  shoppingLists,
  studyPlans,
  studySessions,
  studySubjects,
  taskCategories,
  taskSubtasks,
  tasks,
  transactionCategories,
  transactions,
} from "@/server/db/schema";

export const BACKUP_VERSION = 2;

/**
 * Tabelas exportadas, na ordem de restauração (pais antes de filhos, por
 * causa das FKs). Tabelas sem `userId` são filhas e herdam o dono via FK.
 */
const USER_TABLES = {
  lifeAreas,
  goals,
  goalMilestones,
  habits,
  habitLogs,
  transactionCategories,
  transactions,
  budgets,
  dreams,
  projects,
  taskCategories,
  tasks,
  taskSubtasks,
  notes,
  studyPlans,
  studySubjects,
  studySessions,
  pomodoroSessions,
  shoppingLists,
  shoppingItems,
  birthdays,
  diaryEntries,
  moodEntries,
  dreamEntries,
} as const;

type TableName = keyof typeof USER_TABLES;

/** Filhas sem coluna userId: restauradas via vínculo com o pai. */
const CHILD_TABLES: ReadonlySet<TableName> = new Set([
  "goalMilestones",
  "habitLogs",
  "taskSubtasks",
  "studySubjects",
  "shoppingItems",
]);

/** Campos timestamp que precisam voltar a ser Date na importação. */
const TIMESTAMP_FIELDS = new Set(["createdAt", "updatedAt", "completedAt", "startedAt"]);

export type BackupPayload = {
  version: number;
  exportedAt: string;
  data: Record<TableName, Array<Record<string, unknown>>>;
};

export async function exportUserData(userId: string): Promise<BackupPayload> {
  const db = getDb();

  const [ownedRows, goalIds, habitIds, taskIds, planIds, listIds] = await Promise.all([
    Promise.all(
      (Object.keys(USER_TABLES) as TableName[])
        .filter((name) => !CHILD_TABLES.has(name))
        .map(async (name) => {
          const table = USER_TABLES[name];
          // Todas as tabelas não-filhas têm coluna userId.
          const rows = await db
            .select()
            .from(table)
            // @ts-expect-error — todas as tabelas deste ramo têm userId.
            .where(eq(table.userId, userId));
          return [name, rows] as const;
        }),
    ),
    db.select({ id: goals.id }).from(goals).where(eq(goals.userId, userId)),
    db.select({ id: habits.id }).from(habits).where(eq(habits.userId, userId)),
    db.select({ id: tasks.id }).from(tasks).where(eq(tasks.userId, userId)),
    db.select({ id: studyPlans.id }).from(studyPlans).where(eq(studyPlans.userId, userId)),
    db.select({ id: shoppingLists.id }).from(shoppingLists).where(eq(shoppingLists.userId, userId)),
  ]);

  const pick = (rows: { id: string }[]) => rows.map((row) => row.id);
  const [milestones, logs, subtasks, subjects, items] = await Promise.all([
    goalIds.length > 0
      ? db
          .select()
          .from(goalMilestones)
          .where(inArray(goalMilestones.goalId, pick(goalIds)))
      : Promise.resolve([]),
    habitIds.length > 0
      ? db
          .select()
          .from(habitLogs)
          .where(inArray(habitLogs.habitId, pick(habitIds)))
      : Promise.resolve([]),
    taskIds.length > 0
      ? db
          .select()
          .from(taskSubtasks)
          .where(inArray(taskSubtasks.taskId, pick(taskIds)))
      : Promise.resolve([]),
    planIds.length > 0
      ? db
          .select()
          .from(studySubjects)
          .where(inArray(studySubjects.planId, pick(planIds)))
      : Promise.resolve([]),
    listIds.length > 0
      ? db
          .select()
          .from(shoppingItems)
          .where(inArray(shoppingItems.listId, pick(listIds)))
      : Promise.resolve([]),
  ]);

  const data = Object.fromEntries([
    ...ownedRows,
    ["goalMilestones", milestones],
    ["habitLogs", logs],
    ["taskSubtasks", subtasks],
    ["studySubjects", subjects],
    ["shoppingItems", items],
  ]) as unknown as BackupPayload["data"];

  return { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
}

const backupSchema = z.object({
  version: z.number().int().min(1),
  data: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
});

function reviveRow(row: Record<string, unknown>, userId: string, child: boolean) {
  const revived: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (TIMESTAMP_FIELDS.has(key)) {
      revived[key] = typeof value === "string" ? new Date(value) : value;
    } else {
      revived[key] = value;
    }
  }
  // Reancora o dono no usuário atual (restauração entre contas é segura).
  if (!child) revived.userId = userId;
  return revived;
}

export type ImportResult = { table: string; imported: number; skipped: number };

/**
 * Restaura um backup: insere linha a linha preservando ids; conflitos de id
 * são ignorados (idempotente — importar duas vezes não duplica nada).
 */
export async function importUserData(userId: string, payload: unknown): Promise<ImportResult[]> {
  const parsed = backupSchema.parse(payload);
  const db = getDb();
  const results: ImportResult[] = [];

  for (const name of Object.keys(USER_TABLES) as TableName[]) {
    const rows = parsed.data[name];
    if (!rows || rows.length === 0) continue;
    const table = USER_TABLES[name];
    const child = CHILD_TABLES.has(name);
    let imported = 0;
    let skipped = 0;

    // Lotes pequenos para respeitar o limite de payload do driver HTTP.
    for (let start = 0; start < rows.length; start += 50) {
      const batch = rows.slice(start, start + 50).map((row) => reviveRow(row, userId, child));
      try {
        const insertedRows = await db
          .insert(table)
          .values(batch as never)
          .onConflictDoNothing()
          .returning();
        imported += insertedRows.length;
        skipped += batch.length - insertedRows.length;
      } catch {
        // Lote inválido (FK de outra conta, coluna desconhecida…): ignora.
        skipped += batch.length;
      }
    }
    results.push({ table: name, imported, skipped });
  }
  return results;
}
