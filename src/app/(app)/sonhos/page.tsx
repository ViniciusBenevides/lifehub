import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { DreamsBoard } from "@/components/features/dreams/dreams-board";
import { NewDreamButton } from "@/components/features/dreams/new-dream-button";
import { PageHeader } from "@/components/features/shell/page-header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { listDreams } from "@/server/services/dreams";
import { listLifeAreas } from "@/server/services/goals";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Sonhos",
};

export default async function SonhosPage() {
  const user = await requireUser();
  const [dreams, lifeAreas] = await Promise.all([listDreams(user.id), listLifeAreas(user.id)]);

  const achievedCount = dreams.filter((dream) => dream.status === "achieved").length;

  return (
    <div>
      <PageHeader
        title="Sonhos"
        description={
          dreams.length > 0
            ? `${dreams.length} no mural · ${achievedCount} realizados`
            : "Seu vision board: sonhe, planeje, realize."
        }
      >
        <NewDreamButton />
      </PageHeader>

      {dreams.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkles aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Monte seu mural de sonhos</EmptyTitle>
            <EmptyDescription>
              Viagens, conquistas, experiências — visualize o que você quer e transforme em metas
              concretas.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewDreamButton />
          </EmptyContent>
        </Empty>
      ) : (
        <DreamsBoard dreams={dreams} lifeAreas={lifeAreas} />
      )}
    </div>
  );
}
