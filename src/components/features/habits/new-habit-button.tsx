"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { HabitFormDialog } from "@/components/features/habits/habit-form-dialog";
import { Button } from "@/components/ui/button";

export function NewHabitButton({ goals }: { goals: { id: string; title: string }[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <HabitFormDialog
      goals={goals}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <Plus aria-hidden /> Novo hábito
        </Button>
      }
    />
  );
}
