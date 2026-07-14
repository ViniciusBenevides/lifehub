"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PomodoroPhase = "focus" | "short_break" | "long_break";

export type PomodoroSettings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Quantos focos até a pausa longa. */
  cyclesToLongBreak: number;
};

type PomodoroState = {
  settings: PomodoroSettings;
  phase: PomodoroPhase;
  /** Timestamp (ms) em que a fase atual termina; null quando pausado/parado. */
  endsAt: number | null;
  /** Milissegundos restantes quando pausado. */
  remainingMs: number;
  running: boolean;
  /** Focos concluídos no ciclo atual (zera após a pausa longa). */
  cycleCount: number;
  /** Tarefa opcional vinculada à sessão de foco. */
  taskId: string | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  /** Avança para a próxima fase (chamado quando o tempo zera ou ao pular). */
  advance: () => void;
  setPhase: (phase: PomodoroPhase) => void;
  setTaskId: (taskId: string | null) => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
};

export function phaseDurationMs(settings: PomodoroSettings, phase: PomodoroPhase): number {
  const minutes =
    phase === "focus"
      ? settings.focusMinutes
      : phase === "short_break"
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;
  return minutes * 60_000;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      settings: {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        cyclesToLongBreak: 4,
      },
      phase: "focus",
      endsAt: null,
      remainingMs: 25 * 60_000,
      running: false,
      cycleCount: 0,
      taskId: null,

      start: () => {
        const { remainingMs, settings, phase } = get();
        const duration = remainingMs > 0 ? remainingMs : phaseDurationMs(settings, phase);
        set({ running: true, endsAt: Date.now() + duration });
      },
      pause: () => {
        const { endsAt } = get();
        set({
          running: false,
          remainingMs: endsAt ? Math.max(endsAt - Date.now(), 0) : 0,
          endsAt: null,
        });
      },
      reset: () => {
        const { settings, phase } = get();
        set({ running: false, endsAt: null, remainingMs: phaseDurationMs(settings, phase) });
      },
      advance: () => {
        const { phase, cycleCount, settings } = get();
        if (phase === "focus") {
          const nextCount = cycleCount + 1;
          const nextPhase: PomodoroPhase =
            nextCount >= settings.cyclesToLongBreak ? "long_break" : "short_break";
          set({
            phase: nextPhase,
            cycleCount: nextCount >= settings.cyclesToLongBreak ? 0 : nextCount,
            running: false,
            endsAt: null,
            remainingMs: phaseDurationMs(settings, nextPhase),
          });
        } else {
          set({
            phase: "focus",
            running: false,
            endsAt: null,
            remainingMs: phaseDurationMs(settings, "focus"),
          });
        }
      },
      setPhase: (phase) => {
        const { settings } = get();
        set({ phase, running: false, endsAt: null, remainingMs: phaseDurationMs(settings, phase) });
      },
      setTaskId: (taskId) => set({ taskId }),
      updateSettings: (partial) => {
        const settings = { ...get().settings, ...partial };
        const { phase, running } = get();
        set({
          settings,
          // Se parado, realinha o tempo restante à nova duração da fase.
          ...(running ? {} : { remainingMs: phaseDurationMs(settings, phase), endsAt: null }),
        });
      },
    }),
    { name: "lifehub-pomodoro", skipHydration: true },
  ),
);
