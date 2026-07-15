import { z } from "zod";

import { withApiAuth } from "@/server/api";
import { deleteDreamEntry, updateDreamEntry } from "@/server/services/dream-journal";
import { updateDreamEntrySchema } from "@/shared/schemas/personal";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    const input = updateDreamEntrySchema.parse(await request.json());
    return updateDreamEntry(userId, z.uuid().parse(id), input);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    await deleteDreamEntry(userId, z.uuid().parse(id));
    return { deleted: true };
  });
}
