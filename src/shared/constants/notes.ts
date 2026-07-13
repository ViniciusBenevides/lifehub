import type { noteCategoryValues } from "@/shared/schemas/notes";

export type NoteCategory = (typeof noteCategoryValues)[number];

export const NOTE_CATEGORY_META: Record<
  NoteCategory,
  { label: string; color: string; badge: string }
> = {
  estudo: {
    label: "Estudo",
    color: "#f97316",
    badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
  trabalho: {
    label: "Trabalho",
    color: "#3b82f6",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  pessoal: {
    label: "Pessoal",
    color: "#a855f7",
    badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
  ideias: {
    label: "Ideias",
    color: "#eab308",
    badge: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-500",
  },
  tarefas: {
    label: "Tarefas",
    color: "#10b981",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  reunioes: {
    label: "Reuniões",
    color: "#ec4899",
    badge: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  },
};
