import type { Metadata } from "next";

import { MoodView } from "@/components/features/personal/mood-view";
import { PageHeader } from "@/components/features/shell/page-header";
import { listMoods } from "@/server/services/mood";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Humor",
};

export default async function HumorPage() {
  const user = await requireUser();
  const entries = await listMoods(user.id, { limit: 60 });

  return (
    <>
      <PageHeader title="Humor" description="Acompanhe suas emoções dia a dia." />
      <MoodView entries={entries} />
    </>
  );
}
