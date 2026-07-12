import { withApiAuth } from "@/server/api";
import { completeGoal, updateGoalProgress } from "@/server/services/goals";
import { updateGoalProgressSchema } from "@/shared/schemas/goals";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    const input = updateGoalProgressSchema.parse(await request.json());
    return updateGoalProgress(userId, id, input.currentValue);
  });
}

/** POST marca a meta como concluída. */
export async function POST(_request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth((userId) => completeGoal(userId, id));
}
