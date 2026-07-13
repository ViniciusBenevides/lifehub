"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import {
  TaskFormDialog,
  type CategoryOption,
  type SelectOption,
} from "@/components/features/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";

export function NewTaskButton({
  goals,
  projects = [],
  categories = [],
  defaultDate,
  defaultProjectId,
  size = "default",
}: {
  goals: SelectOption[];
  projects?: SelectOption[];
  categories?: CategoryOption[];
  defaultDate?: string;
  defaultProjectId?: string;
  size?: "default" | "sm";
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <TaskFormDialog
      goals={goals}
      projects={projects}
      categories={categories}
      defaultDate={defaultDate}
      defaultProjectId={defaultProjectId}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size={size}>
          <Plus aria-hidden /> Nova Tarefa
        </Button>
      }
    />
  );
}

/** FAB mobile no padrão do app de referência (flutua acima das abas). */
export function NewTaskFab({
  goals,
  projects = [],
  categories = [],
  defaultDate,
}: {
  goals: SelectOption[];
  projects?: SelectOption[];
  categories?: CategoryOption[];
  defaultDate?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <TaskFormDialog
      goals={goals}
      projects={projects}
      categories={categories}
      defaultDate={defaultDate}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          className="fixed right-4 bottom-24 z-30 flex items-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-95 md:hidden"
        >
          <Plus className="size-5" aria-hidden /> Nova Tarefa
        </button>
      }
    />
  );
}
