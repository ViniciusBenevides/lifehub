import type { Metadata } from "next";

import { ThemePicker } from "@/components/features/themes/theme-picker";
import { PageHeader } from "@/components/features/shell/page-header";

export const metadata: Metadata = {
  title: "Temas",
};

export default function TemasPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Escolher Tema"
        description="Deslize para conhecer os temas e aplique o seu favorito."
      />
      <ThemePicker />
    </div>
  );
}
