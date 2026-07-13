"use client";

import * as React from "react";
import { ArrowRight, Check, Clock, ListChecks, Repeat, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  TaskFormDialog,
  type CategoryOption,
  type SelectOption,
} from "@/components/features/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";
import { toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteTaskAction, updateTaskAction } from "@/server/actions/tasks";
import type { TaskWithMeta } from "@/server/services/tasks";

export const PRIORITY_STYLES = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-sky-500",
} as const;

export const PRIORITY_LABELS = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
} as const;

export function TaskItem({
  task,
  goals,
  projects = [],
  categories = [],
  showMoveToToday = false,
}: {
  task: TaskWithMeta;
  goals: SelectOption[];
  projects?: SelectOption[];
  categories?: CategoryOption[];
  showMoveToToday?: boolean;
}) {
  const [done, setDone] = React.useState(task.status === "done");
  const [editOpen, setEditOpen] = React.useState(false);

  // Re-sincroniza quando o servidor revalida (ajuste de estado durante o render).
  const [prevStatus, setPrevStatus] = React.useState(task.status);
  if (prevStatus !== task.status) {
    setPrevStatus(task.status);
    setDone(task.status === "done");
  }

  async function toggle(next: boolean) {
    setDone(next);
    const result = await updateTaskAction(task.id, { status: next ? "done" : "todo" });
    if (!result.ok) {
      setDone(!next);
      toast.error(result.error);
    }
  }

  async function moveToToday() {
    const result = await updateTaskAction(task.id, { date: toDateKey(new Date()) });
    if (!result.ok) toast.error(result.error);
    else toast.success("Movida para hoje.");
  }

  async function handleDelete() {
    const result = await deleteTaskAction(task.id);
    if (!result.ok) toast.error(result.error);
  }

  const hasMetaRow =
    task.goalTitle ||
    task.categoryName ||
    task.scheduledTime ||
    task.subtasksTotal > 0 ||
    (task.tags?.length ?? 0) > 0;

  return (
    <div className="group flex items-center gap-2.5 rounded-xl border bg-card px-2.5 py-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`Marcar "${task.title}" como ${done ? "pendente" : "feita"}`}
        onClick={() => toggle(!done)}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-90",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 text-transparent hover:border-primary",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      </button>

      <span
        className={cn("size-2 shrink-0 rounded-full", PRIORITY_STYLES[task.priority])}
        title={`Prioridade ${PRIORITY_LABELS[task.priority]}`}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Editar ${task.title}`}
      >
        <span
          className={cn("block truncate text-sm", done && "text-muted-foreground line-through")}
        >
          {task.title}
          {(task.recurrenceRule || task.recurringSourceId) && (
            <Repeat className="ml-1.5 inline size-3 text-muted-foreground" aria-hidden />
          )}
        </span>
        {hasMetaRow ? (
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            {task.scheduledTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" aria-hidden /> {task.scheduledTime.slice(0, 5)}
              </span>
            ) : null}
            {task.categoryName ? (
              <span
                className="inline-flex items-center gap-1"
                style={{ color: task.categoryColor ?? undefined }}
              >
                {task.categoryIcon} {task.categoryName}
              </span>
            ) : null}
            {task.subtasksTotal > 0 ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  task.subtasksDone === task.subtasksTotal && "text-emerald-500",
                )}
              >
                <ListChecks className="size-3" aria-hidden />
                {task.subtasksDone}/{task.subtasksTotal}
              </span>
            ) : null}
            {task.goalTitle ? (
              <span className="inline-flex min-w-0 items-center gap-1">
                <Target className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{task.goalTitle}</span>
              </span>
            ) : null}
            {task.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="text-primary">
                #{tag}
              </span>
            ))}
          </span>
        ) : null}
      </button>

      {showMoveToToday && (
        <Button variant="outline" size="sm" onClick={moveToToday}>
          <ArrowRight aria-hidden /> Hoje
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Excluir ${task.title}`}
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        onClick={handleDelete}
      >
        <Trash2 className="size-3.5" aria-hidden />
      </Button>

      <TaskFormDialog
        task={task}
        goals={goals}
        projects={projects}
        categories={categories}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
