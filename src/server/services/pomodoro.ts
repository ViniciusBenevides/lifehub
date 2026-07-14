import { and, count, desc, eq, gte, lte, sum } from "drizzle-orm";

import { getDb } from "@/server/db";
import { pomodoroSessions, tasks } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type { RecordPomodoroInput } from "@/shared/schemas/pomodoro";

export type PomodoroSession = typeof pomodoroSessions.$inferSelect;

export type PomodoroDayStats = {
  focusSessions: number;
  focusMinutes: number;
};

export async function recordPomodoroSession(
  userId: string,
  input: RecordPomodoroInput,
): Promise<PomodoroSession> {
  if (input.taskId) {
    const [task] = await getDb()
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.id, input.taskId), eq(tasks.userId, userId)))
      .limit(1);
    if (!task) throw new NotFoundError("Tarefa não encontrada");
  }
  const [session] = await getDb()
    .insert(pomodoroSessions)
    .values({
      userId,
      kind: input.kind,
      durationMinutes: input.durationMinutes,
      date: input.date,
      taskId: input.taskId ?? null,
    })
    .returning();
  return session;
}

export async function getPomodoroDayStats(
  userId: string,
  dateKey: string,
): Promise<PomodoroDayStats> {
  const [row] = await getDb()
    .select({
      sessions: count(),
      minutes: sum(pomodoroSessions.durationMinutes).mapWith(Number),
    })
    .from(pomodoroSessions)
    .where(
      and(
        eq(pomodoroSessions.userId, userId),
        eq(pomodoroSessions.date, dateKey),
        eq(pomodoroSessions.kind, "focus"),
      ),
    );
  return { focusSessions: row?.sessions ?? 0, focusMinutes: row?.minutes ?? 0 };
}

/** Total de sessões de foco em [from, to] (usado pelo dashboard). */
export async function countFocusSessions(
  userId: string,
  from: string,
  to: string,
): Promise<number> {
  const [row] = await getDb()
    .select({ value: count() })
    .from(pomodoroSessions)
    .where(
      and(
        eq(pomodoroSessions.userId, userId),
        eq(pomodoroSessions.kind, "focus"),
        gte(pomodoroSessions.date, from),
        lte(pomodoroSessions.date, to),
      ),
    );
  return row?.value ?? 0;
}

export async function listRecentPomodoros(userId: string, limit = 10): Promise<PomodoroSession[]> {
  return getDb()
    .select()
    .from(pomodoroSessions)
    .where(and(eq(pomodoroSessions.userId, userId), eq(pomodoroSessions.kind, "focus")))
    .orderBy(desc(pomodoroSessions.startedAt))
    .limit(limit);
}
