import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Aniversários",
};

export default function AniversariosPage() {
  return (
    <>
      <PageHeader title="Aniversários" description="Nunca mais esqueça uma data especial." />
      <ComingSoon module="aniversários" />
    </>
  );
}
