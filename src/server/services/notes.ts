import { and, desc, eq, ilike, or } from "drizzle-orm";

import { getDb } from "@/server/db";
import { notes } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type { CreateNoteInput, UpdateNoteInput } from "@/shared/schemas/notes";

export type Note = typeof notes.$inferSelect;

export async function listNotes(
  userId: string,
  options: { category?: Note["category"]; search?: string } = {},
): Promise<Note[]> {
  const conditions = [eq(notes.userId, userId)];
  if (options.category) conditions.push(eq(notes.category, options.category));
  if (options.search) {
    const term = `%${options.search}%`;
    const searchCondition = or(ilike(notes.title, term), ilike(notes.content, term));
    if (searchCondition) conditions.push(searchCondition);
  }
  return getDb()
    .select()
    .from(notes)
    .where(and(...conditions))
    .orderBy(desc(notes.pinned), desc(notes.updatedAt));
}

async function findOwnedNote(userId: string, noteId: string): Promise<Note> {
  const [note] = await getDb()
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);
  if (!note) throw new NotFoundError("Anotação não encontrada");
  return note;
}

export async function createNote(userId: string, input: CreateNoteInput): Promise<Note> {
  const [note] = await getDb()
    .insert(notes)
    .values({
      userId,
      title: input.title,
      category: input.category,
      content: input.content,
      pinned: input.pinned ?? false,
    })
    .returning();
  return note;
}

export async function updateNote(
  userId: string,
  noteId: string,
  input: UpdateNoteInput,
): Promise<Note> {
  await findOwnedNote(userId, noteId);
  const [updated] = await getDb()
    .update(notes)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();
  return updated;
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  await findOwnedNote(userId, noteId);
  await getDb()
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}
