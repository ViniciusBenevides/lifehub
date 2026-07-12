"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  HABIT_COLOR_OPTIONS,
  TIME_OF_DAY_LABELS,
  WEEKDAY_LABELS,
} from "@/components/features/habits/frequency";
import { DynamicIcon, HABIT_ICON_OPTIONS } from "@/components/features/icon";
import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { createHabitAction, updateHabitAction } from "@/server/actions/habits";
import type { Habit } from "@/server/services/habits";
import { createHabitSchema, type CreateHabitInput } from "@/shared/schemas/habits";
import { timeOfDayValues } from "@/shared/schemas/habits";

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Todos os dias" },
  { value: "weekly_days", label: "Dias da semana" },
  { value: "times_per_week", label: "X vezes/semana" },
] as const;

type HabitFormDialogProps = {
  goals: { id: string; title: string }[];
  habit?: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function HabitFormDialog({
  goals,
  habit,
  open,
  onOpenChange,
  trigger,
}: HabitFormDialogProps) {
  const isEdit = Boolean(habit);

  const form = useForm<CreateHabitInput>({
    resolver: zodResolver(createHabitSchema),
    values: {
      name: habit?.name ?? "",
      icon: habit?.icon ?? null,
      color: habit?.color ?? HABIT_COLOR_OPTIONS[2],
      frequencyType: habit?.frequencyType ?? "daily",
      weeklyDays: habit?.weeklyDays ?? [],
      timesPerWeek: habit?.timesPerWeek ?? 3,
      timeOfDay: habit?.timeOfDay ?? "anytime",
      goalId: habit?.goalId ?? null,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const frequencyType = form.watch("frequencyType");
  const weeklyDays = form.watch("weeklyDays") ?? [];
  const icon = form.watch("icon");
  const color = form.watch("color");
  const timeOfDay = form.watch("timeOfDay");

  function toggleWeekday(day: number) {
    const next = weeklyDays.includes(day)
      ? weeklyDays.filter((d) => d !== day)
      : [...weeklyDays, day];
    form.setValue("weeklyDays", next, { shouldValidate: true });
  }

  async function onSubmit(values: CreateHabitInput) {
    const result = isEdit
      ? await updateHabitAction(habit!.id, values)
      : await createHabitAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Hábito atualizado." : "Hábito criado!");
    onOpenChange(false);
    if (!isEdit) form.reset();
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar hábito" : "Novo hábito"}
      trigger={trigger}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="habit-name">Nome</FieldLabel>
            <Input
              id="habit-name"
              placeholder="Ex.: Beber 2L de água"
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel>Ícone e cor</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_ICON_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={option}
                  aria-pressed={icon === option}
                  onClick={() => form.setValue("icon", icon === option ? null : option)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent",
                    icon === option && "border-primary bg-primary/10",
                  )}
                >
                  <DynamicIcon name={option} className="size-4" />
                </button>
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {HABIT_COLOR_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Cor ${option}`}
                  aria-pressed={color === option}
                  onClick={() => form.setValue("color", option)}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform",
                    color === option ? "scale-110 border-foreground" : "border-transparent",
                  )}
                  style={{ backgroundColor: option }}
                />
              ))}
            </div>
          </Field>

          <Field>
            <FieldLabel>Frequência</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    form.setValue("frequencyType", option.value, { shouldValidate: true })
                  }
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                    frequencyType === option.value
                      ? "border-primary bg-primary/10"
                      : "hover:bg-accent",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Field>

          {frequencyType === "weekly_days" && (
            <Field>
              <FieldLabel>Quais dias?</FieldLabel>
              <div className="flex gap-1.5">
                {WEEKDAY_LABELS.map((label, day) => (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={weeklyDays.includes(day)}
                    onClick={() => toggleWeekday(day)}
                    className={cn(
                      "size-9 rounded-full border text-xs font-medium transition-colors",
                      weeklyDays.includes(day)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-accent",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <FieldError errors={[errors.weeklyDays]} />
            </Field>
          )}

          {frequencyType === "times_per_week" && (
            <Field>
              <FieldLabel htmlFor="habit-times">Vezes por semana</FieldLabel>
              <Input
                id="habit-times"
                type="number"
                min={1}
                max={7}
                className="w-24"
                aria-invalid={Boolean(errors.timesPerWeek)}
                {...form.register("timesPerWeek", {
                  setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
                })}
              />
              <FieldError errors={[errors.timesPerWeek]} />
            </Field>
          )}

          <Field>
            <FieldLabel>Período do dia</FieldLabel>
            <div className="grid grid-cols-4 gap-2">
              {timeOfDayValues.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => form.setValue("timeOfDay", value)}
                  className={cn(
                    "rounded-xl border px-1 py-2 text-xs font-medium transition-colors",
                    timeOfDay === value ? "border-primary bg-primary/10" : "hover:bg-accent",
                  )}
                >
                  {TIME_OF_DAY_LABELS[value]}
                </button>
              ))}
            </div>
          </Field>

          {goals.length > 0 && (
            <Field>
              <FieldLabel>Vincular a uma meta (opcional)</FieldLabel>
              <Select
                value={form.watch("goalId") ?? "nenhuma"}
                onValueChange={(value) =>
                  form.setValue("goalId", value === "nenhuma" ? null : value)
                }
              >
                <SelectTrigger aria-label="Meta vinculada">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Nenhuma</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null}
            {isEdit ? "Salvar alterações" : "Criar hábito"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}
