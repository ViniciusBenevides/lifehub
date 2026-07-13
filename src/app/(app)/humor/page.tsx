import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Humor",
};

export default function HumorPage() {
  return (
    <>
      <PageHeader title="Humor" description="Acompanhe suas emoções dia a dia." />
      <ComingSoon module="humor" />
    </>
  );
}
