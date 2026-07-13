import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Backup & Restauração",
};

export default function BackupPage() {
  return (
    <>
      <PageHeader
        title="Backup & Restauração"
        description="Exporte e restaure todos os seus dados."
      />
      <ComingSoon module="backup" />
    </>
  );
}
