import { z } from "zod";

import { withApiAuth } from "@/server/api";
import { deleteNote, updateNote } from "@/server/services/notes";
import { updateNoteSchema } from "@/shared/schemas/notes";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    const input = updateNoteSchema.parse(await request.json());
    return updateNote(userId, z.uuid().parse(id), input);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    await deleteNote(userId, z.uuid().parse(id));
    return { deleted: true };
  });
}
