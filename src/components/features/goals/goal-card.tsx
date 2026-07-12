import Link from "next/link";
import { CalendarDays, CheckCircle2, ListChecks, Repeat } from "lucide-react";

import { DynamicIcon } from "@/components/features/icon";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { deadlineLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GoalWithMeta } from "@/server/services/goals";

export const GOAL_STATUS_LABELS: Record<GoalWithMeta["status"], string> = {
  active: "Ativa",
  completed: "Concluída",
  paused: "Pausada",
  archived: "Arquivada",
};

export function GoalCard({ goal }: { goal: GoalWithMeta }) {
  const isCompleted = goal.status === "completed";
  const isOverdue =
    goal.status === "active" &&
    goal.targetDate != null &&
    deadlineLabel(goal.targetDate).startsWith("atrasada");

  return (
    <Link
      href={`/metas/${goal.id}`}
      className="group block rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Card className="h-full gap-4 p-5 transition-colors group-hover:border-primary/40">
        <div className="flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            style={{ color: goal.lifeArea.color, borderColor: `${goal.lifeArea.color}55` }}
            className="gap-1.5"
          >
            <DynamicIcon name={goal.lifeArea.icon} className="size-3.5" />
            {goal.lifeArea.name}
          </Badge>
          {goal.status !== "active" && (
            <Badge variant={isCompleted ? "default" : "secondary"} className="gap-1">
              {isCompleted && <CheckCircle2 className="size-3.5" aria-hidden />}
              {GOAL_STATUS_LABELS[goal.status]}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="line-clamp-2 font-medium">{goal.title}</h3>
          {goal.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{goal.description}</p>
          ) : null}
        </div>

        <div className="mt-auto space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {goal.progressType === "numeric" && goal.targetValue
                  ? `${goal.currentValue}/${goal.targetValue} ${goal.unit ?? ""}`.trim()
                  : "Progresso"}
              </span>
              <span className="font-medium tabular-nums">{goal.progressPercent}%</span>
            </div>
            <Progress value={goal.progressPercent} aria-label="Progresso da meta" />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {goal.targetDate ? (
              <span className={cn("flex items-center gap-1", isOverdue && "text-destructive")}>
                <CalendarDays className="size-3.5" aria-hidden />
                {isCompleted ? "Concluída" : deadlineLabel(goal.targetDate)}
              </span>
            ) : null}
            {goal.milestonesTotal > 0 ? (
              <span className="flex items-center gap-1">
                <ListChecks className="size-3.5" aria-hidden />
                {goal.milestonesDone}/{goal.milestonesTotal} marcos
              </span>
            ) : null}
            {goal.habitsCount > 0 ? (
              <span className="flex items-center gap-1">
                <Repeat className="size-3.5" aria-hidden />
                {goal.habitsCount} {goal.habitsCount === 1 ? "hábito" : "hábitos"}
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
