"use client";

import * as React from "react";
import { Pin, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { NoteEditorDialog } from "@/components/features/notes/note-editor-dialog";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteNoteAction, updateNoteAction } from "@/server/actions/notes";
import type { Note } from "@/server/services/notes";
import { NOTE_CATEGORY_META } from "@/shared/constants/notes";

export function NoteCard({ note }: { note: Note }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const meta = NOTE_CATEGORY_META[note.category];

  async function togglePin() {
    const result = await updateNoteAction(note.id, { pinned: !note.pinned });
    if (!result.ok) toast.error(result.error);
  }

  async function handleDelete() {
    const result = await deleteNoteAction(note.id);
    if (!result.ok) toast.error(result.error);
    else toast.success("Anotação excluída.");
  }

  return (
    <div className="group relative flex flex-col gap-2.5 rounded-2xl border bg-card p-4 transition-all hover:border-primary/30">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Abrir ${note.title}`}
        >
          <h3 className="truncate font-semibold">{note.title}</h3>
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={note.pinned ? "Desafixar" : "Fixar"}
            aria-pressed={note.pinned}
            onClick={togglePin}
            className={cn(
              note.pinned
                ? "text-amber-500"
                : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            )}
          >
            <Pin className={cn("size-3.5", note.pinned && "fill-current")} aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Excluir ${note.title}`}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="min-h-10 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        tabIndex={-1}
      >
        <p className="line-clamp-4 text-sm whitespace-pre-line text-muted-foreground">
          {note.content || "Sem conteúdo."}
        </p>
      </button>

      <div className="flex items-center justify-between gap-2">
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", meta.badge)}>
          {meta.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDateShort(new Date(note.updatedAt))}
        </span>
      </div>

      <NoteEditorDialog note={note} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
