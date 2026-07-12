"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { TaskFormDialog } from "@/components/features/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";

export function NewTaskButton({
  goals,
  defaultDate,
}: {
  goals: { id: string; title: string }[];
  defaultDate?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <TaskFormDialog
      goals={goals}
      defaultDate={defaultDate}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <Plus aria-hidden /> Nova tarefa
        </Button>
      }
    />
  );
}
