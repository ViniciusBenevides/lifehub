"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const VIEWS = [
  { value: "hoje", label: "Hoje" },
  { value: "amanha", label: "Amanhã" },
  { value: "semana", label: "Semana" },
] as const;

export type TaskView = (typeof VIEWS)[number]["value"];

export function ViewSwitcher({ view }: { view: TaskView }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setView(value: TaskView) {
    const params = new URLSearchParams(searchParams);
    params.set("visao", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div role="radiogroup" aria-label="Visão" className="flex w-fit gap-1 rounded-full border p-1">
      {VIEWS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={view === option.value}
          onClick={() => setView(option.value)}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            view === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
