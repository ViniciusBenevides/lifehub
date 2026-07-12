import { withApiAuth } from "@/server/api";
import { createDream, listDreams } from "@/server/services/dreams";
import { createDreamSchema } from "@/shared/schemas/dreams";

export async function GET() {
  return withApiAuth((userId) => listDreams(userId));
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createDreamSchema.parse(await request.json());
      return createDream(userId, input);
    },
    { status: 201 },
  );
}
