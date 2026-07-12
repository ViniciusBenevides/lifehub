import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Finanças",
};

export default function FinancasPage() {
  return (
    <div>
      <PageHeader title="Finanças" description="Receitas, despesas e orçamentos do mês." />
      <ComingSoon module="finanças" />
    </div>
  );
}
