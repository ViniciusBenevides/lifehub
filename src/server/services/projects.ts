import { and, asc, count, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/server/db";
import { projects, tasks } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type { CreateProjectInput, UpdateProjectInput } from "@/shared/schemas/projects";

export type Project = typeof projects.$inferSelect;

export type ProjectWithProgress = Project & {
  tasksTotal: number;
  tasksDone: number;
  /** 0–100, derivado das tarefas concluídas. */
  progressPercent: number;
};

export async function listProjects(
  userId: string,
  options: { status?: Project["status"] } = {},
): Promise<ProjectWithProgress[]> {
  const conditions = [eq(projects.userId, userId)];
  if (options.status) conditions.push(eq(projects.status, options.status));

  const rows = await getDb()
    .select({
      project: projects,
      tasksTotal: count(tasks.id),
      tasksDone: sql<number>`count(${tasks.id}) filter (where ${tasks.status} = 'done')`.mapWith(
        Number,
      ),
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .where(and(...conditions))
    .groupBy(projects.id)
    .orderBy(asc(projects.status), desc(projects.createdAt));

  return rows.map(({ project, tasksTotal, tasksDone }) => ({
    ...project,
    tasksTotal,
    tasksDone,
    progressPercent: tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0,
  }));
}

export async function getProject(userId: string, projectId: string): Promise<ProjectWithProgress> {
  const [project] = await listProjectsById(userId, projectId);
  if (!project) throw new NotFoundError("Projeto não encontrado");
  return project;
}

async function listProjectsById(userId: string, projectId: string): Promise<ProjectWithProgress[]> {
  const rows = await getDb()
    .select({
      project: projects,
      tasksTotal: count(tasks.id),
      tasksDone: sql<number>`count(${tasks.id}) filter (where ${tasks.status} = 'done')`.mapWith(
        Number,
      ),
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .groupBy(projects.id)
    .limit(1);

  return rows.map(({ project, tasksTotal, tasksDone }) => ({
    ...project,
    tasksTotal,
    tasksDone,
    progressPercent: tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0,
  }));
}

export async function createProject(userId: string, input: CreateProjectInput): Promise<Project> {
  const [project] = await getDb()
    .insert(projects)
    .values({
      userId,
      name: input.name,
      description: input.description ?? null,
      color: input.color,
      deadline: input.deadline ?? null,
    })
    .returning();
  return project;
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  await getProject(userId, projectId);
  const [updated] = await getDb()
    .update(projects)
    .set(input)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .returning();
  return updated;
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  await getProject(userId, projectId);
  await getDb()
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
}
