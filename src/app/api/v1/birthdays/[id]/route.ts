import { z } from "zod";

import { withApiAuth } from "@/server/api";
import { deleteBirthday, updateBirthday } from "@/server/services/birthdays";
import { updateBirthdaySchema } from "@/shared/schemas/personal";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    const input = updateBirthdaySchema.parse(await request.json());
    return updateBirthday(userId, z.uuid().parse(id), input);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    await deleteBirthday(userId, z.uuid().parse(id));
    return { deleted: true };
  });
}
