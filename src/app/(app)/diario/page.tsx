import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Diário",
};

export default function DiarioPage() {
  return (
    <>
      <PageHeader title="Diário" description="Registre seus dias e reflexões." />
      <ComingSoon module="diário" />
    </>
  );
}
