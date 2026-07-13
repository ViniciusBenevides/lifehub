import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Análise de Sonhos",
};

export default function AnaliseSonhosPage() {
  return (
    <>
      <PageHeader
        title="Análise de Sonhos"
        description="Padrões dos seus sonhos ao longo do tempo."
      />
      <ComingSoon module="análise de sonhos" />
    </>
  );
}
