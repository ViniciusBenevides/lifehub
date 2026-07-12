import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Flame } from "lucide-react";

import { GoalActionsMenu } from "@/components/features/goals/goal-actions-menu";
import { GOAL_STATUS_LABELS } from "@/components/features/goals/goal-card";
import { GoalProgressCard } from "@/components/features/goals/goal-progress-card";
import { MilestonesEditor } from "@/components/features/goals/milestones-editor";
import { DynamicIcon } from "@/components/features/icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deadlineLabel, formatDateShort, fromDateKey } from "@/lib/format";
import { NotFoundError } from "@/server/services/errors";
import { getGoalDetail, listLifeAreas } from "@/server/services/goals";
import { listHabits } from "@/server/services/habits";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Meta",
};

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  let goal;
  try {
    goal = await getGoalDetail(user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const [lifeAreas, allHabits] = await Promise.all([
    listLifeAreas(user.id),
    listHabits(user.id, new Date()),
  ]);
  const linkedHabits = allHabits.filter((habit) => habit.goalId === goal.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/metas"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden /> Metas
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              style={{ color: goal.lifeArea.color, borderColor: `${goal.lifeArea.color}55` }}
              className="gap-1.5"
            >
              <DynamicIcon name={goal.lifeArea.icon} className="size-3.5" />
              {goal.lifeArea.name}
            </Badge>
            <Badge variant={goal.status === "completed" ? "default" : "secondary"}>
              {GOAL_STATUS_LABELS[goal.status]}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{goal.title}</h1>
          {goal.description ? (
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          ) : null}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {goal.targetDate ? (
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden />
                Prazo: {formatDateShort(fromDateKey(goal.targetDate))} ·{" "}
                {goal.status === "completed" ? "concluída" : deadlineLabel(goal.targetDate)}
              </span>
            ) : null}
            {goal.completedAt ? (
              <span>Concluída em {formatDateShort(goal.completedAt)}</span>
            ) : null}
          </div>
        </div>
        <GoalActionsMenu goal={goal} lifeAreas={lifeAreas} />
      </div>

      <GoalProgressCard goal={goal} />

      {(goal.progressType === "milestones" || goal.milestones.length > 0) && (
        <MilestonesEditor goalId={goal.id} milestones={goal.milestones} />
      )}

      {linkedHabits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hábitos vinculados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {linkedHabits.map((habit) => (
                <li key={habit.id}>
                  <Link
                    href={`/habitos/${habit.id}`}
                    className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                  >
                    <DynamicIcon name={habit.icon} className="size-4 text-muted-foreground" />
                    <span className="flex-1 font-medium">{habit.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="size-3.5 text-orange-500" aria-hidden />
                      {habit.streak.current}{" "}
                      {habit.streak.unit === "weeks"
                        ? "sem."
                        : habit.streak.current === 1
                          ? "dia"
                          : "dias"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
