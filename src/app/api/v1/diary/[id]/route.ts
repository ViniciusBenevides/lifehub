import { z } from "zod";

import { withApiAuth } from "@/server/api";
import { deleteDiaryEntry, updateDiaryEntry } from "@/server/services/diary";
import { updateDiaryEntrySchema } from "@/shared/schemas/personal";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    const input = updateDiaryEntrySchema.parse(await request.json());
    return updateDiaryEntry(userId, z.uuid().parse(id), input);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    await deleteDiaryEntry(userId, z.uuid().parse(id));
    return { deleted: true };
  });
}
