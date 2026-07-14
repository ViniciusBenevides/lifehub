"use client";

import * as React from "react";
import { CalendarCheck, MoreVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteStudyPlanAction, logStudySessionAction } from "@/server/actions/study";
import type { StudyPlanOverview } from "@/server/services/study";

function LogSessionDialog({
  plan,
  open,
  onOpenChange,
}: {
  plan: StudyPlanOverview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [subjectId, setSubjectId] = React.useState<string>(plan.subjects[0]?.id ?? "nenhuma");
  const [minutes, setMinutes] = React.useState("30");
  const [date, setDate] = React.useState(toDateKey(new Date()));
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const result = await logStudySessionAction({
      planId: plan.id,
      subjectId: subjectId === "nenhuma" ? null : subjectId,
      date,
      minutes: Number(minutes),
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Sessão registrada! 📖");
    onOpenChange(false);
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Registrar sessão de estudo">
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel>Matéria</FieldLabel>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger aria-label="Matéria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Geral</SelectItem>
                {plan.subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor={`session-minutes-${plan.id}`}>Minutos</FieldLabel>
              <Input
                id={`session-minutes-${plan.id}`}
                type="number"
                min={1}
                max={960}
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`session-date-${plan.id}`}>Data</FieldLabel>
              <Input
                id={`session-date-${plan.id}`}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
          </div>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : null}
            Registrar
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export function StudyPlanCard({ plan }: { plan: StudyPlanOverview }) {
  const [logOpen, setLogOpen] = React.useState(false);
  const todayPercent = Math.min(Math.round((plan.todayMinutes / plan.dailyGoalMinutes) * 100), 100);
  const totalHours = Math.floor(plan.totalMinutes / 60);

  async function handleDelete() {
    const result = await deleteStudyPlanAction(plan.id);
    if (!result.ok) toast.error(result.error);
    else toast.success("Plano excluído.");
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-2xl">
            {plan.icon}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-bold">{plan.name}</h3>
            <p className="text-xs text-muted-foreground">
              Dia {plan.dayNumber} de {plan.durationDays} · {totalHours}h estudadas no total
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Opções de ${plan.name}`}>
              <MoreVertical className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
              <Trash2 aria-hidden /> Excluir plano
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <CalendarCheck className="size-3.5 text-primary" aria-hidden />
            Meta de hoje
          </span>
          <span
            className={cn(
              "font-semibold",
              todayPercent >= 100 ? "text-emerald-500" : "text-muted-foreground",
            )}
          >
            {plan.todayMinutes}/{plan.dailyGoalMinutes} min
          </span>
        </div>
        <Progress value={todayPercent} aria-label="Progresso da meta diária" />
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Agenda da semana
        </p>
        {plan.subjects.map((subject) => (
          <div key={subject.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: subject.color }}
                  aria-hidden
                />
                <span className="truncate">{subject.name}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {subject.weekMinutes}/{subject.minutesPerWeek} min
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${subject.weekPercent}%`, backgroundColor: subject.color }}
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>

      <Button onClick={() => setLogOpen(true)} className="w-full">
        <Plus aria-hidden /> Registrar sessão
      </Button>

      <LogSessionDialog plan={plan} open={logOpen} onOpenChange={setLogOpen} />
    </Card>
  );
}
