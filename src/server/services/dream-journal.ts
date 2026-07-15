import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/server/db";
import { dreamEntries } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type { Mood } from "@/shared/constants/personal";
import { moodValues } from "@/shared/schemas/personal";
import type { CreateDreamEntryInput, UpdateDreamEntryInput } from "@/shared/schemas/personal";

export type DreamEntry = typeof dreamEntries.$inferSelect;

export type DreamAnalysis = {
  total: number;
  lucidCount: number;
  nightmareCount: number;
  averageClarity: number;
  distribution: Array<{ mood: Mood; count: number; percent: number }>;
};

export async function listDreamEntries(userId: string, limit = 200): Promise<DreamEntry[]> {
  return getDb()
    .select()
    .from(dreamEntries)
    .where(eq(dreamEntries.userId, userId))
    .orderBy(desc(dreamEntries.date), desc(dreamEntries.createdAt))
    .limit(limit);
}

async function findOwned(userId: string, entryId: string): Promise<DreamEntry> {
  const [row] = await getDb()
    .select()
    .from(dreamEntries)
    .where(and(eq(dreamEntries.id, entryId), eq(dreamEntries.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Sonho não encontrado");
  return row;
}

export async function createDreamEntry(
  userId: string,
  input: CreateDreamEntryInput,
): Promise<DreamEntry> {
  const [row] = await getDb()
    .insert(dreamEntries)
    .values({
      userId,
      date: input.date,
      title: input.title,
      description: input.description ?? null,
      lucid: input.lucid ?? false,
      nightmare: input.nightmare ?? false,
      clarity: input.clarity,
      mood: input.mood ?? null,
    })
    .returning();
  return row;
}

export async function updateDreamEntry(
  userId: string,
  entryId: string,
  input: UpdateDreamEntryInput,
): Promise<DreamEntry> {
  await findOwned(userId, entryId);
  const [row] = await getDb()
    .update(dreamEntries)
    .set(input)
    .where(and(eq(dreamEntries.id, entryId), eq(dreamEntries.userId, userId)))
    .returning();
  return row;
}

export async function deleteDreamEntry(userId: string, entryId: string): Promise<void> {
  await findOwned(userId, entryId);
  await getDb()
    .delete(dreamEntries)
    .where(and(eq(dreamEntries.id, entryId), eq(dreamEntries.userId, userId)));
}

/** Estatísticas agregadas do diário de sonhos (função pura sobre as entradas). */
export function analyzeDreams(entries: DreamEntry[]): DreamAnalysis {
  const total = entries.length;
  const lucidCount = entries.filter((entry) => entry.lucid).length;
  const nightmareCount = entries.filter((entry) => entry.nightmare).length;
  const averageClarity =
    total > 0
      ? Math.round((entries.reduce((sum, entry) => sum + entry.clarity, 0) / total) * 10) / 10
      : 0;

  const withMood = entries.filter((entry) => entry.mood != null);
  const counts = new Map<Mood, number>();
  for (const entry of withMood) {
    counts.set(entry.mood as Mood, (counts.get(entry.mood as Mood) ?? 0) + 1);
  }
  const distribution = moodValues
    .map((mood) => ({
      mood,
      count: counts.get(mood) ?? 0,
      percent:
        withMood.length > 0 ? Math.round(((counts.get(mood) ?? 0) / withMood.length) * 100) : 0,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  return { total, lucidCount, nightmareCount, averageClarity, distribution };
}

export async function getDreamAnalysis(userId: string): Promise<DreamAnalysis> {
  return analyzeDreams(await listDreamEntries(userId, 1000));
}
