"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, MoreVertical, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProjectFormDialog } from "@/components/features/projects/project-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { formatDateShort, fromDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteProjectAction, updateProjectAction } from "@/server/actions/projects";
import type { ProjectWithProgress } from "@/server/services/projects";

export function ProjectCard({ project }: { project: ProjectWithProgress }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const completed = project.status === "completed";

  async function toggleCompleted() {
    const result = await updateProjectAction(project.id, {
      status: completed ? "active" : "completed",
    });
    if (!result.ok) toast.error(result.error);
    else toast.success(completed ? "Projeto reativado." : "Projeto concluído! 🎉");
  }

  async function handleDelete() {
    const result = await deleteProjectAction(project.id);
    if (!result.ok) toast.error(result.error);
    else toast.success("Projeto excluído.");
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card transition-all hover:border-primary/30",
        completed && "opacity-70",
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: project.color }}
        aria-hidden
      />
      <div className="space-y-3 p-4 pl-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/projetos/${project.id}`}
            className="min-w-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <h3 className={cn("truncate font-semibold", completed && "line-through")}>
              {project.name}
            </h3>
            {project.description ? (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
            ) : null}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Opções de ${project.name}`}>
                <MoreVertical className="size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil aria-hidden /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={toggleCompleted}>
                {completed ? (
                  <>
                    <RotateCcw aria-hidden /> Reativar
                  </>
                ) : (
                  <>
                    <CheckCircle2 aria-hidden /> Concluir
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
                <Trash2 aria-hidden /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {project.tasksDone}/{project.tasksTotal} tarefa{project.tasksTotal === 1 ? "" : "s"}
            </span>
            <span className="font-medium" style={{ color: project.color }}>
              {project.progressPercent}%
            </span>
          </div>
          <Progress
            value={project.progressPercent}
            aria-label={`Progresso de ${project.name}`}
            style={{ "--progress-color": project.color } as React.CSSProperties}
            className="[&>[data-slot=progress-indicator]]:bg-(--progress-color)"
          />
        </div>

        {project.deadline ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden />
            Prazo: {formatDateShort(fromDateKey(project.deadline))}
          </p>
        ) : null}
      </div>

      <ProjectFormDialog project={project} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
