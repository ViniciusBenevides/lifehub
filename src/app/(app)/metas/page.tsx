import type { Metadata } from "next";
import { Target } from "lucide-react";

import { GoalCard } from "@/components/features/goals/goal-card";
import { GoalFilters } from "@/components/features/goals/goal-filters";
import { GoalFormDialog } from "@/components/features/goals/goal-form-dialog";
import { DynamicIcon } from "@/components/features/icon";
import { PageHeader } from "@/components/features/shell/page-header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { listGoals, listLifeAreas } from "@/server/services/goals";
import { requireUser } from "@/server/session";
import { goalFiltersSchema } from "@/shared/schemas/goals";

export const metadata: Metadata = {
  title: "Metas",
};

export default async function MetasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; area?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const parsed = goalFiltersSchema.safeParse({
    status: params.status,
    lifeAreaId: params.area,
  });
  const filters = parsed.success ? parsed.data : {};
  const hasFilters = Boolean(filters.status || filters.lifeAreaId);

  const [lifeAreas, allGoals] = await Promise.all([
    listLifeAreas(user.id),
    listGoals(user.id, filters),
  ]);
  // Sem filtro explícito, esconde as arquivadas.
  const goals = filters.status ? allGoals : allGoals.filter((g) => g.status !== "archived");

  const grouped = lifeAreas
    .map((area) => ({ area, goals: goals.filter((goal) => goal.lifeAreaId === area.id) }))
    .filter((group) => group.goals.length > 0);

  return (
    <div>
      <PageHeader title="Metas" description="Suas metas de vida por área.">
        <GoalFormDialog lifeAreas={lifeAreas} />
      </PageHeader>

      <div className="mb-6">
        <GoalFilters lifeAreas={lifeAreas} />
      </div>

      {goals.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Target aria-hidden />
            </EmptyMedia>
            <EmptyTitle>
              {hasFilters ? "Nenhuma meta encontrada" : "Defina sua primeira meta"}
            </EmptyTitle>
            <EmptyDescription>
              {hasFilters
                ? "Tente ajustar os filtros acima."
                : "Metas dão direção à sua rotina: comece com algo que importa para você."}
            </EmptyDescription>
          </EmptyHeader>
          {!hasFilters && (
            <EmptyContent>
              <GoalFormDialog lifeAreas={lifeAreas} />
            </EmptyContent>
          )}
        </Empty>
      ) : hasFilters ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ area, goals: areaGoals }) => (
            <section key={area.id} aria-label={area.name}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <span
                  className="flex size-6 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${area.color}22`, color: area.color }}
                >
                  <DynamicIcon name={area.icon} className="size-3.5" />
                </span>
                {area.name}
                <span className="font-normal">· {areaGoals.length}</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {areaGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
