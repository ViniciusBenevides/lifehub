"use client";

import * as React from "react";
import { toast } from "sonner";

import { PRIORITY_LABELS } from "@/components/features/tasks/task-item";
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
import { Textarea } from "@/components/ui/textarea";
import { toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createTaskAction, updateTaskAction } from "@/server/actions/tasks";
import type { TaskWithGoal } from "@/server/services/tasks";
import { createTaskSchema, taskPriorityValues } from "@/shared/schemas/tasks";

const RECURRENCE_OPTIONS = [
  { value: "nenhuma", label: "Não repete" },
  { value: "daily", label: "Todos os dias" },
  { value: "weekly", label: "Toda semana" },
  { value: "monthly", label: "Todo mês" },
] as const;

type TaskFormDialogProps = {
  task?: TaskWithGoal;
  goals: { id: string; title: string }[];
  defaultDate?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function TaskFormDialog({
  task,
  goals,
  defaultDate,
  open,
  onOpenChange,
  trigger,
}: TaskFormDialogProps) {
  const isEdit = Boolean(task);
  const [title, setTitle] = React.useState(task?.title ?? "");
  const [notes, setNotes] = React.useState(task?.notes ?? "");
  const [date, setDate] = React.useState(task?.date ?? defaultDate ?? toDateKey(new Date()));
  const [priority, setPriority] = React.useState<"low" | "medium" | "high">(
    task?.priority ?? "medium",
  );
  const [goalId, setGoalId] = React.useState(task?.goalId ?? "nenhuma");
  const [recurrence, setRecurrence] = React.useState(task?.recurrenceRule ?? "nenhuma");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = createTaskSchema.safeParse({
      title,
      notes: notes || null,
      date,
      priority,
      goalId: goalId === "nenhuma" ? null : goalId,
      recurrenceRule: recurrence === "nenhuma" ? null : recurrence,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateTaskAction(task!.id, parsed.data)
      : await createTaskAction(parsed.data);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEdit ? "Tarefa atualizada." : "Tarefa criada!");
    onOpenChange(false);
    if (!isEdit) {
      setTitle("");
      setNotes("");
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar tarefa" : "Nova tarefa"}
      trigger={trigger}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="task-title">O que precisa ser feito?</FieldLabel>
            <Input
              id="task-title"
              placeholder="Ex.: Agendar dentista"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus={!isEdit}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="task-date">Data</FieldLabel>
              <Input
                id="task-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Repetir</FieldLabel>
              <Select
                value={recurrence}
                onValueChange={(value) => setRecurrence(value as typeof recurrence)}
              >
                <SelectTrigger aria-label="Recorrência">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel>Prioridade</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {taskPriorityValues.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={cn(
                    "rounded-xl border py-2 text-xs font-medium transition-colors",
                    priority === value ? "border-primary bg-primary/10" : "hover:bg-accent",
                  )}
                >
                  {PRIORITY_LABELS[value]}
                </button>
              ))}
            </div>
          </Field>
          {goals.length > 0 && (
            <Field>
              <FieldLabel>Meta relacionada</FieldLabel>
              <Select value={goalId ?? "nenhuma"} onValueChange={setGoalId}>
                <SelectTrigger aria-label="Meta relacionada">
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
          <Field>
            <FieldLabel htmlFor="task-notes">Notas</FieldLabel>
            <Textarea
              id="task-notes"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : null}
            {isEdit ? "Salvar alterações" : "Criar tarefa"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}
