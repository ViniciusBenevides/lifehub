import { z } from "zod";

import { withApiAuth } from "@/server/api";
import { deleteProject, getProject, updateProject } from "@/server/services/projects";
import { updateProjectSchema } from "@/shared/schemas/projects";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    return getProject(userId, z.uuid().parse(id));
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    const input = updateProjectSchema.parse(await request.json());
    return updateProject(userId, z.uuid().parse(id), input);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withApiAuth(async (userId) => {
    const { id } = await params;
    await deleteProject(userId, z.uuid().parse(id));
    return { deleted: true };
  });
}
