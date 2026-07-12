import type { Metadata } from "next";
import { Moon, Repeat, Sun, Sunrise, Sunset } from "lucide-react";

import { TIME_OF_DAY_LABELS } from "@/components/features/habits/frequency";
import { HabitCheckItem } from "@/components/features/habits/habit-check-item";
import { Heatmap } from "@/components/features/habits/heatmap";
import { NewHabitButton } from "@/components/features/habits/new-habit-button";
import { PageHeader } from "@/components/features/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getUserHeatmap, listHabits } from "@/server/services/habits";
import { listGoals } from "@/server/services/goals";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Hábitos",
};

const PERIOD_ICONS = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  anytime: Moon,
} as const;

const PERIOD_ORDER = ["morning", "afternoon", "evening", "anytime"] as const;

export default async function HabitosPage() {
  const user = await requireUser();
  const today = new Date();
  const [habits, heatmap, goals] = await Promise.all([
    listHabits(user.id, today),
    getUserHeatmap(user.id, today, 365),
    listGoals(user.id, { status: "active" }),
  ]);

  const goalOptions = goals.map((goal) => ({ id: goal.id, title: goal.title }));
  const scheduledToday = habits.filter((habit) => habit.scheduledToday);
  const doneToday = scheduledToday.filter((habit) => habit.doneToday).length;

  const sections = PERIOD_ORDER.map((period) => ({
    period,
    habits: habits.filter((habit) => habit.timeOfDay === period),
  })).filter((section) => section.habits.length > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hábitos"
        description={
          habits.length > 0
            ? `${doneToday} de ${scheduledToday.length} feitos hoje`
            : "Sua rotina diária, streaks e consistência."
        }
      >
        <NewHabitButton goals={goalOptions} />
      </PageHeader>

      {habits.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Repeat aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Crie seu primeiro hábito</EmptyTitle>
            <EmptyDescription>
              Pequenas ações repetidas todos os dias constroem grandes resultados.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewHabitButton goals={goalOptions} />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="space-y-6">
            {sections.map(({ period, habits: periodHabits }) => {
              const Icon = PERIOD_ICONS[period];
              return (
                <section key={period} aria-label={TIME_OF_DAY_LABELS[period]}>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                    {TIME_OF_DAY_LABELS[period]}
                  </h2>
                  <div className="space-y-2">
                    {periodHabits.map((habit) => (
                      <HabitCheckItem key={habit.id} habit={habit} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consistência — últimos 12 meses</CardTitle>
            </CardHeader>
            <CardContent>
              <Heatmap days={heatmap} label="Heatmap de consistência dos últimos 12 meses" />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
