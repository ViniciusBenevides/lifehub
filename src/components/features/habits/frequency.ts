import type { Habit } from "@/server/services/habits";

export const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"] as const;
export const WEEKDAY_LABELS_FULL = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
] as const;

export const TIME_OF_DAY_LABELS: Record<Habit["timeOfDay"], string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
  anytime: "Qualquer hora",
};

export const HABIT_COLOR_OPTIONS = [
  "#10b981",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#f59e0b",
] as const;

export function frequencyLabel(habit: {
  frequencyType: Habit["frequencyType"];
  weeklyDays: number[] | null;
  timesPerWeek: number | null;
}): string {
  if (habit.frequencyType === "daily") return "Todos os dias";
  if (habit.frequencyType === "times_per_week") {
    const times = habit.timesPerWeek ?? 1;
    return `${times}x por semana`;
  }
  const days = [...(habit.weeklyDays ?? [])].sort();
  return days.map((day) => WEEKDAY_LABELS[day]).join(", ");
}

export function streakLabel(streak: { current: number; unit: "days" | "weeks" }): string {
  if (streak.unit === "weeks") {
    return `${streak.current} ${streak.current === 1 ? "semana" : "semanas"}`;
  }
  return `${streak.current} ${streak.current === 1 ? "dia" : "dias"}`;
}
