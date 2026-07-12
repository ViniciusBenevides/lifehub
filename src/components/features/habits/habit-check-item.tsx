"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Flame } from "lucide-react";
import { toast } from "sonner";

import { frequencyLabel, streakLabel } from "@/components/features/habits/frequency";
import { DynamicIcon } from "@/components/features/icon";
import { toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toggleHabitLogAction } from "@/server/actions/habits";
import type { HabitWithStatus } from "@/server/services/habits";

export function HabitCheckItem({ habit }: { habit: HabitWithStatus }) {
  const [done, setDone] = React.useState(habit.doneToday);
  const [pending, startTransition] = React.useTransition();

  // Re-sincroniza quando o servidor revalida (ajuste de estado durante o render).
  const [prevDoneToday, setPrevDoneToday] = React.useState(habit.doneToday);
  if (prevDoneToday !== habit.doneToday) {
    setPrevDoneToday(habit.doneToday);
    setDone(habit.doneToday);
  }

  function toggle(next: boolean, silent = false) {
    setDone(next);
    startTransition(async () => {
      const result = await toggleHabitLogAction(habit.id, {
        date: toDateKey(new Date()),
        done: next,
      });
      if (!result.ok) {
        setDone(!next);
        toast.error(result.error);
        return;
      }
      if (next && !silent) {
        toast.success(`${habit.name} feito!`, {
          action: { label: "Desfazer", onClick: () => toggle(false, true) },
        });
      }
    });
  }

  const color = habit.color ?? "#6366f1";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-card px-3 py-2.5 transition-colors",
        done && "bg-muted/50",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`Marcar ${habit.name} como ${done ? "não feito" : "feito"} hoje`}
        disabled={pending}
        onClick={() => toggle(!done)}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-90",
          done ? "scale-100 text-white" : "text-transparent hover:scale-105",
        )}
        style={{
          borderColor: color,
          backgroundColor: done ? color : "transparent",
        }}
      >
        <Check className="size-4.5" strokeWidth={3} aria-hidden />
      </button>

      <Link href={`/habitos/${habit.id}`} className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium",
            done && "text-muted-foreground line-through",
          )}
        >
          {habit.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">{frequencyLabel(habit)}</p>
      </Link>

      <div className="flex items-center gap-1.5">
        <DynamicIcon name={habit.icon} className="size-4 text-muted-foreground" />
        {habit.streak.current > 0 && (
          <span className="flex items-center gap-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
            <Flame className="size-3.5" aria-hidden />
            {streakLabel(habit.streak)}
          </span>
        )}
      </div>
    </div>
  );
}
