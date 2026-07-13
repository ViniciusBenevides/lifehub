"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { applyColorTheme, clearColorTheme } from "@/lib/color-theme";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

const emptySubscribe = () => () => {};

/** Seletor segmentado de tema (claro / escuro / sistema). */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // true após a hidratação — evita divergência entre servidor e cliente.
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="flex w-fit items-center gap-1 rounded-full border p-1"
    >
      {OPTIONS.map((option) => {
        const active = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.label}
            onClick={() => {
              setTheme(option.value);
              // Keep the color theme in sync with the quick light/dark toggle.
              if (option.value === "light") applyColorTheme("claro");
              else if (option.value === "dark") applyColorTheme("escuro");
              else clearColorTheme();
            }}
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors",
              "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active && "bg-secondary text-foreground",
            )}
          >
            <option.icon className="size-4" aria-hidden />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
