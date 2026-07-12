import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Atividades",
};

export default function AtividadesPage() {
  return (
    <div>
      <PageHeader title="Atividades" description="Tarefas do dia e da semana." />
      <ComingSoon module="atividades" />
    </div>
  );
}
