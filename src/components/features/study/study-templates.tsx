"use client";

import * as React from "react";
import { CalendarDays, ChevronRight, Info, Sparkles, Timer } from "lucide-react";
import { toast } from "sonner";

import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createStudyPlanAction } from "@/server/actions/study";
import { STUDY_TEMPLATES, type StudyTemplate } from "@/shared/constants/study-templates";

function formatWeekly(minutes: number): string {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h/semana`;
}

export function StudyTemplates() {
  const [selected, setSelected] = React.useState<StudyTemplate | null>(null);
  const [creating, setCreating] = React.useState(false);

  async function confirm() {
    if (!selected) return;
    setCreating(true);
    const result = await createStudyPlanAction({
      name: selected.name,
      description: selected.description,
      icon: selected.icon,
      durationDays: selected.durationDays,
      dailyGoalMinutes: selected.dailyGoalMinutes,
      startDate: toDateKey(new Date()),
      subjects: selected.subjects,
    });
    setCreating(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Plano "${selected.name}" criado! Bons estudos 📖`);
    setSelected(null);
  }

  return (
    <section aria-label="Templates prontos" className="space-y-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Templates Prontos</h2>
        <p className="text-sm text-muted-foreground">
          Selecione um plano que se encaixa no seu objetivo
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {STUDY_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => setSelected(template)}
            className={cn(
              "group flex items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition-all",
              "hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              template.accent.split(" ")[0],
            )}
          >
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-xl text-2xl",
                template.accent.split(" ").slice(1).join(" "),
              )}
              aria-hidden
            >
              {template.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{template.name}</span>
              <span
                className={cn(
                  "block text-sm font-medium",
                  template.accent.split(" ").slice(1, 3).join(" "),
                )}
              >
                {template.summary}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {template.description}
              </span>
            </span>
            <ChevronRight
              className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        ))}
      </div>

      <ResponsiveDialog
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Confirmar Plano"
      >
        {selected ? (
          <div className="space-y-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="size-4.5 text-amber-500" aria-hidden />
                {selected.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold">Este plano incluirá:</p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4 text-primary" aria-hidden />
                Duração: {selected.durationDays} dias
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Timer className="size-4 text-primary" aria-hidden />
                Meta diária: {selected.dailyGoalMinutes} minutos
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                📚 Matérias: {selected.subjects.length}
              </p>
              <ul className="space-y-1 pl-6 text-muted-foreground">
                {selected.subjects.map((subject) => (
                  <li key={subject.name} className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: subject.color }}
                      aria-hidden
                    />
                    {subject.name} ({formatWeekly(subject.minutesPerWeek)})
                  </li>
                ))}
              </ul>
            </div>

            <p className="flex items-start gap-2 rounded-xl bg-primary/10 p-3 text-xs text-primary">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Os horários de estudo ficam no cronograma. Acompanhe o progresso semanal por matéria
              na agenda de estudos.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Cancelar
              </Button>
              <Button onClick={confirm} disabled={creating}>
                {creating ? <Spinner /> : null}
                Criar Plano
              </Button>
            </div>
          </div>
        ) : null}
      </ResponsiveDialog>
    </section>
  );
}
