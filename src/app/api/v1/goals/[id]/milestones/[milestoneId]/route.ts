import { withApiAuth } from "@/server/api";
import { deleteMilestone, updateMilestone } from "@/server/services/goals";
import { updateMilestoneSchema } from "@/shared/schemas/goals";

type Context = { params: Promise<{ id: string; milestoneId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { milestoneId } = await params;
  return withApiAuth(async (userId) => {
    const input = updateMilestoneSchema.parse(await request.json());
    return updateMilestone(userId, milestoneId, input);
  });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { milestoneId } = await params;
  return withApiAuth(async (userId) => {
    await deleteMilestone(userId, milestoneId);
    return { deleted: true };
  });
}
