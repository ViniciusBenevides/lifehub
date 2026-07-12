import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Metas",
};

export default function MetasPage() {
  return (
    <div>
      <PageHeader title="Metas" description="Suas metas de vida por área." />
      <ComingSoon module="metas" />
    </div>
  );
}
