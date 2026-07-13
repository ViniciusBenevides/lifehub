import { withApiAuth } from "@/server/api";
import { createTaskCategory, listTaskCategories } from "@/server/services/tasks";
import { createTaskCategorySchema } from "@/shared/schemas/tasks";

export async function GET() {
  return withApiAuth(async (userId) => listTaskCategories(userId));
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createTaskCategorySchema.parse(await request.json());
      return createTaskCategory(userId, input);
    },
    { status: 201 },
  );
}
