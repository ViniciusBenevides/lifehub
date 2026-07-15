"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/server/actions/goals";
import * as birthdaysService from "@/server/services/birthdays";
import * as diaryService from "@/server/services/diary";
import * as dreamJournalService from "@/server/services/dream-journal";
import * as moodService from "@/server/services/mood";
import { requireUser } from "@/server/session";
import {
  createBirthdaySchema,
  createDiaryEntrySchema,
  createDreamEntrySchema,
  updateBirthdaySchema,
  updateDiaryEntrySchema,
  updateDreamEntrySchema,
  upsertMoodSchema,
} from "@/shared/schemas/personal";

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

// ---------------------------------------------------------------------------
// Aniversários
// ---------------------------------------------------------------------------

function revalidateBirthdays() {
  revalidatePath("/aniversarios");
  revalidatePath("/inicio");
}

export async function createBirthdayAction(
  input: unknown,
): Promise<ActionResult<birthdaysService.Birthday>> {
  try {
    const user = await requireUser();
    const data = createBirthdaySchema.parse(input);
    const birthday = await birthdaysService.createBirthday(user.id, data);
    revalidateBirthdays();
    return { ok: true, data: birthday };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateBirthdayAction(
  birthdayId: string,
  input: unknown,
): Promise<ActionResult<birthdaysService.Birthday>> {
  try {
    const user = await requireUser();
    const data = updateBirthdaySchema.parse(input);
    const birthday = await birthdaysService.updateBirthday(
      user.id,
      z.uuid().parse(birthdayId),
      data,
    );
    revalidateBirthdays();
    return { ok: true, data: birthday };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteBirthdayAction(birthdayId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await birthdaysService.deleteBirthday(user.id, z.uuid().parse(birthdayId));
    revalidateBirthdays();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

// ---------------------------------------------------------------------------
// Humor
// ---------------------------------------------------------------------------

function revalidateMood() {
  revalidatePath("/humor");
  revalidatePath("/humor/analise");
  revalidatePath("/inicio");
}

export async function upsertMoodAction(
  input: unknown,
): Promise<ActionResult<moodService.MoodEntry>> {
  try {
    const user = await requireUser();
    const data = upsertMoodSchema.parse(input);
    const entry = await moodService.upsertMood(user.id, data);
    revalidateMood();
    return { ok: true, data: entry };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

// ---------------------------------------------------------------------------
// Diário
// ---------------------------------------------------------------------------

function revalidateDiary() {
  revalidatePath("/diario");
}

export async function createDiaryEntryAction(
  input: unknown,
): Promise<ActionResult<diaryService.DiaryEntry>> {
  try {
    const user = await requireUser();
    const data = createDiaryEntrySchema.parse(input);
    const entry = await diaryService.createDiaryEntry(user.id, data);
    revalidateDiary();
    return { ok: true, data: entry };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateDiaryEntryAction(
  entryId: string,
  input: unknown,
): Promise<ActionResult<diaryService.DiaryEntry>> {
  try {
    const user = await requireUser();
    const data = updateDiaryEntrySchema.parse(input);
    const entry = await diaryService.updateDiaryEntry(user.id, z.uuid().parse(entryId), data);
    revalidateDiary();
    return { ok: true, data: entry };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteDiaryEntryAction(entryId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await diaryService.deleteDiaryEntry(user.id, z.uuid().parse(entryId));
    revalidateDiary();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

// ---------------------------------------------------------------------------
// Diário de Sonhos
// ---------------------------------------------------------------------------

function revalidateDreamJournal() {
  revalidatePath("/diario-sonhos");
  revalidatePath("/diario-sonhos/analise");
}

export async function createDreamEntryAction(
  input: unknown,
): Promise<ActionResult<dreamJournalService.DreamEntry>> {
  try {
    const user = await requireUser();
    const data = createDreamEntrySchema.parse(input);
    const entry = await dreamJournalService.createDreamEntry(user.id, data);
    revalidateDreamJournal();
    return { ok: true, data: entry };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateDreamEntryAction(
  entryId: string,
  input: unknown,
): Promise<ActionResult<dreamJournalService.DreamEntry>> {
  try {
    const user = await requireUser();
    const data = updateDreamEntrySchema.parse(input);
    const entry = await dreamJournalService.updateDreamEntry(
      user.id,
      z.uuid().parse(entryId),
      data,
    );
    revalidateDreamJournal();
    return { ok: true, data: entry };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteDreamEntryAction(entryId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await dreamJournalService.deleteDreamEntry(user.id, z.uuid().parse(entryId));
    revalidateDreamJournal();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
