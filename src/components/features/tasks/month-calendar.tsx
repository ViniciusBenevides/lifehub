"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addMonths, format, getDay, getDaysInMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";

import { NewTaskButton } from "@/components/features/tasks/new-task-button";
import { TaskItem } from "@/components/features/tasks/task-item";
import type { CategoryOption, SelectOption } from "@/components/features/tasks/task-form-dialog";
import { Card } from "@/components/ui/card";
import { fromDateKey, toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TaskWithMeta } from "@/server/services/tasks";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function MonthCalendar({
  monthKey,
  tasks,
  goals,
  projects = [],
  categories = [],
}: {
  /** Mês exibido no formato YYYY-MM. */
  monthKey: string;
  tasks: TaskWithMeta[];
  goals: SelectOption[];
  projects?: SelectOption[];
  categories?: CategoryOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const monthStart = fromDateKey(`${monthKey}-01`);
  const today = new Date();
  const [selected, setSelected] = React.useState<string>(() =>
    format(today, "yyyy-MM") === monthKey ? toDateKey(today) : `${monthKey}-01`,
  );

  // Se o mês mudar via navegação, realinha o dia selecionado (durante o render).
  const [prevMonth, setPrevMonth] = React.useState(monthKey);
  if (prevMonth !== monthKey) {
    setPrevMonth(monthKey);
    setSelected(format(today, "yyyy-MM") === monthKey ? toDateKey(today) : `${monthKey}-01`);
  }

  function navigate(offset: number) {
    const next = format(addMonths(monthStart, offset), "yyyy-MM");
    const params = new URLSearchParams(searchParams);
    params.set("mes", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const daysInMonth = getDaysInMonth(monthStart);
  const firstWeekday = getDay(monthStart);
  const tasksByDay = new Map<string, TaskWithMeta[]>();
  for (const task of tasks) {
    const list = tasksByDay.get(task.date) ?? [];
    list.push(task);
    tasksByDay.set(task.date, list);
  }

  const selectedTasks = tasksByDay.get(selected) ?? [];
  const selectedDate = fromDateKey(selected);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Mês anterior"
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="size-4.5" aria-hidden />
          </button>
          <p className="text-sm font-semibold capitalize">
            {format(monthStart, "MMMM yyyy", { locale: ptBR })}
          </p>
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Próximo mês"
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="size-4.5" aria-hidden />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday} className="py-1 text-xs font-medium text-muted-foreground">
              {weekday}
            </span>
          ))}
          {Array.from({ length: firstWeekday }).map((_, index) => (
            <span key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayKey = `${monthKey}-${String(day).padStart(2, "0")}`;
            const dayTasks = tasksByDay.get(dayKey) ?? [];
            const pending = dayTasks.filter((task) => task.status !== "done").length;
            const isSelected = selected === dayKey;
            const isTodayCell = isSameDay(fromDateKey(dayKey), today);
            return (
              <button
                key={dayKey}
                type="button"
                onClick={() => setSelected(dayKey)}
                aria-label={`Dia ${day}${dayTasks.length > 0 ? `, ${dayTasks.length} tarefas` : ""}`}
                aria-pressed={isSelected}
                className={cn(
                  "relative mx-auto grid size-9 place-items-center rounded-xl text-sm transition-colors md:size-10",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isSelected
                    ? "border border-primary bg-primary/10 font-semibold text-primary"
                    : isTodayCell
                      ? "font-semibold text-primary hover:bg-accent"
                      : "hover:bg-accent",
                )}
              >
                {day}
                {dayTasks.length > 0 && (
                  <span
                    className={cn(
                      "absolute bottom-1 size-1.5 rounded-full",
                      pending > 0 ? "bg-primary" : "bg-emerald-500",
                    )}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <CalendarCheck className="size-4 text-primary" aria-hidden />
            {format(selectedDate, "d 'de' MMMM yyyy", { locale: ptBR })}
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {selectedTasks.length} tarefa{selectedTasks.length === 1 ? "" : "s"}
            </span>
          </p>
          <NewTaskButton
            goals={goals}
            projects={projects}
            categories={categories}
            defaultDate={selected}
            size="sm"
          />
        </div>
        {selectedTasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma tarefa neste dia.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                goals={goals}
                projects={projects}
                categories={categories}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
