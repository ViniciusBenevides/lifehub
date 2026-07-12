import { withApiAuth } from "@/server/api";
import { createCategory, listCategories } from "@/server/services/finance";
import { createCategorySchema } from "@/shared/schemas/finance";

export async function GET() {
  return withApiAuth((userId) => listCategories(userId));
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createCategorySchema.parse(await request.json());
      return createCategory(userId, input);
    },
    { status: 201 },
  );
}
