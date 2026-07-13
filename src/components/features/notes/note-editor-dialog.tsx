"use client";

import * as React from "react";
import { Bold, Check, Eye, Italic, Link2, List, ListChecks, Pencil, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createNoteAction, updateNoteAction } from "@/server/actions/notes";
import type { Note } from "@/server/services/notes";
import { NOTE_CATEGORY_META, type NoteCategory } from "@/shared/constants/notes";
import { createNoteSchema, noteCategoryValues } from "@/shared/schemas/notes";

type NoteEditorDialogProps = {
  note?: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
};

const TOOLBAR = [
  { label: "Negrito", icon: Bold, before: "**", after: "**", placeholder: "texto" },
  { label: "Itálico", icon: Italic, before: "_", after: "_", placeholder: "texto" },
  { label: "Lista", icon: List, before: "\n- ", after: "", placeholder: "item" },
  { label: "Checklist", icon: ListChecks, before: "\n- [ ] ", after: "", placeholder: "tarefa" },
  { label: "Link", icon: Link2, before: "[", after: "](https://)", placeholder: "título" },
] as const;

export function NoteEditorDialog({ note, open, onOpenChange, trigger }: NoteEditorDialogProps) {
  const isEdit = Boolean(note);
  const [title, setTitle] = React.useState(note?.title ?? "");
  const [category, setCategory] = React.useState<NoteCategory>(note?.category ?? "pessoal");
  const [content, setContent] = React.useState(note?.content ?? "");
  const [preview, setPreview] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  function insertMarkdown(item: (typeof TOOLBAR)[number]) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || item.placeholder;
    const next = content.slice(0, start) + item.before + selected + item.after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + item.before.length + selected.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = createNoteSchema.safeParse({ title, category, content });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateNoteAction(note!.id, parsed.data)
      : await createNoteAction(parsed.data);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEdit ? "Anotação atualizada." : "Anotação criada!");
    onOpenChange(false);
    if (!isEdit) {
      setTitle("");
      setContent("");
      setPreview(false);
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar Anotação" : "Nova Anotação"}
      trigger={trigger}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="note-title">Título</FieldLabel>
            <Input
              id="note-title"
              placeholder="Digite o título da anotação"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus={!isEdit}
            />
          </Field>
          <Field>
            <FieldLabel>Categoria</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {noteCategoryValues.map((value) => {
                const meta = NOTE_CATEGORY_META[value];
                const active = category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      active ? "border-transparent text-white" : "hover:bg-accent",
                    )}
                    style={active ? { backgroundColor: meta.color } : undefined}
                  >
                    {active ? <Check className="size-3.5" aria-hidden /> : null}
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="note-content">Conteúdo</FieldLabel>
              <button
                type="button"
                onClick={() => setPreview((current) => !current)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {preview ? (
                  <>
                    <Pencil className="size-3.5" aria-hidden /> Editar
                  </>
                ) : (
                  <>
                    <Eye className="size-3.5" aria-hidden /> Visualizar
                  </>
                )}
              </button>
            </div>
            {preview ? (
              <div className="prose prose-sm dark:prose-invert min-h-40 max-w-none rounded-xl border p-3 [&_a]:text-primary [&_ol]:list-decimal [&_ul]:list-disc">
                {content.trim() ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-sm text-muted-foreground">Nada para visualizar ainda.</p>
                )}
              </div>
            ) : (
              <>
                <div className="flex gap-1 rounded-t-xl border border-b-0 p-1.5">
                  {TOOLBAR.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      aria-label={item.label}
                      title={item.label}
                      onClick={() => insertMarkdown(item)}
                      className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <item.icon className="size-4" aria-hidden />
                    </button>
                  ))}
                </div>
                <Textarea
                  id="note-content"
                  ref={textareaRef}
                  rows={8}
                  placeholder={
                    "Escreva sua anotação aqui...\n\nDica: use Markdown para formatar o texto"
                  }
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="rounded-t-none font-mono text-sm"
                />
              </>
            )}
          </Field>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Spinner /> : null}
            {isEdit ? "Salvar Alterações" : "Criar Anotação"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export function NewNoteButton({ size = "default" }: { size?: "default" | "sm" }) {
  const [open, setOpen] = React.useState(false);
  return (
    <NoteEditorDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size={size}>
          <Plus aria-hidden /> Nova Anotação
        </Button>
      }
    />
  );
}
