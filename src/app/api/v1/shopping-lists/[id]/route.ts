import { z } from "zod";

import { withApiAuth } from "@/server/api";
import {
  createShoppingItem,
  deleteShoppingList,
  updateShoppingList,
} from "@/server/services/shopping";
import { createShoppingItemSchema, updateShoppingListSchema } from "@/shared/schemas/shopping";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    const input = updateShoppingListSchema.parse(await request.json());
    return updateShoppingList(userId, z.uuid().parse(id), input);
  });
}

export async function POST(request: Request, { params }: Params) {
  return withApiAuth(
    async (userId) => {
      const { id } = await params;
      const input = createShoppingItemSchema.parse(await request.json());
      return createShoppingItem(userId, z.uuid().parse(id), input);
    },
    { status: 201 },
  );
}

export async function DELETE(_request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    await deleteShoppingList(userId, z.uuid().parse(id));
    return { deleted: true };
  });
}
