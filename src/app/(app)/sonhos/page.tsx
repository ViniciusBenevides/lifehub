import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Sonhos",
};

export default function SonhosPage() {
  return (
    <div>
      <PageHeader title="Sonhos" description="Seu vision board: sonhe, planeje, realize." />
      <ComingSoon module="sonhos" />
    </div>
  );
}
