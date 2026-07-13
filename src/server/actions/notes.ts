"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/server/actions/goals";
import * as notesService from "@/server/services/notes";
import { requireUser } from "@/server/session";
import { createNoteSchema, updateNoteSchema } from "@/shared/schemas/notes";

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

function revalidateNotes() {
  revalidatePath("/notas");
  revalidatePath("/pesquisar");
}

export async function createNoteAction(input: unknown): Promise<ActionResult<notesService.Note>> {
  try {
    const user = await requireUser();
    const data = createNoteSchema.parse(input);
    const note = await notesService.createNote(user.id, data);
    revalidateNotes();
    return { ok: true, data: note };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateNoteAction(
  noteId: string,
  input: unknown,
): Promise<ActionResult<notesService.Note>> {
  try {
    const user = await requireUser();
    const data = updateNoteSchema.parse(input);
    const note = await notesService.updateNote(user.id, z.uuid().parse(noteId), data);
    revalidateNotes();
    return { ok: true, data: note };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteNoteAction(noteId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await notesService.deleteNote(user.id, z.uuid().parse(noteId));
    revalidateNotes();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
