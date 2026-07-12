import { withApiAuth } from "@/server/api";
import { deleteDream, updateDream } from "@/server/services/dreams";
import { updateDreamSchema } from "@/shared/schemas/dreams";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    const input = updateDreamSchema.parse(await request.json());
    return updateDream(userId, id, input);
  });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    await deleteDream(userId, id);
    return { deleted: true };
  });
}
