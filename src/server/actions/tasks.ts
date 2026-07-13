"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/server/actions/goals";
import * as tasksService from "@/server/services/tasks";
import { requireUser } from "@/server/session";
import {
  createSubtaskSchema,
  createTaskCategorySchema,
  createTaskSchema,
  updateSubtaskSchema,
  updateTaskSchema,
} from "@/shared/schemas/tasks";

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
  revalidatePath("/inicio");
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

export async function listSubtasksAction(
  taskId: string,
): Promise<ActionResult<tasksService.Subtask[]>> {
  try {
    const user = await requireUser();
    const subtasks = await tasksService.listSubtasks(user.id, z.uuid().parse(taskId));
    return { ok: true, data: subtasks };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function createSubtaskAction(
  taskId: string,
  input: unknown,
): Promise<ActionResult<tasksService.Subtask>> {
  try {
    const user = await requireUser();
    const data = createSubtaskSchema.parse(input);
    const subtask = await tasksService.createSubtask(user.id, z.uuid().parse(taskId), data);
    revalidateTasks();
    return { ok: true, data: subtask };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateSubtaskAction(
  subtaskId: string,
  input: unknown,
): Promise<ActionResult<tasksService.Subtask>> {
  try {
    const user = await requireUser();
    const data = updateSubtaskSchema.parse(input);
    const subtask = await tasksService.updateSubtask(user.id, z.uuid().parse(subtaskId), data);
    revalidateTasks();
    return { ok: true, data: subtask };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteSubtaskAction(subtaskId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await tasksService.deleteSubtask(user.id, z.uuid().parse(subtaskId));
    revalidateTasks();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function createTaskCategoryAction(
  input: unknown,
): Promise<ActionResult<tasksService.TaskCategory>> {
  try {
    const user = await requireUser();
    const data = createTaskCategorySchema.parse(input);
    const category = await tasksService.createTaskCategory(user.id, data);
    revalidateTasks();
    return { ok: true, data: category };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
