"use client";

import * as React from "react";
import { ArrowRight, Check, Repeat, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { TaskFormDialog } from "@/components/features/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";
import { toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteTaskAction, updateTaskAction } from "@/server/actions/tasks";
import type { TaskWithGoal } from "@/server/services/tasks";

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
  showMoveToToday = false,
}: {
  task: TaskWithGoal;
  goals: { id: string; title: string }[];
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
        {task.goalTitle ? (
          <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Target className="size-3" aria-hidden /> {task.goalTitle}
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

      <TaskFormDialog task={task} goals={goals} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
