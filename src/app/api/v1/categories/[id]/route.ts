import { withApiAuth } from "@/server/api";
import { deleteCategory, updateCategory } from "@/server/services/finance";
import { updateCategorySchema } from "@/shared/schemas/finance";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    const input = updateCategorySchema.parse(await request.json());
    return updateCategory(userId, id, input);
  });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    await deleteCategory(userId, id);
    return { deleted: true };
  });
}
