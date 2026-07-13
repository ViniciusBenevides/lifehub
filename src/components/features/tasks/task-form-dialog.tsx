"use client";

import * as React from "react";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Plus,
  Repeat,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createSubtaskAction,
  createTaskAction,
  deleteSubtaskAction,
  listSubtasksAction,
  updateSubtaskAction,
  updateTaskAction,
} from "@/server/actions/tasks";
import type { Subtask, TaskWithMeta } from "@/server/services/tasks";
import { createTaskSchema, taskPriorityValues } from "@/shared/schemas/tasks";

const RECURRENCE_OPTIONS = [
  { value: "nenhuma", label: "Não repete" },
  { value: "daily", label: "Todos os dias" },
  { value: "weekly", label: "Toda semana" },
  { value: "monthly", label: "Todo mês" },
] as const;

export type SelectOption = { id: string; title: string };
export type CategoryOption = { id: string; name: string; icon: string; color: string };

type TaskFormDialogProps = {
  task?: TaskWithMeta;
  goals: SelectOption[];
  projects?: SelectOption[];
  categories?: CategoryOption[];
  defaultDate?: string;
  defaultProjectId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
};

/** Editor de subtarefas: local (criação) ou persistido (edição). */
function SubtaskEditor({
  taskId,
  drafts,
  onDraftsChange,
}: {
  taskId?: string;
  drafts: string[];
  onDraftsChange: (next: string[]) => void;
}) {
  const [saved, setSaved] = React.useState<Subtask[]>([]);
  const [text, setText] = React.useState("");
  const loadedFor = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!taskId || loadedFor.current === taskId) return;
    loadedFor.current = taskId;
    void listSubtasksAction(taskId).then((result) => {
      if (result.ok) setSaved(result.data);
    });
  }, [taskId]);

  async function add() {
    const title = text.trim();
    if (!title) return;
    setText("");
    if (!taskId) {
      onDraftsChange([...drafts, title]);
      return;
    }
    const result = await createSubtaskAction(taskId, { title });
    if (result.ok) setSaved((current) => [...current, result.data]);
    else toast.error(result.error);
  }

  async function toggle(subtask: Subtask) {
    setSaved((current) =>
      current.map((item) => (item.id === subtask.id ? { ...item, done: !subtask.done } : item)),
    );
    const result = await updateSubtaskAction(subtask.id, { done: !subtask.done });
    if (!result.ok) {
      setSaved((current) =>
        current.map((item) => (item.id === subtask.id ? { ...item, done: subtask.done } : item)),
      );
      toast.error(result.error);
    }
  }

  async function removeSaved(subtask: Subtask) {
    setSaved((current) => current.filter((item) => item.id !== subtask.id));
    const result = await deleteSubtaskAction(subtask.id);
    if (!result.ok) toast.error(result.error);
  }

  return (
    <div className="space-y-2">
      {saved.map((subtask) => (
        <div key={subtask.id} className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={subtask.done}
            aria-label={subtask.title}
            onClick={() => toggle(subtask)}
            className={cn(
              "size-4 shrink-0 rounded border-2 transition-colors",
              subtask.done ? "border-primary bg-primary" : "border-muted-foreground/40",
            )}
          />
          <span
            className={cn(
              "flex-1 truncate text-sm",
              subtask.done && "text-muted-foreground line-through",
            )}
          >
            {subtask.title}
          </span>
          <button
            type="button"
            aria-label={`Remover ${subtask.title}`}
            onClick={() => removeSaved(subtask)}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ))}
      {drafts.map((title, index) => (
        <div
          key={`${title}-${index}`}
          className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
        >
          <span
            className="size-4 shrink-0 rounded border-2 border-muted-foreground/40"
            aria-hidden
          />
          <span className="flex-1 truncate text-sm">{title}</span>
          <button
            type="button"
            aria-label={`Remover ${title}`}
            onClick={() => onDraftsChange(drafts.filter((_, i) => i !== index))}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          value={text}
          placeholder="Adicionar subtarefa"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void add();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Adicionar subtarefa"
          onClick={add}
        >
          <Plus aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (next: string[]) => void }) {
  const [text, setText] = React.useState("");

  function add() {
    const tag = text.trim().replace(/^#/, "");
    setText("");
    if (!tag || tags.includes(tag) || tags.length >= 8) return;
    onChange([...tags, tag]);
  }

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              #{tag}
              <button
                type="button"
                aria-label={`Remover tag ${tag}`}
                onClick={() => onChange(tags.filter((item) => item !== tag))}
                className="hover:text-destructive"
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={text}
          placeholder="Adicionar tag"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Adicionar tag"
          onClick={add}
        >
          <Tag aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export function TaskFormDialog({
  task,
  goals,
  projects = [],
  categories = [],
  defaultDate,
  defaultProjectId,
  open,
  onOpenChange,
  trigger,
}: TaskFormDialogProps) {
  const isEdit = Boolean(task);
  const [title, setTitle] = React.useState(task?.title ?? "");
  const [notes, setNotes] = React.useState(task?.notes ?? "");
  const [date, setDate] = React.useState(task?.date ?? defaultDate ?? toDateKey(new Date()));
  const [time, setTime] = React.useState(task?.scheduledTime?.slice(0, 5) ?? "");
  const [priority, setPriority] = React.useState<"low" | "medium" | "high">(
    task?.priority ?? "medium",
  );
  const [goalId, setGoalId] = React.useState(task?.goalId ?? "nenhuma");
  const [projectId, setProjectId] = React.useState(task?.projectId ?? defaultProjectId ?? "nenhum");
  const [categoryId, setCategoryId] = React.useState(task?.categoryId ?? "nenhuma");
  const [tags, setTags] = React.useState<string[]>(task?.tags ?? []);
  const [subtaskDrafts, setSubtaskDrafts] = React.useState<string[]>([]);
  const [reminder, setReminder] = React.useState(task?.reminderEnabled ?? false);
  const [recurrence, setRecurrence] = React.useState(task?.recurrenceRule ?? "nenhuma");
  const [advanced, setAdvanced] = React.useState(isEdit);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = createTaskSchema.safeParse({
      title,
      notes: notes || null,
      date,
      scheduledTime: time || null,
      priority,
      goalId: goalId === "nenhuma" ? null : goalId,
      projectId: projectId === "nenhum" ? null : projectId,
      categoryId: categoryId === "nenhuma" ? null : categoryId,
      tags,
      reminderEnabled: reminder,
      recurrenceRule: recurrence === "nenhuma" ? null : recurrence,
      subtasks: subtaskDrafts,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateTaskAction(task!.id, { ...parsed.data, subtasks: undefined })
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
      setTags([]);
      setSubtaskDrafts([]);
      setTime("");
      setReminder(false);
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar Tarefa" : "Nova Tarefa"}
      trigger={trigger}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="task-title">Título da tarefa</FieldLabel>
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
              <FieldLabel htmlFor="task-time">Hora (opcional)</FieldLabel>
              <Input
                id="task-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={() => setAdvanced((current) => !current)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {advanced ? "Ocultar opções avançadas" : "Mostrar opções avançadas"}
            {advanced ? (
              <ChevronUp className="size-4" aria-hidden />
            ) : (
              <ChevronDown className="size-4" aria-hidden />
            )}
          </button>

          {advanced && (
            <>
              <Field>
                <FieldLabel htmlFor="task-notes">Descrição (opcional)</FieldLabel>
                <Textarea
                  id="task-notes"
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Prioridade</FieldLabel>
                  <Select
                    value={priority}
                    onValueChange={(value) => setPriority(value as typeof priority)}
                  >
                    <SelectTrigger aria-label="Prioridade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskPriorityValues.map((value) => (
                        <SelectItem key={value} value={value}>
                          {PRIORITY_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {categories.length > 0 && (
                  <Field>
                    <FieldLabel>Categoria</FieldLabel>
                    <Select value={categoryId ?? "nenhuma"} onValueChange={setCategoryId}>
                      <SelectTrigger aria-label="Categoria">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhuma">Nenhuma</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </div>
              {projects.length > 0 && (
                <Field>
                  <FieldLabel>Projeto</FieldLabel>
                  <Select value={projectId ?? "nenhum"} onValueChange={setProjectId}>
                    <SelectTrigger aria-label="Projeto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
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
                <FieldLabel>Subtarefas</FieldLabel>
                <SubtaskEditor
                  taskId={task?.id}
                  drafts={subtaskDrafts}
                  onDraftsChange={setSubtaskDrafts}
                />
              </Field>
              <Field>
                <FieldLabel>Tags</FieldLabel>
                <TagEditor tags={tags} onChange={setTags} />
              </Field>
              <div className="space-y-3 rounded-xl border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Bell className="size-4 text-primary" aria-hidden />
                    <div>
                      <p className="text-sm font-medium">Ativar Lembrete</p>
                      <p className="text-xs text-muted-foreground">
                        Notificação no dia, no horário da tarefa
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={reminder}
                    onCheckedChange={setReminder}
                    aria-label="Ativar lembrete"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t pt-3">
                  <div className="flex items-center gap-2.5">
                    <Repeat className="size-4 text-primary" aria-hidden />
                    <p className="text-sm font-medium">Tarefa Recorrente</p>
                  </div>
                  <Select
                    value={recurrence ?? "nenhuma"}
                    onValueChange={(value) => setRecurrence(value as typeof recurrence)}
                  >
                    <SelectTrigger className="w-40" aria-label="Recorrência">
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
                </div>
              </div>
            </>
          )}

          {error ? <FieldError>{error}</FieldError> : null}
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Spinner /> : null}
            {isEdit ? "Salvar Alterações" : "Criar Tarefa"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}
