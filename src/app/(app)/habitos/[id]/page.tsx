import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, Flame, Target, Trophy } from "lucide-react";

import {
  frequencyLabel,
  streakLabel,
  TIME_OF_DAY_LABELS,
  WEEKDAY_LABELS_FULL,
} from "@/components/features/habits/frequency";
import { HabitActionsMenu } from "@/components/features/habits/habit-actions-menu";
import { Heatmap } from "@/components/features/habits/heatmap";
import { DynamicIcon } from "@/components/features/icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotFoundError } from "@/server/services/errors";
import { listGoals } from "@/server/services/goals";
import { getHabitDetail } from "@/server/services/habits";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Hábito",
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <Card className="gap-2 p-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </Card>
  );
}

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  let habit;
  try {
    habit = await getHabitDetail(user.id, id, new Date());
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const goals = await listGoals(user.id, { status: "active" });
  const goalOptions = goals.map((goal) => ({ id: goal.id, title: goal.title }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/habitos"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden /> Hábitos
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="flex size-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${habit.color ?? "#6366f1"}22`,
                color: habit.color ?? "#6366f1",
              }}
            >
              <DynamicIcon name={habit.icon} className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{habit.name}</h1>
              <p className="text-sm text-muted-foreground">
                {frequencyLabel(habit)} · {TIME_OF_DAY_LABELS[habit.timeOfDay]}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!habit.active && <Badge variant="secondary">Desativado</Badge>}
            {habit.goalTitle && habit.goalId ? (
              <Link href={`/metas/${habit.goalId}`}>
                <Badge variant="outline" className="gap-1">
                  <Target className="size-3" aria-hidden /> {habit.goalTitle}
                </Badge>
              </Link>
            ) : null}
          </div>
        </div>
        <HabitActionsMenu habit={habit} goals={goalOptions} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Streak atual" value={streakLabel(habit.streak)} icon={Flame} />
        <StatCard
          label="Recorde"
          value={streakLabel({ current: habit.streak.best, unit: habit.streak.unit })}
          icon={Trophy}
        />
        <StatCard label="Últimos 7 dias" value={`${habit.stats.rate7}%`} icon={CalendarCheck} />
        <StatCard label="Últimos 30 dias" value={`${habit.stats.rate30}%`} icon={CalendarCheck} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Heatmap days={habit.heatmap} label={`Heatmap do hábito ${habit.name}`} />
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>
              Total de conclusões:{" "}
              <strong className="text-foreground">{habit.stats.totalDone}</strong>
            </span>
            {habit.stats.bestWeekday != null && (
              <span>
                Melhor dia:{" "}
                <strong className="text-foreground">
                  {WEEKDAY_LABELS_FULL[habit.stats.bestWeekday]}
                </strong>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
