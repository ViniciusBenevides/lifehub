import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Pomodoro",
};

export default function PomodoroPage() {
  return (
    <>
      <PageHeader title="Pomodoro" description="Sessões de foco com pausas inteligentes." />
      <ComingSoon module="pomodoro" />
    </>
  );
}
