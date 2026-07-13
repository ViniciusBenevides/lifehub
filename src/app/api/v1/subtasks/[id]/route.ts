import { z } from "zod";

import { withApiAuth } from "@/server/api";
import { deleteSubtask, updateSubtask } from "@/server/services/tasks";
import { updateSubtaskSchema } from "@/shared/schemas/tasks";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    const input = updateSubtaskSchema.parse(await request.json());
    return updateSubtask(userId, z.uuid().parse(id), input);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    await deleteSubtask(userId, z.uuid().parse(id));
    return { deleted: true };
  });
}
