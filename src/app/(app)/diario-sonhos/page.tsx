import type { Metadata } from "next";

import { DreamJournalView } from "@/components/features/personal/dream-journal-view";
import { PageHeader } from "@/components/features/shell/page-header";
import { listDreamEntries } from "@/server/services/dream-journal";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Diário de Sonhos",
};

export default async function DiarioSonhosPage() {
  const user = await requireUser();
  const entries = await listDreamEntries(user.id);

  return (
    <>
      <PageHeader title="Diário de Sonhos" description="Registre seus sonhos ao acordar." />
      <DreamJournalView entries={entries} />
    </>
  );
}
