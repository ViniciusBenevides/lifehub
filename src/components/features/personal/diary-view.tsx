"use client";

import * as React from "react";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { fromDateKey, toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createDiaryEntryAction,
  deleteDiaryEntryAction,
  updateDiaryEntryAction,
} from "@/server/actions/personal";
import type { DiaryEntry } from "@/server/services/diary";
import { MOOD_META, type Mood } from "@/shared/constants/personal";
import { createDiaryEntrySchema, moodValues } from "@/shared/schemas/personal";

function DiaryDialog({
  entry,
  open,
  onOpenChange,
  trigger,
}: {
  entry?: DiaryEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}) {
  const isEdit = Boolean(entry);
  const [date, setDate] = React.useState(entry?.date ?? toDateKey(new Date()));
  const [title, setTitle] = React.useState(entry?.title ?? "");
  const [content, setContent] = React.useState(entry?.content ?? "");
  const [mood, setMood] = React.useState<Mood | null>(entry?.mood ?? null);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = createDiaryEntrySchema.safeParse({
      date,
      title: title || null,
      content,
      mood,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateDiaryEntryAction(entry!.id, parsed.data)
      : await createDiaryEntryAction(parsed.data);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEdit ? "Registro atualizado." : "Registro salvo no diário. 📔");
    onOpenChange(false);
    if (!isEdit) {
      setTitle("");
      setContent("");
      setMood(null);
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar Registro" : "Novo Registro"}
      trigger={trigger}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="diary-date">Data</FieldLabel>
              <Input
                id="diary-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="diary-title">Título (opcional)</FieldLabel>
              <Input
                id="diary-title"
                placeholder="Um dia especial"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="diary-content">O que aconteceu hoje?</FieldLabel>
            <Textarea
              id="diary-content"
              rows={6}
              placeholder="Escreva livremente sobre o seu dia..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              autoFocus={!isEdit}
            />
          </Field>
          <Field>
            <FieldLabel>Humor do dia (opcional)</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {moodValues.map((value) => {
                const meta = MOOD_META[value];
                const active = mood === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMood(active ? null : value)}
                    className={cn(
                      "grid size-11 place-items-center rounded-xl border-2 text-xl transition-all",
                      active ? "scale-110" : "border-transparent bg-secondary/50 hover:bg-accent",
                    )}
                    style={active ? { borderColor: meta.color } : undefined}
                    title={meta.label}
                  >
                    {meta.emoji}
                  </button>
                );
              })}
            </div>
          </Field>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Spinner /> : null}
            {isEdit ? "Salvar Alterações" : "Salvar Registro"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

function DiaryCard({ entry }: { entry: DiaryEntry }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const meta = entry.mood ? MOOD_META[entry.mood] : null;

  async function handleDelete() {
    const result = await deleteDiaryEntryAction(entry.id);
    if (!result.ok) toast.error(result.error);
    else toast.success("Registro excluído.");
  }

  return (
    <div className="group rounded-2xl border bg-card p-4 transition-all hover:border-rose-500/40">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <p className="text-xs font-semibold text-rose-600 uppercase first-letter:uppercase dark:text-rose-400">
            {format(fromDateKey(entry.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          {entry.title ? <h3 className="mt-1 font-semibold">{entry.title}</h3> : null}
          <p className="mt-1 line-clamp-3 text-sm whitespace-pre-line text-muted-foreground">
            {entry.content}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          {meta ? (
            <span className="text-2xl" title={meta.label} aria-label={`Humor: ${meta.label}`}>
              {meta.emoji}
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Excluir registro"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
      <DiaryDialog entry={entry} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}

export function DiaryView({ entries }: { entries: DiaryEntry[] }) {
  const [newOpen, setNewOpen] = React.useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex justify-end">
        <DiaryDialog
          open={newOpen}
          onOpenChange={setNewOpen}
          trigger={
            <Button className="bg-rose-600 text-white hover:bg-rose-600/90">
              <Plus aria-hidden /> Novo Registro
            </Button>
          }
        />
      </div>

      {entries.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <NotebookPen aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Seu diário está vazio</EmptyTitle>
            <EmptyDescription>Registre pensamentos, conquistas e memórias do dia.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => setNewOpen(true)}
              className="bg-rose-600 text-white hover:bg-rose-600/90"
            >
              <Plus aria-hidden /> Escrever Primeiro Registro
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <DiaryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
