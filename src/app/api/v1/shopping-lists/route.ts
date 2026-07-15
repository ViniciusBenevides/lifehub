import { withApiAuth } from "@/server/api";
import { createShoppingList, listShoppingLists } from "@/server/services/shopping";
import { createShoppingListSchema } from "@/shared/schemas/shopping";

export async function GET() {
  return withApiAuth(async (userId) => listShoppingLists(userId));
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createShoppingListSchema.parse(await request.json());
      return createShoppingList(userId, input);
    },
    { status: 201 },
  );
}
