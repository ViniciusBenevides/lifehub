import type { Metadata } from "next";
import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarCheck, TriangleAlert } from "lucide-react";

import { NewTaskButton } from "@/components/features/tasks/new-task-button";
import { TaskItem } from "@/components/features/tasks/task-item";
import { ViewSwitcher, type TaskView } from "@/components/features/tasks/view-switcher";
import { WeekBoard } from "@/components/features/tasks/week-board";
import { PageHeader } from "@/components/features/shell/page-header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { fromDateKey, toDateKey } from "@/lib/format";
import { listGoals } from "@/server/services/goals";
import { listOverdueTasks, listTasksInRange } from "@/server/services/tasks";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Atividades",
};

export default async function AtividadesPage({
  searchParams,
}: {
  searchParams: Promise<{ visao?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const view: TaskView =
    params.visao === "amanha" || params.visao === "semana" ? params.visao : "hoje";

  const today = new Date();
  const todayKey = toDateKey(today);

  let from = todayKey;
  let to = todayKey;
  if (view === "amanha") {
    from = to = toDateKey(addDays(today, 1));
  } else if (view === "semana") {
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    from = toDateKey(weekStart);
    to = toDateKey(addDays(weekStart, 6));
  }

  const [allTasks, overdue, activeGoals] = await Promise.all([
    listTasksInRange(user.id, from, to),
    view === "hoje" ? listOverdueTasks(user.id, todayKey) : Promise.resolve([]),
    listGoals(user.id, { status: "active" }),
  ]);
  // Templates recorrentes ficam ocultos — as ocorrências geradas os representam.
  const tasks = allTasks.filter((task) => task.recurrenceRule == null || task.date >= todayKey);
  const goalOptions = activeGoals.map((goal) => ({ id: goal.id, title: goal.title }));

  const weekDays =
    view === "semana"
      ? Array.from({ length: 7 }, (_, index) => toDateKey(addDays(fromDateKey(from), index)))
      : [];

  const doneCount = tasks.filter((task) => task.status === "done").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atividades"
        description={
          tasks.length > 0
            ? `${doneCount} de ${tasks.length} concluídas`
            : "Tarefas do dia e da semana."
        }
      >
        <NewTaskButton goals={goalOptions} defaultDate={from} />
      </PageHeader>

      <ViewSwitcher view={view} />

      {view === "hoje" && overdue.length > 0 && (
        <section aria-label="Tarefas atrasadas" className="space-y-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400">
            <TriangleAlert className="size-4" aria-hidden />
            Atrasadas · {overdue.length}
          </h2>
          <div className="space-y-2">
            {overdue.map((task) => (
              <TaskItem key={task.id} task={task} goals={goalOptions} showMoveToToday />
            ))}
          </div>
        </section>
      )}

      {view === "semana" ? (
        <WeekBoard days={weekDays} tasks={tasks} goals={goalOptions} />
      ) : tasks.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarCheck aria-hidden />
            </EmptyMedia>
            <EmptyTitle>{view === "hoje" ? "Nada para hoje" : "Nada para amanhã"}</EmptyTitle>
            <EmptyDescription>
              Dia livre! Adicione uma tarefa ou aproveite o descanso.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewTaskButton goals={goalOptions} defaultDate={from} />
          </EmptyContent>
        </Empty>
      ) : (
        <section
          aria-label={`Tarefas de ${format(fromDateKey(from), "EEEE", { locale: ptBR })}`}
          className="space-y-2"
        >
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} goals={goalOptions} />
          ))}
        </section>
      )}
    </div>
  );
}
