import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Diário de Sonhos",
};

export default function DiarioSonhosPage() {
  return (
    <>
      <PageHeader title="Diário de Sonhos" description="Registre seus sonhos ao acordar." />
      <ComingSoon module="diário de sonhos" />
    </>
  );
}
