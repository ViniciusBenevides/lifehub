import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Pesquisar",
};

export default function PesquisarPage() {
  return (
    <>
      <PageHeader title="Pesquisar" description="Encontre tarefas e notas rapidamente." />
      <ComingSoon module="pesquisa" />
    </>
  );
}
