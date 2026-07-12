import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Scale, Target } from "lucide-react";

import { CircularProgress } from "@/components/features/dashboard/circular-progress";
import { DreamCarousel } from "@/components/features/dashboard/dream-carousel";
import { MonthlyFlowChart } from "@/components/features/finance/finance-charts";
import { HabitCheckItem } from "@/components/features/habits/habit-check-item";
import { Heatmap } from "@/components/features/habits/heatmap";
import { TaskItem } from "@/components/features/tasks/task-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getDashboardData } from "@/server/services/dashboard";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

function greetingForHour(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      {children} <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const data = await getDashboardData(user.id, now);

  const scheduledHabits = data.habits.filter((habit) => habit.scheduledToday);
  const doneHabits = scheduledHabits.filter((habit) => habit.doneToday).length;
  const habitsPercent =
    scheduledHabits.length > 0 ? Math.round((doneHabits / scheduledHabits.length) * 100) : 0;
  const doneTasks = data.todayTasks.filter((task) => task.status === "done").length;
  const goalOptions = data.activeGoals.map((goal) => ({ id: goal.id, title: goal.title }));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greetingForHour(now.getHours())}, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          {formatDateLong(now)}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="flex-row items-center gap-3 p-4">
          <div className="relative">
            <CircularProgress value={habitsPercent} label={`${habitsPercent}% dos hábitos`} />
            <span className="absolute inset-0 flex rotate-0 items-center justify-center text-[10px] font-semibold tabular-nums">
              {habitsPercent}%
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Hábitos hoje</p>
            <p className="text-lg font-semibold tabular-nums">
              {doneHabits}/{scheduledHabits.length}
            </p>
          </div>
        </Card>

        <Card className="gap-1.5 p-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Scale className="size-3.5" aria-hidden /> Saldo do mês
          </span>
          <span
            className={cn(
              "truncate text-lg font-semibold tabular-nums",
              data.monthBalanceCents >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {formatBRL(data.monthBalanceCents)}
          </span>
        </Card>

        <Card className="gap-1.5 p-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="size-3.5" aria-hidden /> Metas ativas
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {data.activeGoals.length}
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              · {data.averageGoalProgress}% médio
            </span>
          </span>
        </Card>

        <Card className="gap-1.5 p-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarCheck className="size-3.5" aria-hidden /> Tarefas hoje
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {doneTasks}/{data.todayTasks.length}
            {data.overdueTasks.length > 0 && (
              <span className="ml-1.5 text-sm font-normal text-rose-600 dark:text-rose-400">
                · {data.overdueTasks.length} atrasada{data.overdueTasks.length > 1 ? "s" : ""}
              </span>
            )}
          </span>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Hoje</CardTitle>
            <SectionLink href="/habitos">Hábitos</SectionLink>
          </CardHeader>
          <CardContent className="space-y-2">
            {scheduledHabits.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum hábito para hoje.{" "}
                <Link href="/habitos" className="font-medium underline-offset-4 hover:underline">
                  Criar hábito
                </Link>
              </p>
            ) : (
              scheduledHabits.map((habit) => <HabitCheckItem key={habit.id} habit={habit} />)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Tarefas do dia</CardTitle>
            <SectionLink href="/atividades">Atividades</SectionLink>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.todayTasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nada agendado para hoje.{" "}
                <Link href="/atividades" className="font-medium underline-offset-4 hover:underline">
                  Criar tarefa
                </Link>
              </p>
            ) : (
              data.todayTasks.map((task) => (
                <TaskItem key={task.id} task={task} goals={goalOptions} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Consistência — 90 dias</CardTitle>
            <SectionLink href="/habitos">Ver tudo</SectionLink>
          </CardHeader>
          <CardContent>
            <Heatmap days={data.heatmap90} label="Consistência dos últimos 90 dias" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Fluxo financeiro</CardTitle>
            <SectionLink href="/financas">Finanças</SectionLink>
          </CardHeader>
          <CardContent>
            <MonthlyFlowChart data={data.flow} />
          </CardContent>
        </Card>
      </div>

      {data.dreams.length > 0 && (
        <section aria-label="Sonhos em destaque" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Sonhos em destaque</h2>
            <SectionLink href="/sonhos">Mural completo</SectionLink>
          </div>
          <DreamCarousel dreams={data.dreams} />
        </section>
      )}
    </div>
  );
}
