import { withApiAuth } from "@/server/api";
import { deleteTask, updateTask } from "@/server/services/tasks";
import { updateTaskSchema } from "@/shared/schemas/tasks";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    const input = updateTaskSchema.parse(await request.json());
    return updateTask(userId, id, input);
  });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(async (userId) => {
    await deleteTask(userId, id);
    return { deleted: true };
  });
}
