import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";

import { ProjectCard } from "@/components/features/projects/project-card";
import { NewProjectButton } from "@/components/features/projects/project-form-dialog";
import { PageHeader } from "@/components/features/shell/page-header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { listProjects } from "@/server/services/projects";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Projetos",
};

export default async function ProjetosPage() {
  const user = await requireUser();
  const projects = await listProjects(user.id);
  const active = projects.filter((project) => project.status === "active");
  const completed = projects.filter((project) => project.status === "completed");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projetos"
        description={
          projects.length > 0
            ? `${active.length} ativo${active.length === 1 ? "" : "s"} · ${completed.length} concluído${completed.length === 1 ? "" : "s"}`
            : "Organize iniciativas com cor, prazo e tarefas."
        }
      >
        <NewProjectButton />
      </PageHeader>

      {projects.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderKanban aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Nenhum projeto criado</EmptyTitle>
            <EmptyDescription>
              Crie um projeto para agrupar tarefas e acompanhar o progresso.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewProjectButton />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {active.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {completed.length > 0 && (
            <section aria-label="Projetos concluídos" className="space-y-3">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Concluídos
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {completed.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
