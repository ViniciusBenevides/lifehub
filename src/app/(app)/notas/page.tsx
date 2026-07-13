import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Notas",
};

export default function NotasPage() {
  return (
    <>
      <PageHeader title="Anotações" description="Capture ideias com Markdown e categorias." />
      <ComingSoon module="notas" />
    </>
  );
}
