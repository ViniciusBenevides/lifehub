import { withApiAuth } from "@/server/api";
import { createGoal, listGoals } from "@/server/services/goals";
import { createGoalSchema, goalFiltersSchema } from "@/shared/schemas/goals";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return withApiAuth((userId) => {
    const filters = goalFiltersSchema.parse({
      status: searchParams.get("status") ?? undefined,
      lifeAreaId: searchParams.get("lifeAreaId") ?? undefined,
    });
    return listGoals(userId, filters);
  });
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createGoalSchema.parse(await request.json());
      return createGoal(userId, input);
    },
    { status: 201 },
  );
}
