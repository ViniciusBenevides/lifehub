import { withApiAuth } from "@/server/api";
import { deleteGoal, getGoalDetail, updateGoal } from "@/server/services/goals";
import { updateGoalSchema } from "@/shared/schemas/goals";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth((userId) => getGoalDetail(userId, id));
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    const input = updateGoalSchema.parse(await request.json());
    return updateGoal(userId, id, input);
  });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    await deleteGoal(userId, id);
    return { deleted: true };
  });
}
