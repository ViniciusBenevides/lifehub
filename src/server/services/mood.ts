import { and, desc, eq, gte, lte } from "drizzle-orm";
import { differenceInCalendarDays, format, subDays } from "date-fns";

import { getDb } from "@/server/db";
import { moodEntries } from "@/server/db/schema";
import type { Mood } from "@/shared/constants/personal";
import { moodValues } from "@/shared/schemas/personal";
import type { UpsertMoodInput } from "@/shared/schemas/personal";

export type MoodEntry = typeof moodEntries.$inferSelect;

export type MoodAnalysis = {
  total: number;
  /** Dias consecutivos com registro, terminando hoje ou ontem. */
  streak: number;
  /** Registros nos últimos 7 dias. */
  lastWeek: number;
  mostFrequent: Mood | null;
  distribution: Array<{ mood: Mood; count: number; percent: number }>;
};

export async function upsertMood(userId: string, input: UpsertMoodInput): Promise<MoodEntry> {
  const [row] = await getDb()
    .insert(moodEntries)
    .values({ userId, date: input.date, mood: input.mood, note: input.note ?? null })
    .onConflictDoUpdate({
      target: [moodEntries.userId, moodEntries.date],
      set: { mood: input.mood, note: input.note ?? null },
    })
    .returning();
  return row;
}

export async function deleteMood(userId: string, date: string): Promise<void> {
  await getDb()
    .delete(moodEntries)
    .where(and(eq(moodEntries.userId, userId), eq(moodEntries.date, date)));
}

export async function listMoods(
  userId: string,
  options: { from?: string; to?: string; limit?: number } = {},
): Promise<MoodEntry[]> {
  const conditions = [eq(moodEntries.userId, userId)];
  if (options.from) conditions.push(gte(moodEntries.date, options.from));
  if (options.to) conditions.push(lte(moodEntries.date, options.to));
  return getDb()
    .select()
    .from(moodEntries)
    .where(and(...conditions))
    .orderBy(desc(moodEntries.date))
    .limit(options.limit ?? 90);
}

/** Sequência de dias consecutivos com registro (função pura, datas desc). */
export function moodStreak(datesDesc: string[], today: Date): number {
  if (datesDesc.length === 0) return 0;
  const first = new Date(`${datesDesc[0]}T00:00:00`);
  const gap = differenceInCalendarDays(today, first);
  // A sequência só vale se o registro mais recente for de hoje ou ontem.
  if (gap > 1) return 0;
  let streak = 1;
  for (let i = 1; i < datesDesc.length; i++) {
    const prev = new Date(`${datesDesc[i - 1]}T00:00:00`);
    const current = new Date(`${datesDesc[i]}T00:00:00`);
    if (differenceInCalendarDays(prev, current) === 1) streak += 1;
    else break;
  }
  return streak;
}

export async function getMoodAnalysis(userId: string, today: Date): Promise<MoodAnalysis> {
  const entries = await getDb()
    .select()
    .from(moodEntries)
    .where(eq(moodEntries.userId, userId))
    .orderBy(desc(moodEntries.date));

  const total = entries.length;
  const weekStart = format(subDays(today, 6), "yyyy-MM-dd");
  const lastWeek = entries.filter((entry) => entry.date >= weekStart).length;

  const counts = new Map<Mood, number>();
  for (const entry of entries) {
    counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1);
  }
  const distribution = moodValues
    .map((mood) => ({
      mood,
      count: counts.get(mood) ?? 0,
      percent: total > 0 ? Math.round(((counts.get(mood) ?? 0) / total) * 100) : 0,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    total,
    streak: moodStreak(
      entries.map((entry) => entry.date),
      today,
    ),
    lastWeek,
    mostFrequent: distribution[0]?.mood ?? null,
    distribution,
  };
}
