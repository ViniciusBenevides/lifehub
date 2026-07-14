import type { Metadata } from "next";

import { PomodoroView } from "@/components/features/pomodoro/pomodoro-view";
import { PageHeader } from "@/components/features/shell/page-header";
import { toDateKey } from "@/lib/format";
import { getPomodoroDayStats } from "@/server/services/pomodoro";
import { listTasksInRange } from "@/server/services/tasks";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Pomodoro",
};

export default async function PomodoroPage() {
  const user = await requireUser();
  const todayKey = toDateKey(new Date());
  const [stats, todayTasks] = await Promise.all([
    getPomodoroDayStats(user.id, todayKey),
    listTasksInRange(user.id, todayKey, todayKey),
  ]);
  const taskOptions = todayTasks
    .filter((task) => task.status !== "done" && task.recurrenceRule == null)
    .map((task) => ({ id: task.id, title: task.title }));

  return (
    <>
      <PageHeader title="Pomodoro" description="Sessões de foco com pausas inteligentes." />
      <PomodoroView todayStats={stats} taskOptions={taskOptions} />
    </>
  );
}
