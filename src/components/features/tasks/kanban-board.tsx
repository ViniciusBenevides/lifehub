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
import { CircleDashed, CircleDot, CheckCircle2, GripVertical } from "lucide-react";
import { toast } from "sonner";

import { TaskItem } from "@/components/features/tasks/task-item";
import type { CategoryOption, SelectOption } from "@/components/features/tasks/task-form-dialog";
import { cn } from "@/lib/utils";
import { updateTaskAction } from "@/server/actions/tasks";
import type { TaskWithMeta } from "@/server/services/tasks";

type Status = "todo" | "in_progress" | "done";

const COLUMNS: Array<{ status: Status; label: string; icon: typeof CircleDashed; accent: string }> =
  [
    { status: "todo", label: "Pendente", icon: CircleDashed, accent: "text-sky-500" },
    { status: "in_progress", label: "Em progresso", icon: CircleDot, accent: "text-amber-500" },
    { status: "done", label: "Concluída", icon: CheckCircle2, accent: "text-emerald-500" },
  ];

function DraggableCard({
  task,
  goals,
  projects,
  categories,
}: {
  task: TaskWithMeta;
  goals: SelectOption[];
  projects: SelectOption[];
  categories: CategoryOption[];
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
          className="cursor-grab touch-none items-center text-muted-foreground hover:text-foreground"
          aria-label={`Mover ${task.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <TaskItem task={task} goals={goals} projects={projects} categories={categories} />
        </div>
      </div>
    </div>
  );
}

function Column({
  status,
  label,
  icon: Icon,
  accent,
  tasks,
  goals,
  projects,
  categories,
}: {
  status: Status;
  label: string;
  icon: typeof CircleDashed;
  accent: string;
  tasks: TaskWithMeta[];
  goals: SelectOption[];
  projects: SelectOption[];
  categories: CategoryOption[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-48 flex-col gap-2 rounded-2xl border bg-card/50 p-3 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <p className="flex items-center gap-2 px-1 text-sm font-semibold">
        <Icon className={cn("size-4", accent)} aria-hidden />
        {label}
        <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </p>
      {tasks.map((task) => (
        <DraggableCard
          key={task.id}
          task={task}
          goals={goals}
          projects={projects}
          categories={categories}
        />
      ))}
      {tasks.length === 0 && (
        <p className="px-1 py-6 text-center text-xs text-muted-foreground/60">
          Arraste tarefas para cá
        </p>
      )}
    </div>
  );
}

export function KanbanBoard({
  tasks: initial,
  goals,
  projects = [],
  categories = [],
}: {
  tasks: TaskWithMeta[];
  goals: SelectOption[];
  projects?: SelectOption[];
  categories?: CategoryOption[];
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
    const targetStatus = String(over.id) as Status;
    const task = tasks.find((item) => item.id === active.id);
    if (!task || task.status === targetStatus) return;

    const previous = tasks;
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status: targetStatus } : item)),
    );
    const result = await updateTaskAction(task.id, { status: targetStatus });
    if (!result.ok) {
      setTasks(previous);
      toast.error(result.error);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid gap-3 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <Column
            key={column.status}
            {...column}
            tasks={tasks.filter((task) => task.status === column.status)}
            goals={goals}
            projects={projects}
            categories={categories}
          />
        ))}
      </div>
    </DndContext>
  );
}
