import { withApiAuth } from "@/server/api";
import { deleteHabit, getHabitDetail, updateHabit } from "@/server/services/habits";
import { updateHabitSchema } from "@/shared/schemas/habits";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth((userId) => getHabitDetail(userId, id, new Date()));
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    const input = updateHabitSchema.parse(await request.json());
    return updateHabit(userId, id, input);
  });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    await deleteHabit(userId, id);
    return { deleted: true };
  });
}
