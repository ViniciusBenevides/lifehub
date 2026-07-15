import type { Metadata } from "next";
import { Search } from "lucide-react";

import { NoteCard } from "@/components/features/notes/note-card";
import { SearchInput } from "@/components/features/search/search-input";
import { TaskItem } from "@/components/features/tasks/task-item";
import { PageHeader } from "@/components/features/shell/page-header";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { listNotes } from "@/server/services/notes";
import { listGoals } from "@/server/services/goals";
import { listAllTasks, listTaskCategories } from "@/server/services/tasks";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Pesquisar",
};

export default async function PesquisarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const [tasks, notes, goals, categories] = query
    ? await Promise.all([
        listAllTasks(user.id, { search: query, limit: 50 }),
        listNotes(user.id, { search: query }),
        listGoals(user.id, { status: "active" }),
        listTaskCategories(user.id),
      ])
    : [[], [], [], []];

  const sharedProps = {
    goals: goals.map((goal) => ({ id: goal.id, title: goal.title })),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
    })),
  };
  const hasResults = tasks.length > 0 || notes.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Pesquisar" description="Encontre tarefas e anotações rapidamente." />
      <SearchInput initialQuery={query} />

      {!query ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Digite acima para buscar em tarefas e anotações.
        </p>
      ) : !hasResults ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Nada encontrado</EmptyTitle>
            <EmptyDescription>
              Nenhum resultado para “{query}”. Tente outros termos.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-6">
          {tasks.length > 0 && (
            <section aria-label="Tarefas encontradas" className="space-y-2">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Tarefas · {tasks.length}
              </h2>
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} {...sharedProps} />
              ))}
            </section>
          )}
          {notes.length > 0 && (
            <section aria-label="Anotações encontradas" className="space-y-2">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Anotações · {notes.length}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
