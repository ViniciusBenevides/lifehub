import { z } from "zod";

import { withApiAuth } from "@/server/api";
import { createSubtask, listSubtasks } from "@/server/services/tasks";
import { createSubtaskSchema } from "@/shared/schemas/tasks";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    return listSubtasks(userId, z.uuid().parse(id));
  });
}

export async function POST(request: Request, { params }: Params) {
  return withApiAuth(
    async (userId) => {
      const { id } = await params;
      const input = createSubtaskSchema.parse(await request.json());
      return createSubtask(userId, z.uuid().parse(id), input);
    },
    { status: 201 },
  );
}
