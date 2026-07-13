import { and, count, eq } from "drizzle-orm";

import { getDb } from "@/server/db";
import { habitLogs, habits, tasks } from "@/server/db/schema";

/**
 * XP awarded per activity. XP is always derived from real activity counts at
 * read time — there is no ledger table, which keeps it idempotent by
 * construction (important because the neon-http driver has no transactions).
 */
export const XP_VALUES = {
  taskCompleted: 10,
  habitCheck: 5,
  pomodoroFocus: 15,
  studySession: 10,
  goalCompleted: 50,
  dreamAchieved: 40,
} as const;

export type LevelInfo = {
  level: number;
  totalXp: number;
  /** Cumulative XP where the current level starts. */
  levelStartXp: number;
  /** Cumulative XP required for the next level. */
  nextLevelXp: number;
};

/** Cumulative XP required to reach `level`: 0, 100, 300, 600, 1000… */
export function xpForLevel(level: number): number {
  return (100 * (level - 1) * level) / 2;
}

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level += 1;
  return {
    level,
    totalXp,
    levelStartXp: xpForLevel(level),
    nextLevelXp: xpForLevel(level + 1),
  };
}

/** Level summary for the shell badge (expanded with more sources in the profile). */
export async function getLevelInfo(userId: string): Promise<LevelInfo> {
  const db = getDb();
  const [tasksDone, habitChecks] = await Promise.all([
    db
      .select({ value: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "done"))),
    db
      .select({ value: count() })
      .from(habitLogs)
      .innerJoin(habits, eq(habitLogs.habitId, habits.id))
      .where(eq(habits.userId, userId)),
  ]);

  const totalXp =
    tasksDone[0].value * XP_VALUES.taskCompleted + habitChecks[0].value * XP_VALUES.habitCheck;
  return levelFromXp(totalXp);
}
