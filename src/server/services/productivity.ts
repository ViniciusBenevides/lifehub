import { format, getDay, subDays } from "date-fns";

import { countFocusSessions } from "@/server/services/pomodoro";
import { getGamification, type GamificationSummary } from "@/server/services/gamification";
import { listOverdueTasks, listTasksInRange, type TaskWithMeta } from "@/server/services/tasks";

export type PeriodDays = 7 | 30 | 90;

export type ChartPoint = { label: string; value: number };
export type ScheduledVsDonePoint = { label: string; scheduled: number; done: number };

export type ProductivityData = {
  periodDays: PeriodDays;
  gamification: GamificationSummary;
  tasksDoneInPeriod: number;
  pomodorosInPeriod: number;
  completionRate: number;
  overdueCount: number;
  completionsPerDay: number;
  statusCounts: { todo: number; inProgress: number; done: number };
  priorityCounts: { high: number; medium: number; low: number };
  topCategories: Array<{ name: string; icon: string; color: string; count: number }>;
  scheduledVsDone: ScheduledVsDonePoint[];
  weekdayCompletions: ChartPoint[];
  dailyDone: ChartPoint[];
  subtasks: { done: number; total: number; tasksWithSubtasks: number };
  recurrence: { recurring: number; single: number; withReminder: number };
};

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Agregações puras sobre as tarefas do período (testável sem banco). */
export function computeProductivityStats(
  tasks: TaskWithMeta[],
  from: Date,
  today: Date,
  periodDays: PeriodDays,
): Omit<ProductivityData, "periodDays" | "gamification" | "pomodorosInPeriod" | "overdueCount"> {
  const concrete = tasks.filter((task) => task.recurrenceRule == null);
  const done = concrete.filter((task) => task.status === "done");

  const statusCounts = {
    todo: concrete.filter((task) => task.status === "todo").length,
    inProgress: concrete.filter((task) => task.status === "in_progress").length,
    done: done.length,
  };
  const priorityCounts = {
    high: concrete.filter((task) => task.priority === "high").length,
    medium: concrete.filter((task) => task.priority === "medium").length,
    low: concrete.filter((task) => task.priority === "low").length,
  };

  const categoryMap = new Map<
    string,
    { name: string; icon: string; color: string; count: number }
  >();
  for (const task of concrete) {
    if (!task.categoryName) continue;
    const key = task.categoryName;
    const entry = categoryMap.get(key) ?? {
      name: task.categoryName,
      icon: task.categoryIcon ?? "📌",
      color: task.categoryColor ?? "#6366f1",
      count: 0,
    };
    entry.count += 1;
    categoryMap.set(key, entry);
  }
  const topCategories = [...categoryMap.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  // Buckets: diários até 30 dias; semanais para 90.
  const bucketDays = periodDays === 90 ? 7 : 1;
  const bucketCount = Math.ceil(periodDays / bucketDays);
  const scheduledVsDone: ScheduledVsDonePoint[] = [];
  const dailyDone: ChartPoint[] = [];
  for (let bucket = bucketCount - 1; bucket >= 0; bucket--) {
    const bucketEnd = subDays(today, bucket * bucketDays);
    const bucketStart = subDays(bucketEnd, bucketDays - 1);
    const startKey = format(bucketStart, "yyyy-MM-dd");
    const endKey = format(bucketEnd, "yyyy-MM-dd");
    const label = bucketDays === 1 ? format(bucketEnd, "d/M") : `${format(bucketStart, "d/M")}`;
    const scheduled = concrete.filter(
      (task) => task.date >= startKey && task.date <= endKey,
    ).length;
    const doneInBucket = done.filter((task) => {
      if (!task.completedAt) return false;
      const key = format(task.completedAt, "yyyy-MM-dd");
      return key >= startKey && key <= endKey;
    }).length;
    scheduledVsDone.push({ label, scheduled, done: doneInBucket });
    dailyDone.push({ label, value: doneInBucket });
  }

  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const task of done) {
    if (!task.completedAt) continue;
    weekdayCounts[getDay(task.completedAt)] += 1;
  }
  // Semana começando na segunda, como no app de referência.
  const weekdayCompletions: ChartPoint[] = [1, 2, 3, 4, 5, 6, 0].map((weekday) => ({
    label: WEEKDAY_LABELS[weekday],
    value: weekdayCounts[weekday],
  }));

  const withSubtasks = concrete.filter((task) => task.subtasksTotal > 0);
  const subtasks = {
    tasksWithSubtasks: withSubtasks.length,
    total: withSubtasks.reduce((sum, task) => sum + task.subtasksTotal, 0),
    done: withSubtasks.reduce((sum, task) => sum + task.subtasksDone, 0),
  };

  const recurrence = {
    recurring: concrete.filter((task) => task.recurringSourceId != null).length,
    single: concrete.filter((task) => task.recurringSourceId == null).length,
    withReminder: concrete.filter((task) => task.reminderEnabled).length,
  };

  return {
    tasksDoneInPeriod: done.length,
    completionRate: concrete.length > 0 ? Math.round((done.length / concrete.length) * 100) : 0,
    completionsPerDay: Math.round((done.length / periodDays) * 10) / 10,
    statusCounts,
    priorityCounts,
    topCategories,
    scheduledVsDone,
    weekdayCompletions,
    dailyDone,
    subtasks,
    recurrence,
  };
}

export async function getProductivityData(
  userId: string,
  today: Date,
  periodDays: PeriodDays,
): Promise<ProductivityData> {
  const from = subDays(today, periodDays - 1);
  const fromKey = format(from, "yyyy-MM-dd");
  const todayKey = format(today, "yyyy-MM-dd");

  const [tasks, overdue, pomodoros, gamification] = await Promise.all([
    listTasksInRange(userId, fromKey, todayKey),
    listOverdueTasks(userId, todayKey),
    countFocusSessions(userId, fromKey, todayKey),
    getGamification(userId, today),
  ]);

  return {
    periodDays,
    gamification,
    pomodorosInPeriod: pomodoros,
    overdueCount: overdue.length,
    ...computeProductivityStats(tasks, from, today, periodDays),
  };
}
