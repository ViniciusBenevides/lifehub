import type { Metadata } from "next";
import { addDays, format, startOfWeek } from "date-fns";
import { CalendarCheck, TriangleAlert } from "lucide-react";

import { KanbanBoard } from "@/components/features/tasks/kanban-board";
import { MonthCalendar } from "@/components/features/tasks/month-calendar";
import { NewTaskButton, NewTaskFab } from "@/components/features/tasks/new-task-button";
import { TaskItem } from "@/components/features/tasks/task-item";
import { FilterChips, ViewSwitcher } from "@/components/features/tasks/view-switcher";
import { parseTaskFilter, parseTaskView } from "@/components/features/tasks/task-views";
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
import { toDateKey } from "@/lib/format";
import { listGoals } from "@/server/services/goals";
import { listProjects } from "@/server/services/projects";
import {
  listAllTasks,
  listOverdueTasks,
  listTaskCategories,
  listTasksInRange,
  type TaskWithMeta,
} from "@/server/services/tasks";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Tarefas",
};

export default async function AtividadesPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; filtro?: string; mes?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const view = parseTaskView(params.vista);
  const filter = parseTaskFilter(params.filtro);

  const today = new Date();
  const todayKey = toDateKey(today);
  const monthKey = /^\d{4}-\d{2}$/.test(params.mes ?? "") ? params.mes! : format(today, "yyyy-MM");

  const [activeGoals, categories, projects] = await Promise.all([
    listGoals(user.id, { status: "active" }),
    listTaskCategories(user.id),
    listProjects(user.id, { status: "active" }),
  ]);
  const goalOptions = activeGoals.map((goal) => ({ id: goal.id, title: goal.title }));
  const projectOptions = projects.map((project) => ({ id: project.id, title: project.name }));
  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
  }));

  let tasks: TaskWithMeta[] = [];
  let overdue: TaskWithMeta[] = [];
  let weekDays: string[] = [];

  if (view === "lista") {
    if (filter === "hoje") {
      [tasks, overdue] = await Promise.all([
        listTasksInRange(user.id, todayKey, todayKey),
        listOverdueTasks(user.id, todayKey),
      ]);
      tasks = tasks.filter((task) => task.recurrenceRule == null);
    } else if (filter === "todas") {
      tasks = await listAllTasks(user.id);
    } else if (filter === "pendentes") {
      tasks = await listAllTasks(user.id, { statuses: ["todo", "in_progress"] });
    } else {
      tasks = await listAllTasks(user.id, { statuses: ["done"] });
    }
  } else if (view === "kanban") {
    tasks = await listAllTasks(user.id);
  } else if (view === "calendario") {
    const monthStart = `${monthKey}-01`;
    const monthEnd = format(
      addDays(new Date(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)), 0), 0),
      "yyyy-MM-dd",
    );
    tasks = (await listTasksInRange(user.id, monthStart, monthEnd)).filter(
      (task) => task.recurrenceRule == null || task.date >= todayKey,
    );
  } else {
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const from = toDateKey(weekStart);
    const to = toDateKey(addDays(weekStart, 6));
    tasks = (await listTasksInRange(user.id, from, to)).filter(
      (task) => task.recurrenceRule == null || task.date >= todayKey,
    );
    weekDays = Array.from({ length: 7 }, (_, index) => toDateKey(addDays(weekStart, index)));
  }

  const doneCount = tasks.filter((task) => task.status === "done").length;
  const sharedProps = {
    goals: goalOptions,
    projects: projectOptions,
    categories: categoryOptions,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tarefas"
        description={
          tasks.length > 0
            ? `${doneCount} de ${tasks.length} concluídas`
            : "Organize seu dia com listas, kanban e calendário."
        }
      >
        <div className="hidden md:block">
          <NewTaskButton {...sharedProps} defaultDate={todayKey} />
        </div>
      </PageHeader>

      <ViewSwitcher view={view} />
      {view === "lista" && <FilterChips filter={filter} />}

      {view === "lista" && filter === "hoje" && overdue.length > 0 && (
        <section aria-label="Tarefas atrasadas" className="space-y-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400">
            <TriangleAlert className="size-4" aria-hidden />
            Atrasadas · {overdue.length}
          </h2>
          <div className="space-y-2">
            {overdue.map((task) => (
              <TaskItem key={task.id} task={task} {...sharedProps} showMoveToToday />
            ))}
          </div>
        </section>
      )}

      {view === "kanban" ? (
        <KanbanBoard tasks={tasks} {...sharedProps} />
      ) : view === "calendario" ? (
        <MonthCalendar monthKey={monthKey} tasks={tasks} {...sharedProps} />
      ) : view === "semana" ? (
        <WeekBoard days={weekDays} tasks={tasks} goals={goalOptions} />
      ) : tasks.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarCheck aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Nenhuma tarefa encontrada</EmptyTitle>
            <EmptyDescription>
              {filter === "hoje"
                ? "Dia livre! Adicione uma tarefa ou aproveite o descanso."
                : "Toque em Nova Tarefa para criar a primeira."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewTaskButton {...sharedProps} defaultDate={todayKey} />
          </EmptyContent>
        </Empty>
      ) : (
        <section aria-label="Lista de tarefas" className="space-y-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} {...sharedProps} />
          ))}
        </section>
      )}

      <NewTaskFab {...sharedProps} defaultDate={todayKey} />
    </div>
  );
}
