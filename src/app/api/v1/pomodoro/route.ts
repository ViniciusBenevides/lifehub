import { format } from "date-fns";
import { z } from "zod";

import { withApiAuth } from "@/server/api";
import { getPomodoroDayStats, recordPomodoroSession } from "@/server/services/pomodoro";
import { recordPomodoroSchema } from "@/shared/schemas/pomodoro";

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return withApiAuth(async (userId) => {
    const date = dateKey.parse(searchParams.get("data") ?? format(new Date(), "yyyy-MM-dd"));
    return getPomodoroDayStats(userId, date);
  });
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = recordPomodoroSchema.parse(await request.json());
      return recordPomodoroSession(userId, input);
    },
    { status: 201 },
  );
}
