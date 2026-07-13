import { format } from "date-fns";

import { getLevelInfo, type LevelInfo } from "@/server/services/gamification";
import { getMonthOverview } from "@/server/services/finance";
import { listGoals } from "@/server/services/goals";
import { listHabits } from "@/server/services/habits";
import { listOverdueTasks, listTasksInRange } from "@/server/services/tasks";

export type HubData = {
  pendingTasksToday: number;
  overdueTasks: number;
  habitsDoneToday: number;
  habitsDueToday: number;
  activeGoals: number;
  monthBalanceCents: number;
  level: LevelInfo;
};

/** Aggregated counters for the home hub, fetched in parallel (no waterfalls). */
export async function getHubData(userId: string, today: Date): Promise<HubData> {
  const todayKey = format(today, "yyyy-MM-dd");
  const month = format(today, "yyyy-MM");

  const [todayTasks, overdue, habits, activeGoals, overview, level] = await Promise.all([
    listTasksInRange(userId, todayKey, todayKey),
    listOverdueTasks(userId, todayKey),
    listHabits(userId, today),
    listGoals(userId, { status: "active" }),
    getMonthOverview(userId, month),
    getLevelInfo(userId),
  ]);

  const concreteToday = todayTasks.filter((task) => task.recurrenceRule == null);
  const dueHabits = habits.filter((habit) => habit.scheduledToday);

  return {
    pendingTasksToday: concreteToday.filter((task) => task.status === "todo").length,
    overdueTasks: overdue.length,
    habitsDoneToday: dueHabits.filter((habit) => habit.doneToday).length,
    habitsDueToday: dueHabits.length,
    activeGoals: activeGoals.length,
    monthBalanceCents: overview.balanceCents,
    level,
  };
}
