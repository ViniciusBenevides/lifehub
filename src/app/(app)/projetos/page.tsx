import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Projetos",
};

export default function ProjetosPage() {
  return (
    <>
      <PageHeader title="Projetos" description="Organize iniciativas com cor, prazo e tarefas." />
      <ComingSoon module="projetos" />
    </>
  );
}
