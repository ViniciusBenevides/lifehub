import { withApiAuth } from "@/server/api";
import { deleteBudget } from "@/server/services/finance";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    await deleteBudget(userId, id);
    return { deleted: true };
  });
}
