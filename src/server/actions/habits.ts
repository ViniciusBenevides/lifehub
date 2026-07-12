"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/server/session";
import * as habitsService from "@/server/services/habits";
import {
  createHabitSchema,
  toggleHabitLogSchema,
  updateHabitSchema,
} from "@/shared/schemas/habits";
import type { ActionResult } from "@/server/actions/goals";

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

function revalidateHabits(habitId?: string) {
  revalidatePath("/habitos");
  revalidatePath("/dashboard");
  if (habitId) revalidatePath(`/habitos/${habitId}`);
}

export async function createHabitAction(
  input: unknown,
): Promise<ActionResult<habitsService.Habit>> {
  try {
    const user = await requireUser();
    const data = createHabitSchema.parse(input);
    const habit = await habitsService.createHabit(user.id, data);
    revalidateHabits();
    return { ok: true, data: habit };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateHabitAction(
  habitId: string,
  input: unknown,
): Promise<ActionResult<habitsService.Habit>> {
  try {
    const user = await requireUser();
    const data = updateHabitSchema.parse(input);
    const habit = await habitsService.updateHabit(user.id, z.uuid().parse(habitId), data);
    revalidateHabits(habitId);
    return { ok: true, data: habit };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteHabitAction(habitId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await habitsService.deleteHabit(user.id, z.uuid().parse(habitId));
    revalidateHabits();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function toggleHabitLogAction(habitId: string, input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const data = toggleHabitLogSchema.parse(input);
    await habitsService.toggleHabitLog(user.id, z.uuid().parse(habitId), data.date, data.done);
    revalidateHabits(habitId);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
