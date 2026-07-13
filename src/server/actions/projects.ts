"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/server/actions/goals";
import * as projectsService from "@/server/services/projects";
import { requireUser } from "@/server/session";
import { createProjectSchema, updateProjectSchema } from "@/shared/schemas/projects";

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

function revalidateProjects() {
  revalidatePath("/projetos");
  revalidatePath("/atividades");
  revalidatePath("/inicio");
}

export async function createProjectAction(
  input: unknown,
): Promise<ActionResult<projectsService.Project>> {
  try {
    const user = await requireUser();
    const data = createProjectSchema.parse(input);
    const project = await projectsService.createProject(user.id, data);
    revalidateProjects();
    return { ok: true, data: project };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateProjectAction(
  projectId: string,
  input: unknown,
): Promise<ActionResult<projectsService.Project>> {
  try {
    const user = await requireUser();
    const data = updateProjectSchema.parse(input);
    const project = await projectsService.updateProject(user.id, z.uuid().parse(projectId), data);
    revalidateProjects();
    revalidatePath(`/projetos/${projectId}`);
    return { ok: true, data: project };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteProjectAction(projectId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await projectsService.deleteProject(user.id, z.uuid().parse(projectId));
    revalidateProjects();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
