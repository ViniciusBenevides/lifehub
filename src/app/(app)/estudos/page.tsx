import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Estudos",
};

export default function EstudosPage() {
  return (
    <>
      <PageHeader title="Estudos" description="Planos de estudo com templates, agenda e sessões." />
      <ComingSoon module="estudos" />
    </>
  );
}
