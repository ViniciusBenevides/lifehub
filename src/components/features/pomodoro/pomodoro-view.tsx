"use client";

import * as React from "react";
import { Coffee, Flame, Pause, Play, RotateCcw, SkipForward, Timer } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { recordPomodoroAction } from "@/server/actions/pomodoro";
import { phaseDurationMs, usePomodoroStore, type PomodoroPhase } from "@/hooks/use-pomodoro-store";

const PHASES: Array<{ value: PomodoroPhase; label: string; icon: typeof Flame }> = [
  { value: "focus", label: "Foco", icon: Flame },
  { value: "short_break", label: "Pausa curta", icon: Coffee },
  { value: "long_break", label: "Pausa longa", icon: Coffee },
];

const DURATION_CHOICES = [5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 90];

function beep() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.85);
  } catch {
    // Sem áudio disponível — silêncio é aceitável.
  }
}

const emptySubscribe = () => () => {};

export function PomodoroView({
  todayStats,
  taskOptions,
}: {
  todayStats: { focusSessions: number; focusMinutes: number };
  taskOptions: Array<{ id: string; title: string }>;
}) {
  const store = usePomodoroStore();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [now, setNow] = React.useState(() => Date.now());
  const finishing = React.useRef(false);

  React.useEffect(() => {
    void usePomodoroStore.persist.rehydrate();
  }, []);

  React.useEffect(() => {
    if (!store.running) return;
    const handle = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(handle);
  }, [store.running]);

  const totalMs = phaseDurationMs(store.settings, store.phase);
  const leftMs =
    store.running && store.endsAt ? Math.max(store.endsAt - now, 0) : store.remainingMs;

  // Fase terminou: registra (se foco), toca o sino e avança.
  React.useEffect(() => {
    if (!store.running || leftMs > 0 || finishing.current) return;
    finishing.current = true;
    const finishedPhase = store.phase;
    const minutes = Math.round(phaseDurationMs(store.settings, finishedPhase) / 60_000);
    beep();
    store.advance();
    if (finishedPhase === "focus") {
      toast.success("Pomodoro concluído! 🎉 Hora da pausa.");
      void recordPomodoroAction({
        kind: "focus",
        durationMinutes: minutes,
        date: toDateKey(new Date()),
        taskId: store.taskId,
      }).then((result) => {
        finishing.current = false;
        if (!result.ok) toast.error(result.error);
      });
    } else {
      toast.info("Pausa encerrada. Bora focar!");
      finishing.current = false;
    }
  }, [leftMs, store]);

  const minutes = Math.floor(leftMs / 60_000);
  const seconds = Math.floor((leftMs % 60_000) / 1000);
  const progress = totalMs > 0 ? 1 - leftMs / totalMs : 0;
  const R = 120;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  if (!mounted) {
    return <div className="h-120 animate-pulse rounded-3xl border bg-card/40" aria-hidden />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div
        role="radiogroup"
        aria-label="Fase"
        className="mx-auto flex w-fit gap-1 rounded-full border p-1"
      >
        {PHASES.map((phase) => (
          <button
            key={phase.value}
            type="button"
            role="radio"
            aria-checked={store.phase === phase.value}
            onClick={() => store.setPhase(phase.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              store.phase === phase.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {phase.label}
          </button>
        ))}
      </div>

      <div className="relative mx-auto size-72">
        <svg viewBox="0 0 260 260" className="size-full -rotate-90">
          <circle
            cx="130"
            cy="130"
            r={R}
            fill="none"
            strokeWidth="10"
            className="stroke-secondary"
          />
          <circle
            cx="130"
            cy="130"
            r={R}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            className={cn(
              "transition-[stroke-dashoffset] duration-300",
              store.phase === "focus" ? "stroke-primary" : "stroke-emerald-500",
            )}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-mono text-6xl font-bold tabular-nums" aria-live="polite">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {store.phase === "focus" ? "Hora de focar" : "Hora de descansar"}
            </p>
            <div
              className="mt-3 flex items-center justify-center gap-1.5"
              aria-label={`${store.cycleCount} de ${store.settings.cyclesToLongBreak} focos no ciclo`}
            >
              {Array.from({ length: store.settings.cyclesToLongBreak }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "size-2 rounded-full",
                    index < store.cycleCount ? "bg-primary" : "bg-muted-foreground/25",
                  )}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={store.reset}
          aria-label="Reiniciar"
          className="grid size-12 place-items-center rounded-full border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <RotateCcw className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={store.running ? store.pause : store.start}
          aria-label={store.running ? "Pausar" : "Iniciar"}
          className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:brightness-110 active:scale-95"
        >
          {store.running ? (
            <Pause className="size-7" aria-hidden />
          ) : (
            <Play className="ml-0.5 size-7" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={store.advance}
          aria-label="Pular fase"
          className="grid size-12 place-items-center rounded-full border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <SkipForward className="size-5" aria-hidden />
        </button>
      </div>

      {taskOptions.length > 0 && store.phase === "focus" && (
        <div className="mx-auto max-w-xs">
          <Select
            value={store.taskId ?? "nenhuma"}
            onValueChange={(value) => store.setTaskId(value === "nenhuma" ? null : value)}
          >
            <SelectTrigger aria-label="Tarefa vinculada">
              <SelectValue placeholder="Vincular a uma tarefa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhuma">Sem tarefa vinculada</SelectItem>
              {taskOptions.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col items-center gap-1 p-4">
          <Timer className="size-5 text-primary" aria-hidden />
          <p className="text-2xl font-bold">{todayStats.focusSessions}</p>
          <p className="text-xs text-muted-foreground">Pomodoros hoje</p>
        </Card>
        <Card className="flex flex-col items-center gap-1 p-4">
          <Flame className="size-5 text-amber-500" aria-hidden />
          <p className="text-2xl font-bold">{todayStats.focusMinutes}</p>
          <p className="text-xs text-muted-foreground">Minutos focados</p>
        </Card>
      </div>

      <Card className="space-y-3 p-4">
        <p className="text-sm font-semibold">Configurações</p>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { key: "focusMinutes", label: "Foco" },
              { key: "shortBreakMinutes", label: "Pausa curta" },
              { key: "longBreakMinutes", label: "Pausa longa" },
            ] as const
          ).map((setting) => (
            <div key={setting.key} className="space-y-1">
              <p className="text-xs text-muted-foreground">{setting.label}</p>
              <Select
                value={String(store.settings[setting.key])}
                onValueChange={(value) => store.updateSettings({ [setting.key]: Number(value) })}
              >
                <SelectTrigger aria-label={`Minutos de ${setting.label}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_CHOICES.map((choice) => (
                    <SelectItem key={choice} value={String(choice)}>
                      {choice} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
