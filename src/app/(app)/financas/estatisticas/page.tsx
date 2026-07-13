import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Estatísticas",
};

export default function EstatisticasPage() {
  return (
    <>
      <PageHeader title="Estatísticas" description="Análises detalhadas das suas finanças." />
      <ComingSoon module="estatísticas financeiras" />
    </>
  );
}
