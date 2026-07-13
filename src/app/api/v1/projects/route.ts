import { withApiAuth } from "@/server/api";
import { createProject, listProjects } from "@/server/services/projects";
import { createProjectSchema, projectStatusSchema } from "@/shared/schemas/projects";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return withApiAuth(async (userId) => {
    const statusParam = searchParams.get("status");
    const status = statusParam ? projectStatusSchema.parse(statusParam) : undefined;
    return listProjects(userId, { status });
  });
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createProjectSchema.parse(await request.json());
      return createProject(userId, input);
    },
    { status: 201 },
  );
}
