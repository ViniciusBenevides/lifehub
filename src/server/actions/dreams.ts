"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/server/actions/goals";
import * as dreamsService from "@/server/services/dreams";
import { requireUser } from "@/server/session";
import {
  convertDreamSchema,
  createDreamSchema,
  reorderDreamsSchema,
  updateDreamSchema,
} from "@/shared/schemas/dreams";

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

function revalidateDreams() {
  revalidatePath("/sonhos");
  revalidatePath("/metas");
  revalidatePath("/dashboard");
}

export async function createDreamAction(
  input: unknown,
): Promise<ActionResult<dreamsService.Dream>> {
  try {
    const user = await requireUser();
    const data = createDreamSchema.parse(input);
    const dream = await dreamsService.createDream(user.id, data);
    revalidateDreams();
    return { ok: true, data: dream };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateDreamAction(
  dreamId: string,
  input: unknown,
): Promise<ActionResult<dreamsService.Dream>> {
  try {
    const user = await requireUser();
    const data = updateDreamSchema.parse(input);
    const dream = await dreamsService.updateDream(user.id, z.uuid().parse(dreamId), data);
    revalidateDreams();
    return { ok: true, data: dream };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteDreamAction(dreamId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await dreamsService.deleteDream(user.id, z.uuid().parse(dreamId));
    revalidateDreams();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function reorderDreamsAction(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const data = reorderDreamsSchema.parse(input);
    await dreamsService.reorderDreams(user.id, data.orderedIds);
    revalidateDreams();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function convertDreamAction(
  dreamId: string,
  input: unknown,
): Promise<ActionResult<dreamsService.ConvertResult>> {
  try {
    const user = await requireUser();
    const data = convertDreamSchema.parse(input);
    const result = await dreamsService.convertDreamToGoal(
      user.id,
      z.uuid().parse(dreamId),
      data.lifeAreaId,
    );
    revalidateDreams();
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
