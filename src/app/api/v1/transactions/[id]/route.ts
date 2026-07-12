import { withApiAuth } from "@/server/api";
import { deleteTransaction, updateTransaction } from "@/server/services/finance";
import { updateTransactionSchema } from "@/shared/schemas/finance";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    const input = updateTransactionSchema.parse(await request.json());
    return updateTransaction(userId, id, input);
  });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    await deleteTransaction(userId, id);
    return { deleted: true };
  });
}
