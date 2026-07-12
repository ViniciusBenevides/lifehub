import { format } from "date-fns";
import { z } from "zod";

import { withApiAuth } from "@/server/api";
import { createTask, listOverdueTasks, listTasksInRange } from "@/server/services/tasks";
import { createTaskSchema } from "@/shared/schemas/tasks";

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return withApiAuth(async (userId) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const from = dateKey.parse(searchParams.get("de") ?? today);
    const to = dateKey.parse(searchParams.get("ate") ?? from);
    const [tasks, overdue] = await Promise.all([
      listTasksInRange(userId, from, to),
      searchParams.get("incluirAtrasadas") === "true"
        ? listOverdueTasks(userId, today)
        : Promise.resolve([]),
    ]);
    return { tasks, overdue };
  });
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createTaskSchema.parse(await request.json());
      return createTask(userId, input);
    },
    { status: 201 },
  );
}
