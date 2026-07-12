import { withApiAuth } from "@/server/api";
import { toggleHabitLog } from "@/server/services/habits";
import { toggleHabitLogSchema } from "@/shared/schemas/habits";

type Context = { params: Promise<{ id: string }> };

/** PUT marca/desmarca o hábito na data: body { date: "AAAA-MM-DD", done: boolean }. */
export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    const input = toggleHabitLogSchema.parse(await request.json());
    await toggleHabitLog(userId, id, input.date, input.done);
    return { ok: true };
  });
}
