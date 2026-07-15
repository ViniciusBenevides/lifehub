import type { Metadata } from "next";
import {
  Bell,
  Calendar,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Flame,
  ListChecks,
  Percent,
  Repeat,
  Timer,
  TrendingUp,
  TriangleAlert,
  Trophy,
} from "lucide-react";

import { PeriodFilter } from "@/components/features/dashboard/period-filter";
import {
  DailyDoneChart,
  PriorityChart,
  ScheduledVsDoneChart,
  WeekdayChart,
} from "@/components/features/dashboard/productivity-charts";
import { PageHeader } from "@/components/features/shell/page-header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getProductivityData, type PeriodDays } from "@/server/services/productivity";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const period: PeriodDays = params.periodo === "30" ? 30 : params.periodo === "90" ? 90 : 7;

  const data = await getProductivityData(user.id, new Date(), period);
  const { gamification } = data;
  const bucketLabel = period === 90 ? "semana" : "dia";

  const heroStats = [
    {
      label: "Nível",
      value: String(gamification.level.level),
      icon: Trophy,
      tint: "text-amber-500",
    },
    {
      label: "Sequência",
      value: String(gamification.activityStreak),
      icon: Flame,
      tint: "text-orange-500",
    },
    {
      label: "Concluídas",
      value: String(data.tasksDoneInPeriod),
      icon: CheckCircle2,
      tint: "text-emerald-500",
    },
    {
      label: "Pomodoros",
      value: String(data.pomodorosInPeriod),
      icon: Timer,
      tint: "text-blue-500",
    },
  ];

  const summary = [
    {
      label: "Taxa de conclusão",
      value: `${data.completionRate}%`,
      icon: Percent,
      tint: "text-blue-500",
      chip: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Atrasadas",
      value: String(data.overdueCount),
      icon: TriangleAlert,
      tint: "text-red-500",
      chip: "bg-red-500/10 border-red-500/20",
    },
    {
      label: "Conclusões/dia",
      value: data.completionsPerDay.toFixed(1),
      icon: TrendingUp,
      tint: "text-emerald-500",
      chip: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  const statusItems = [
    {
      label: "Pendentes",
      value: data.statusCounts.todo,
      icon: CircleDashed,
      tint: "text-sky-500",
    },
    {
      label: "Em progresso",
      value: data.statusCounts.inProgress,
      icon: CircleDot,
      tint: "text-amber-500",
    },
    {
      label: "Concluídas",
      value: data.statusCounts.done,
      icon: CheckCircle2,
      tint: "text-emerald-500",
    },
  ];

  const subtaskPercent =
    data.subtasks.total > 0 ? Math.round((data.subtasks.done / data.subtasks.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral da sua produtividade." />
      <PeriodFilter period={period} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {heroStats.map((stat) => (
          <Card key={stat.label} className="flex flex-col items-center gap-1.5 p-5">
            <stat.icon className={cn("size-6", stat.tint)} aria-hidden />
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-3 p-5">
        <div>
          <h2 className="font-semibold">Resumo do período</h2>
          <p className="text-xs text-muted-foreground">Últimos {period} dias</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {summary.map((item) => (
            <div
              key={item.label}
              className={cn("flex flex-col items-center gap-1 rounded-xl border p-3", item.chip)}
            >
              <item.icon className={cn("size-4.5", item.tint)} aria-hidden />
              <p className={cn("text-lg font-bold", item.tint)}>{item.value}</p>
              <p className="text-center text-[11px] leading-tight text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Status das Tarefas</h2>
          {data.statusCounts.todo + data.statusCounts.inProgress + data.statusCounts.done === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Sem tarefas neste período.
            </p>
          ) : (
            <div className="space-y-2.5">
              {statusItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-sm">
                  <item.icon className={cn("size-4", item.tint)} aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  <span className="font-semibold tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Top 5 Categorias</h2>
          {data.topCategories.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhuma tarefa categorizada no período.
            </p>
          ) : (
            <div className="space-y-2.5">
              {data.topCategories.map((category) => (
                <div key={category.name} className="flex items-center gap-2.5 text-sm">
                  <span aria-hidden>{category.icon}</span>
                  <span className="flex-1 truncate">{category.name}</span>
                  <span className="font-semibold tabular-nums" style={{ color: category.color }}>
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ScheduledVsDoneChart data={data.scheduledVsDone} bucketLabel={bucketLabel} />
        <PriorityChart counts={data.priorityCounts} />
        <WeekdayChart data={data.weekdayCompletions} />
        <DailyDoneChart data={data.dailyDone} bucketLabel={bucketLabel} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <ListChecks className="size-4.5 text-primary" aria-hidden /> Progresso em subtarefas
            </h2>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </div>
          {data.subtasks.total === 0 ? (
            <p className="py-3 text-center text-sm text-muted-foreground">
              Nenhuma tarefa com subtarefas neste período.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {data.subtasks.tasksWithSubtasks} tarefa
                  {data.subtasks.tasksWithSubtasks === 1 ? "" : "s"} com subtarefas
                </span>
                <span className="font-semibold">
                  {data.subtasks.done}/{data.subtasks.total} ({subtaskPercent}%)
                </span>
              </div>
              <Progress value={subtaskPercent} aria-label="Progresso em subtarefas" />
            </div>
          )}
        </Card>

        <Card className="space-y-3 p-5">
          <div>
            <h2 className="font-semibold">Recorrência e lembretes</h2>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <Repeat className="size-4.5 text-amber-500" aria-hidden />
              <p className="text-lg font-bold text-amber-500">{data.recurrence.recurring}</p>
              <p className="text-[11px] text-muted-foreground">Recorrentes</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
              <Calendar className="size-4.5 text-blue-500" aria-hidden />
              <p className="text-lg font-bold text-blue-500">{data.recurrence.single}</p>
              <p className="text-[11px] text-muted-foreground">Únicas</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
              <Bell className="size-4.5 text-yellow-500" aria-hidden />
              <p className="text-lg font-bold text-yellow-500">{data.recurrence.withReminder}</p>
              <p className="text-[11px] text-muted-foreground">Com lembrete</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
