import { z } from "zod";

import { withApiAuth } from "@/server/api";
import { deleteShoppingItem, updateShoppingItem } from "@/server/services/shopping";
import { updateShoppingItemSchema } from "@/shared/schemas/shopping";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    const input = updateShoppingItemSchema.parse(await request.json());
    return updateShoppingItem(userId, z.uuid().parse(id), input);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    await deleteShoppingItem(userId, z.uuid().parse(id));
    return { deleted: true };
  });
}
