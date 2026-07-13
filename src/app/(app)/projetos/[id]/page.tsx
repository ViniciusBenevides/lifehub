import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { z } from "zod";

import { NewTaskButton } from "@/components/features/tasks/new-task-button";
import { TaskItem } from "@/components/features/tasks/task-item";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDateShort, fromDateKey, toDateKey } from "@/lib/format";
import { NotFoundError } from "@/server/services/errors";
import { listGoals } from "@/server/services/goals";
import { getProject } from "@/server/services/projects";
import { listAllTasks, listTaskCategories } from "@/server/services/tasks";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Projeto",
};

export default async function ProjetoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const parsedId = z.uuid().safeParse(id);
  if (!parsedId.success) notFound();

  let project;
  try {
    project = await getProject(user.id, parsedId.data);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const [tasks, activeGoals, categories] = await Promise.all([
    listAllTasks(user.id, { projectId: project.id }),
    listGoals(user.id, { status: "active" }),
    listTaskCategories(user.id),
  ]);
  const pending = tasks.filter((task) => task.status !== "done");
  const done = tasks.filter((task) => task.status === "done");
  const sharedProps = {
    goals: activeGoals.map((goal) => ({ id: goal.id, title: goal.title })),
    projects: [{ id: project.id, title: project.name }],
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
    })),
  };

  return (
    <div className="space-y-6">
      <Link
        href="/projetos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Projetos
      </Link>

      <Card className="relative overflow-hidden p-5">
        <span
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ backgroundColor: project.color }}
          aria-hidden
        />
        <div className="flex flex-wrap items-start justify-between gap-4 pl-2">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            {project.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
            ) : null}
            {project.deadline ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden />
                Prazo: {formatDateShort(fromDateKey(project.deadline))}
              </p>
            ) : null}
          </div>
          <div className="w-full max-w-45 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {project.tasksDone}/{project.tasksTotal} tarefas
              </span>
              <span className="font-semibold" style={{ color: project.color }}>
                {project.progressPercent}%
              </span>
            </div>
            <Progress value={project.progressPercent} aria-label="Progresso do projeto" />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
          Tarefas do projeto
        </h2>
        <NewTaskButton
          {...sharedProps}
          defaultDate={toDateKey(new Date())}
          defaultProjectId={project.id}
          size="sm"
        />
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Nenhuma tarefa neste projeto ainda.
        </p>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div className="space-y-2">
              {pending.map((task) => (
                <TaskItem key={task.id} task={task} {...sharedProps} />
              ))}
            </div>
          )}
          {done.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Concluídas ({done.length})
              </summary>
              <div className="mt-2 space-y-2">
                {done.map((task) => (
                  <TaskItem key={task.id} task={task} {...sharedProps} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
