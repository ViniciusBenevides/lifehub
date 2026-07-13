"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/session";
import * as goalsService from "@/server/services/goals";
import {
  createGoalSchema,
  createMilestoneSchema,
  reorderMilestonesSchema,
  updateGoalProgressSchema,
  updateGoalSchema,
  updateMilestoneSchema,
} from "@/shared/schemas/goals";
import { z } from "zod";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

function revalidateGoals(goalId?: string) {
  revalidatePath("/metas");
  revalidatePath("/dashboard");
  revalidatePath("/inicio");
  if (goalId) revalidatePath(`/metas/${goalId}`);
}

export async function createGoalAction(input: unknown): Promise<ActionResult<goalsService.Goal>> {
  try {
    const user = await requireUser();
    const data = createGoalSchema.parse(input);
    const goal = await goalsService.createGoal(user.id, data);
    revalidateGoals();
    return { ok: true, data: goal };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateGoalAction(
  goalId: string,
  input: unknown,
): Promise<ActionResult<goalsService.Goal>> {
  try {
    const user = await requireUser();
    const data = updateGoalSchema.parse(input);
    const goal = await goalsService.updateGoal(user.id, z.uuid().parse(goalId), data);
    revalidateGoals(goalId);
    return { ok: true, data: goal };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateGoalProgressAction(
  goalId: string,
  input: unknown,
): Promise<ActionResult<goalsService.Goal>> {
  try {
    const user = await requireUser();
    const data = updateGoalProgressSchema.parse(input);
    const goal = await goalsService.updateGoalProgress(
      user.id,
      z.uuid().parse(goalId),
      data.currentValue,
    );
    revalidateGoals(goalId);
    return { ok: true, data: goal };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function completeGoalAction(goalId: string): Promise<ActionResult<goalsService.Goal>> {
  try {
    const user = await requireUser();
    const goal = await goalsService.completeGoal(user.id, z.uuid().parse(goalId));
    revalidateGoals(goalId);
    return { ok: true, data: goal };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteGoalAction(goalId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await goalsService.deleteGoal(user.id, z.uuid().parse(goalId));
    revalidateGoals();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function addMilestoneAction(
  goalId: string,
  input: unknown,
): Promise<ActionResult<goalsService.GoalMilestone>> {
  try {
    const user = await requireUser();
    const data = createMilestoneSchema.parse(input);
    const milestone = await goalsService.addMilestone(user.id, z.uuid().parse(goalId), data);
    revalidateGoals(goalId);
    return { ok: true, data: milestone };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateMilestoneAction(
  goalId: string,
  milestoneId: string,
  input: unknown,
): Promise<ActionResult<goalsService.GoalMilestone>> {
  try {
    const user = await requireUser();
    const data = updateMilestoneSchema.parse(input);
    const milestone = await goalsService.updateMilestone(
      user.id,
      z.uuid().parse(milestoneId),
      data,
    );
    revalidateGoals(goalId);
    return { ok: true, data: milestone };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteMilestoneAction(
  goalId: string,
  milestoneId: string,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await goalsService.deleteMilestone(user.id, z.uuid().parse(milestoneId));
    revalidateGoals(goalId);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function reorderMilestonesAction(
  goalId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const data = reorderMilestonesSchema.parse(input);
    await goalsService.reorderMilestones(user.id, z.uuid().parse(goalId), data.orderedIds);
    revalidateGoals(goalId);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
