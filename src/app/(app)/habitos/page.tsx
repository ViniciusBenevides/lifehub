import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Hábitos",
};

export default function HabitosPage() {
  return (
    <div>
      <PageHeader title="Hábitos" description="Sua rotina diária, streaks e consistência." />
      <ComingSoon module="hábitos" />
    </div>
  );
}
