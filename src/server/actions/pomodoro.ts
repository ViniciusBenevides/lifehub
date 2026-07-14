"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/server/actions/goals";
import * as pomodoroService from "@/server/services/pomodoro";
import { requireUser } from "@/server/session";
import { recordPomodoroSchema } from "@/shared/schemas/pomodoro";

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

export async function recordPomodoroAction(
  input: unknown,
): Promise<ActionResult<pomodoroService.PomodoroSession>> {
  try {
    const user = await requireUser();
    const data = recordPomodoroSchema.parse(input);
    const session = await pomodoroService.recordPomodoroSession(user.id, data);
    revalidatePath("/pomodoro");
    revalidatePath("/dashboard");
    revalidatePath("/inicio");
    return { ok: true, data: session };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
