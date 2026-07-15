import type { Metadata } from "next";

import { DiaryView } from "@/components/features/personal/diary-view";
import { PageHeader } from "@/components/features/shell/page-header";
import { listDiaryEntries } from "@/server/services/diary";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Diário",
};

export default async function DiarioPage() {
  const user = await requireUser();
  const entries = await listDiaryEntries(user.id);

  return (
    <>
      <PageHeader title="Diário" description="Registre seus dias e reflexões." />
      <DiaryView entries={entries} />
    </>
  );
}
