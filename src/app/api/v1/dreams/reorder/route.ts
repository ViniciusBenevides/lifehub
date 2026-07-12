import { withApiAuth } from "@/server/api";
import { reorderDreams } from "@/server/services/dreams";
import { reorderDreamsSchema } from "@/shared/schemas/dreams";

export async function PATCH(request: Request) {
  return withApiAuth(async (userId) => {
    const input = reorderDreamsSchema.parse(await request.json());
    await reorderDreams(userId, input.orderedIds);
    return { ok: true };
  });
}
