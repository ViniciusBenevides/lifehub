import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/server/db";
import { diaryEntries } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type { CreateDiaryEntryInput, UpdateDiaryEntryInput } from "@/shared/schemas/personal";

export type DiaryEntry = typeof diaryEntries.$inferSelect;

export async function listDiaryEntries(userId: string, limit = 100): Promise<DiaryEntry[]> {
  return getDb()
    .select()
    .from(diaryEntries)
    .where(eq(diaryEntries.userId, userId))
    .orderBy(desc(diaryEntries.date), desc(diaryEntries.createdAt))
    .limit(limit);
}

async function findOwned(userId: string, entryId: string): Promise<DiaryEntry> {
  const [row] = await getDb()
    .select()
    .from(diaryEntries)
    .where(and(eq(diaryEntries.id, entryId), eq(diaryEntries.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Registro do diário não encontrado");
  return row;
}

export async function createDiaryEntry(
  userId: string,
  input: CreateDiaryEntryInput,
): Promise<DiaryEntry> {
  const [row] = await getDb()
    .insert(diaryEntries)
    .values({
      userId,
      date: input.date,
      title: input.title ?? null,
      content: input.content,
      mood: input.mood ?? null,
    })
    .returning();
  return row;
}

export async function updateDiaryEntry(
  userId: string,
  entryId: string,
  input: UpdateDiaryEntryInput,
): Promise<DiaryEntry> {
  await findOwned(userId, entryId);
  const [row] = await getDb()
    .update(diaryEntries)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(diaryEntries.id, entryId), eq(diaryEntries.userId, userId)))
    .returning();
  return row;
}

export async function deleteDiaryEntry(userId: string, entryId: string): Promise<void> {
  await findOwned(userId, entryId);
  await getDb()
    .delete(diaryEntries)
    .where(and(eq(diaryEntries.id, entryId), eq(diaryEntries.userId, userId)));
}
