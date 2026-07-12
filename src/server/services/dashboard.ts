import { format } from "date-fns";

import { listDreams, type DreamWithGoal } from "@/server/services/dreams";
import { getMonthlyFlow, getMonthOverview, type MonthFlowPoint } from "@/server/services/finance";
import { listGoals, type GoalWithMeta } from "@/server/services/goals";
import {
  getUserHeatmap,
  listHabits,
  type HabitWithStatus,
  type HeatmapDay,
} from "@/server/services/habits";
import { listOverdueTasks, listTasksInRange, type TaskWithGoal } from "@/server/services/tasks";

export type DashboardData = {
  habits: HabitWithStatus[];
  todayTasks: TaskWithGoal[];
  overdueTasks: TaskWithGoal[];
  monthIncomeCents: number;
  monthExpenseCents: number;
  monthBalanceCents: number;
  activeGoals: GoalWithMeta[];
  averageGoalProgress: number;
  heatmap90: HeatmapDay[];
  flow: MonthFlowPoint[];
  dreams: DreamWithGoal[];
};

/** Agrega tudo que o dashboard precisa em chamadas paralelas (sem waterfall). */
export async function getDashboardData(userId: string, today: Date): Promise<DashboardData> {
  const todayKey = format(today, "yyyy-MM-dd");
  const month = format(today, "yyyy-MM");

  const [habits, todayTasks, overdueTasks, overview, activeGoals, heatmap90, flow, dreams] =
    await Promise.all([
      listHabits(userId, today),
      listTasksInRange(userId, todayKey, todayKey),
      listOverdueTasks(userId, todayKey),
      getMonthOverview(userId, month),
      listGoals(userId, { status: "active" }),
      getUserHeatmap(userId, today, 90),
      getMonthlyFlow(userId, month, 6),
      listDreams(userId),
    ]);

  const averageGoalProgress =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce((sum, goal) => sum + goal.progressPercent, 0) / activeGoals.length,
        )
      : 0;

  return {
    habits,
    todayTasks: todayTasks.filter((task) => task.recurrenceRule == null),
    overdueTasks,
    monthIncomeCents: overview.incomeCents,
    monthExpenseCents: overview.expenseCents,
    monthBalanceCents: overview.balanceCents,
    activeGoals,
    averageGoalProgress,
    heatmap90,
    flow,
    dreams: dreams.filter((dream) => dream.status !== "achieved").slice(0, 8),
  };
}
