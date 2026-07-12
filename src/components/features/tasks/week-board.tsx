"use client";

import * as React from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

import { TaskItem } from "@/components/features/tasks/task-item";
import { fromDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { updateTaskAction } from "@/server/actions/tasks";
import type { TaskWithGoal } from "@/server/services/tasks";

function DraggableTask({
  task,
  goals,
}: {
  task: TaskWithGoal;
  goals: { id: string; title: string }[];
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn("relative", isDragging && "z-20 opacity-80")}
    >
      <div className="flex items-stretch gap-1">
        <button
          type="button"
          className="hidden cursor-grab touch-none items-center text-muted-foreground hover:text-foreground md:flex"
          aria-label={`Mover ${task.title} para outro dia`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <TaskItem task={task} goals={goals} />
        </div>
      </div>
    </div>
  );
}

function DayColumn({
  dayKey,
  tasks,
  goals,
}: {
  dayKey: string;
  tasks: TaskWithGoal[];
  goals: { id: string; title: string }[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dayKey });
  const date = fromDateKey(dayKey);
  const today = isToday(date);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-32 flex-col gap-2 rounded-2xl border p-2 transition-colors",
        isOver && "border-primary bg-primary/5",
        today && "border-primary/40",
      )}
    >
      <p
        className={cn(
          "px-1 text-xs font-semibold",
          today ? "text-primary" : "text-muted-foreground",
        )}
      >
        <span className="capitalize">{format(date, "EEE", { locale: ptBR })}</span>{" "}
        {format(date, "dd/MM")}
        {today && " · hoje"}
      </p>
      {tasks.map((task) => (
        <DraggableTask key={task.id} task={task} goals={goals} />
      ))}
      {tasks.length === 0 && (
        <p className="px-1 py-3 text-center text-xs text-muted-foreground/60">Livre</p>
      )}
    </div>
  );
}

export function WeekBoard({
  days,
  tasks: initial,
  goals,
}: {
  days: string[];
  tasks: TaskWithGoal[];
  goals: { id: string; title: string }[];
}) {
  const [tasks, setTasks] = React.useState(initial);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Re-sincroniza quando o servidor revalida (ajuste de estado durante o render).
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (prevInitial !== initial) {
    setPrevInitial(initial);
    setTasks(initial);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const targetDay = String(over.id);
    const task = tasks.find((item) => item.id === active.id);
    if (!task || task.date === targetDay) return;

    const previous = tasks;
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, date: targetDay } : item)),
    );
    const result = await updateTaskAction(task.id, { date: targetDay });
    if (!result.ok) {
      setTasks(previous);
      toast.error(result.error);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid gap-2 md:grid-cols-7">
        {days.map((dayKey) => (
          <DayColumn
            key={dayKey}
            dayKey={dayKey}
            tasks={tasks.filter((task) => task.date === dayKey)}
            goals={goals}
          />
        ))}
      </div>
    </DndContext>
  );
}
