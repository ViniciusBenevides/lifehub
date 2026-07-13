"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Columns3, Kanban, List } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  TASK_FILTERS,
  type TaskFilter,
  type TaskView,
} from "@/components/features/tasks/task-views";

const VIEWS = [
  { value: "lista", label: "Lista", icon: List },
  { value: "kanban", label: "Kanban", icon: Kanban },
  { value: "calendario", label: "Calendário", icon: Calendar },
  { value: "semana", label: "Semana", icon: Columns3 },
] as const satisfies ReadonlyArray<{ value: TaskView; label: string; icon: unknown }>;

export function ViewSwitcher({ view }: { view: TaskView }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setView(value: TaskView) {
    const params = new URLSearchParams(searchParams);
    params.set("vista", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div
      role="radiogroup"
      aria-label="Visualização"
      className="flex w-fit max-w-full [scrollbar-width:none] gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
    >
      {VIEWS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={view === option.value}
          onClick={() => setView(option.value)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            view === option.value
              ? "border-transparent bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
            option.value === "semana" && "hidden md:flex",
          )}
        >
          <option.icon className="size-4" aria-hidden />
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function FilterChips({ filter }: { filter: TaskFilter }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFilter(value: TaskFilter) {
    const params = new URLSearchParams(searchParams);
    params.set("filtro", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div
      role="radiogroup"
      aria-label="Filtro"
      className="flex w-fit max-w-full [scrollbar-width:none] gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
    >
      {TASK_FILTERS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={filter === option.value}
          onClick={() => setFilter(option.value)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            filter === option.value
              ? "border-transparent bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
