"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/server/actions/goals";
import * as tasksService from "@/server/services/tasks";
import { requireUser } from "@/server/session";
import { createTaskSchema, updateTaskSchema } from "@/shared/schemas/tasks";

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

function revalidateTasks() {
  revalidatePath("/atividades");
  revalidatePath("/dashboard");
}

export async function createTaskAction(input: unknown): Promise<ActionResult<tasksService.Task>> {
  try {
    const user = await requireUser();
    const data = createTaskSchema.parse(input);
    const task = await tasksService.createTask(user.id, data);
    revalidateTasks();
    return { ok: true, data: task };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateTaskAction(
  taskId: string,
  input: unknown,
): Promise<ActionResult<tasksService.Task>> {
  try {
    const user = await requireUser();
    const data = updateTaskSchema.parse(input);
    const task = await tasksService.updateTask(user.id, z.uuid().parse(taskId), data);
    revalidateTasks();
    return { ok: true, data: task };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await tasksService.deleteTask(user.id, z.uuid().parse(taskId));
    revalidateTasks();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
