"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/server/actions/goals";
import * as studyService from "@/server/services/study";
import { requireUser } from "@/server/session";
import { createStudyPlanSchema, logStudySessionSchema } from "@/shared/schemas/study";

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

function revalidateStudy() {
  revalidatePath("/estudos");
  revalidatePath("/dashboard");
  revalidatePath("/inicio");
}

export async function createStudyPlanAction(
  input: unknown,
): Promise<ActionResult<studyService.StudyPlan>> {
  try {
    const user = await requireUser();
    const data = createStudyPlanSchema.parse(input);
    const plan = await studyService.createStudyPlan(user.id, data);
    revalidateStudy();
    return { ok: true, data: plan };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function logStudySessionAction(
  input: unknown,
): Promise<ActionResult<studyService.StudySession>> {
  try {
    const user = await requireUser();
    const data = logStudySessionSchema.parse(input);
    const session = await studyService.logStudySession(user.id, data);
    revalidateStudy();
    return { ok: true, data: session };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteStudyPlanAction(planId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await studyService.deleteStudyPlan(user.id, z.uuid().parse(planId));
    revalidateStudy();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
