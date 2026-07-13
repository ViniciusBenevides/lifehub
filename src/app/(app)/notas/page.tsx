import type { Metadata } from "next";
import { ClipboardPen } from "lucide-react";

import { NoteCard } from "@/components/features/notes/note-card";
import { NewNoteButton } from "@/components/features/notes/note-editor-dialog";
import { NotesToolbar } from "@/components/features/notes/notes-toolbar";
import { PageHeader } from "@/components/features/shell/page-header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { listNotes } from "@/server/services/notes";
import { noteCategorySchema } from "@/shared/schemas/notes";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Notas",
};

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; busca?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const categoryParsed = noteCategorySchema.safeParse(params.categoria);
  const category = categoryParsed.success ? categoryParsed.data : undefined;
  const search = params.busca ?? "";

  const notes = await listNotes(user.id, { category, search: search || undefined });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Anotações"
        description={
          notes.length > 0
            ? `${notes.length} anotaç${notes.length === 1 ? "ão" : "ões"}`
            : "Capture ideias com Markdown e categorias."
        }
      >
        <NewNoteButton />
      </PageHeader>

      <NotesToolbar category={category} search={search} />

      {notes.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardPen aria-hidden />
            </EmptyMedia>
            <EmptyTitle>
              {search || category ? "Nada encontrado" : "Nenhuma anotação criada"}
            </EmptyTitle>
            <EmptyDescription>
              {search || category
                ? "Tente outra busca ou categoria."
                : "Comece a anotar suas ideias!"}
            </EmptyDescription>
          </EmptyHeader>
          {!search && !category && (
            <EmptyContent>
              <NewNoteButton />
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
