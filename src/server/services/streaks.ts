import { addDays, differenceInCalendarDays, format, getDay, startOfWeek, subDays } from "date-fns";

/**
 * Cálculo de streaks respeitando a frequência do hábito.
 * Funções puras — sem banco, sem React — para serem testáveis em isolamento.
 */

export type HabitFrequency =
  | { type: "daily" }
  | { type: "weekly_days"; weeklyDays: number[] }
  | { type: "times_per_week"; timesPerWeek: number };

export type StreakResult = {
  current: number;
  best: number;
  /** "days" para hábitos diários/dias fixos; "weeks" para X vezes por semana. */
  unit: "days" | "weeks";
};

const KEY = "yyyy-MM-dd";

export function toKey(date: Date): string {
  return format(date, KEY);
}

function parseKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isScheduled(date: Date, frequency: HabitFrequency): boolean {
  if (frequency.type === "weekly_days") {
    return frequency.weeklyDays.includes(getDay(date));
  }
  return true;
}

/** Streak em dias (daily e weekly_days): dias agendados feitos em sequência. */
function dayStreaks(doneDates: Set<string>, frequency: HabitFrequency, today: Date): StreakResult {
  const sortedKeys = [...doneDates].sort();

  // Melhor streak: varre do primeiro log até hoje acumulando sequências.
  let best = 0;
  let run = 0;
  if (sortedKeys.length > 0) {
    const start = parseKey(sortedKeys[0]);
    const totalDays = differenceInCalendarDays(today, start);
    for (let offset = 0; offset <= totalDays; offset++) {
      const day = addDays(start, offset);
      if (!isScheduled(day, frequency)) continue;
      if (doneDates.has(toKey(day))) {
        run += 1;
        if (run > best) best = run;
      } else if (differenceInCalendarDays(today, day) > 0) {
        run = 0;
      }
      // O dia de hoje pendente não zera a sequência em andamento.
    }
  }

  // Streak atual: anda para trás a partir de hoje.
  let current = 0;
  let cursor = today;
  let isToday = true;
  // Limite de segurança de 5 anos para nunca laçar indefinidamente.
  for (let i = 0; i < 1830; i++) {
    if (isScheduled(cursor, frequency)) {
      if (doneDates.has(toKey(cursor))) {
        current += 1;
      } else if (isToday) {
        // Hoje ainda pendente não quebra a sequência.
      } else {
        break;
      }
    }
    isToday = false;
    cursor = subDays(cursor, 1);
    if (sortedKeys.length === 0 || toKey(cursor) < sortedKeys[0]) break;
  }

  return { current, best, unit: "days" };
}

/** Streak em semanas (times_per_week): semanas consecutivas batendo a cota. */
function weekStreaks(doneDates: Set<string>, timesPerWeek: number, today: Date): StreakResult {
  const countsByWeek = new Map<string, number>();
  for (const key of doneDates) {
    const weekKey = toKey(startOfWeek(parseKey(key), { weekStartsOn: 0 }));
    countsByWeek.set(weekKey, (countsByWeek.get(weekKey) ?? 0) + 1);
  }

  const weekKeys = [...countsByWeek.keys()].sort();
  const currentWeekKey = toKey(startOfWeek(today, { weekStartsOn: 0 }));

  let best = 0;
  let run = 0;
  if (weekKeys.length > 0) {
    let cursor = parseKey(weekKeys[0]);
    const end = startOfWeek(today, { weekStartsOn: 0 });
    while (differenceInCalendarDays(end, cursor) >= 0) {
      const key = toKey(cursor);
      const met = (countsByWeek.get(key) ?? 0) >= timesPerWeek;
      if (met) {
        run += 1;
        if (run > best) best = run;
      } else if (key !== currentWeekKey) {
        run = 0;
      }
      cursor = addDays(cursor, 7);
    }
  }

  let current = 0;
  let cursor = startOfWeek(today, { weekStartsOn: 0 });
  let isCurrentWeek = true;
  for (let i = 0; i < 270; i++) {
    const met = (countsByWeek.get(toKey(cursor)) ?? 0) >= timesPerWeek;
    if (met) {
      current += 1;
    } else if (!isCurrentWeek) {
      break;
    }
    // Semana corrente incompleta não quebra a sequência.
    isCurrentWeek = false;
    cursor = subDays(cursor, 7);
    if (weekKeys.length === 0 || toKey(cursor) < weekKeys[0]) break;
  }

  return { current, best, unit: "weeks" };
}

export function computeStreaks(
  doneDates: Set<string>,
  frequency: HabitFrequency,
  today: Date,
): StreakResult {
  if (frequency.type === "times_per_week") {
    return weekStreaks(doneDates, frequency.timesPerWeek, today);
  }
  return dayStreaks(doneDates, frequency, today);
}

/** Quantos dias agendados existem no intervalo [from, to] (inclusive). */
export function countScheduledDays(frequency: HabitFrequency, from: Date, to: Date): number {
  if (frequency.type === "times_per_week") {
    // Aproximação: cota semanal distribuída pelos dias do intervalo.
    const days = differenceInCalendarDays(to, from) + 1;
    return Math.max(1, Math.round((days / 7) * frequency.timesPerWeek));
  }
  let count = 0;
  for (let offset = 0; offset <= differenceInCalendarDays(to, from); offset++) {
    if (isScheduled(addDays(from, offset), frequency)) count += 1;
  }
  return count;
}

export function frequencyFromHabit(habit: {
  frequencyType: "daily" | "weekly_days" | "times_per_week";
  weeklyDays: number[] | null;
  timesPerWeek: number | null;
}): HabitFrequency {
  if (habit.frequencyType === "weekly_days") {
    return { type: "weekly_days", weeklyDays: habit.weeklyDays ?? [] };
  }
  if (habit.frequencyType === "times_per_week") {
    return { type: "times_per_week", timesPerWeek: habit.timesPerWeek ?? 1 };
  }
  return { type: "daily" };
}
