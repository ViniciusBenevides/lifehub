import { withApiAuth } from "@/server/api";
import { createStudyPlan, listStudyPlanOverviews } from "@/server/services/study";
import { createStudyPlanSchema } from "@/shared/schemas/study";

export async function GET() {
  return withApiAuth(async (userId) => listStudyPlanOverviews(userId, new Date()));
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createStudyPlanSchema.parse(await request.json());
      return createStudyPlan(userId, input);
    },
    { status: 201 },
  );
}
