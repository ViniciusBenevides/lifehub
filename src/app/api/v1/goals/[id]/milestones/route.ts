import { withApiAuth } from "@/server/api";
import { addMilestone, reorderMilestones } from "@/server/services/goals";
import { createMilestoneSchema, reorderMilestonesSchema } from "@/shared/schemas/goals";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(
    async (userId) => {
      const input = createMilestoneSchema.parse(await request.json());
      return addMilestone(userId, id, input);
    },
    { status: 201 },
  );
}

/** PATCH reordena os marcos: body { orderedIds: string[] }. */
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    const input = reorderMilestonesSchema.parse(await request.json());
    await reorderMilestones(userId, id, input.orderedIds);
    return { ok: true };
  });
}
