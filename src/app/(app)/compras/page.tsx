import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Compras",
};

export default function ComprasPage() {
  return (
    <>
      <PageHeader title="Compras" description="Listas de compras com preços e total estimado." />
      <ComingSoon module="compras" />
    </>
  );
}
