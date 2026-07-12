import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { getDay, subDays } from "date-fns";

import { getDb } from "@/server/db";
import { goals, habitLogs, habits } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import {
  computeStreaks,
  countScheduledDays,
  frequencyFromHabit,
  toKey,
  type StreakResult,
} from "@/server/services/streaks";
import type { CreateHabitInput, UpdateHabitInput } from "@/shared/schemas/habits";

export type Habit = typeof habits.$inferSelect;
export type HabitLog = typeof habitLogs.$inferSelect;

export type HabitWithStatus = Habit & {
  doneToday: boolean;
  scheduledToday: boolean;
  streak: StreakResult;
  goalTitle: string | null;
};

export type HabitStats = {
  rate7: number;
  rate30: number;
  /** 0 = domingo … 6 = sábado; null sem dados. */
  bestWeekday: number | null;
  totalDone: number;
};

export type HeatmapDay = { date: string; count: number };

export type HabitDetail = HabitWithStatus & {
  stats: HabitStats;
  heatmap: HeatmapDay[];
};

function isScheduledOn(habit: Habit, date: Date): boolean {
  if (habit.frequencyType === "weekly_days") {
    return (habit.weeklyDays ?? []).includes(getDay(date));
  }
  return true;
}

async function logsByHabit(userId: string, habitIds: string[]): Promise<Map<string, Set<string>>> {
  const map = new Map<string, Set<string>>();
  if (habitIds.length === 0) return map;
  const rows = await getDb()
    .select({ habitId: habitLogs.habitId, date: habitLogs.date })
    .from(habitLogs)
    .where(inArray(habitLogs.habitId, habitIds));
  for (const row of rows) {
    if (!map.has(row.habitId)) map.set(row.habitId, new Set());
    map.get(row.habitId)!.add(row.date);
  }
  return map;
}

export async function listHabits(
  userId: string,
  today: Date,
  { includeInactive = false } = {},
): Promise<HabitWithStatus[]> {
  const db = getDb();
  const conditions = [eq(habits.userId, userId)];
  if (!includeInactive) conditions.push(eq(habits.active, true));

  const rows = await db
    .select({ habit: habits, goalTitle: goals.title })
    .from(habits)
    .leftJoin(goals, eq(habits.goalId, goals.id))
    .where(and(...conditions))
    .orderBy(asc(habits.createdAt));

  const logs = await logsByHabit(
    userId,
    rows.map((row) => row.habit.id),
  );
  const todayKey = toKey(today);

  return rows.map(({ habit, goalTitle }) => {
    const done = logs.get(habit.id) ?? new Set<string>();
    return {
      ...habit,
      goalTitle,
      doneToday: done.has(todayKey),
      scheduledToday: isScheduledOn(habit, today),
      streak: computeStreaks(done, frequencyFromHabit(habit), today),
    };
  });
}

function computeStats(habit: Habit, done: Set<string>, today: Date): HabitStats {
  const frequency = frequencyFromHabit(habit);

  function rate(days: number): number {
    const from = subDays(today, days - 1);
    const scheduled = countScheduledDays(frequency, from, today);
    if (scheduled === 0) return 0;
    let doneCount = 0;
    for (const key of done) {
      if (key >= toKey(from) && key <= toKey(today)) doneCount += 1;
    }
    return Math.min(100, Math.round((doneCount / scheduled) * 100));
  }

  const byWeekday = new Map<number, number>();
  for (const key of done) {
    const [year, month, day] = key.split("-").map(Number);
    const weekday = getDay(new Date(year, month - 1, day));
    byWeekday.set(weekday, (byWeekday.get(weekday) ?? 0) + 1);
  }
  let bestWeekday: number | null = null;
  let bestCount = 0;
  for (const [weekday, count] of byWeekday) {
    if (count > bestCount) {
      bestCount = count;
      bestWeekday = weekday;
    }
  }

  return { rate7: rate(7), rate30: rate(30), bestWeekday, totalDone: done.size };
}

function heatmapFromDates(dates: Iterable<string>, today: Date, days: number): HeatmapDay[] {
  const counts = new Map<string, number>();
  for (const key of dates) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const result: HeatmapDay[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const key = toKey(subDays(today, offset));
    result.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return result;
}

export async function getHabitDetail(
  userId: string,
  habitId: string,
  today: Date,
): Promise<HabitDetail> {
  const db = getDb();
  const [row] = await db
    .select({ habit: habits, goalTitle: goals.title })
    .from(habits)
    .leftJoin(goals, eq(habits.goalId, goals.id))
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Hábito não encontrado");

  const logs = await logsByHabit(userId, [habitId]);
  const done = logs.get(habitId) ?? new Set<string>();

  return {
    ...row.habit,
    goalTitle: row.goalTitle,
    doneToday: done.has(toKey(today)),
    scheduledToday: isScheduledOn(row.habit, today),
    streak: computeStreaks(done, frequencyFromHabit(row.habit), today),
    stats: computeStats(row.habit, done, today),
    heatmap: heatmapFromDates(done, today, 365),
  };
}

/** Heatmap geral: total de hábitos concluídos por dia (todos os hábitos). */
export async function getUserHeatmap(
  userId: string,
  today: Date,
  days = 365,
): Promise<HeatmapDay[]> {
  const db = getDb();
  const from = toKey(subDays(today, days - 1));
  const rows = await db
    .select({ date: habitLogs.date })
    .from(habitLogs)
    .innerJoin(habits, eq(habitLogs.habitId, habits.id))
    .where(and(eq(habits.userId, userId), gte(habitLogs.date, from)));
  return heatmapFromDates(
    rows.map((row) => row.date),
    today,
    days,
  );
}

async function findOwnedHabit(userId: string, habitId: string): Promise<Habit> {
  const [habit] = await getDb()
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  if (!habit) throw new NotFoundError("Hábito não encontrado");
  return habit;
}

async function assertOwnedGoal(userId: string, goalId: string): Promise<void> {
  const [goal] = await getDb()
    .select({ id: goals.id })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);
  if (!goal) throw new NotFoundError("Meta não encontrada");
}

export async function createHabit(userId: string, input: CreateHabitInput): Promise<Habit> {
  if (input.goalId) await assertOwnedGoal(userId, input.goalId);
  const [habit] = await getDb()
    .insert(habits)
    .values({
      userId,
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
      frequencyType: input.frequencyType,
      weeklyDays: input.frequencyType === "weekly_days" ? (input.weeklyDays ?? []) : null,
      timesPerWeek: input.frequencyType === "times_per_week" ? (input.timesPerWeek ?? 1) : null,
      timeOfDay: input.timeOfDay,
      goalId: input.goalId ?? null,
    })
    .returning();
  return habit;
}

export async function updateHabit(
  userId: string,
  habitId: string,
  input: UpdateHabitInput,
): Promise<Habit> {
  await findOwnedHabit(userId, habitId);
  if (input.goalId) await assertOwnedGoal(userId, input.goalId);
  const [updated] = await getDb()
    .update(habits)
    .set(input)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .returning();
  return updated;
}

export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  await findOwnedHabit(userId, habitId);
  await getDb()
    .delete(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
}

/** Marca/desmarca de forma idempotente o hábito na data. */
export async function toggleHabitLog(
  userId: string,
  habitId: string,
  date: string,
  done: boolean,
): Promise<void> {
  await findOwnedHabit(userId, habitId);
  const db = getDb();
  if (done) {
    await db.insert(habitLogs).values({ habitId, date }).onConflictDoNothing();
  } else {
    await db.delete(habitLogs).where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, date)));
  }
}
