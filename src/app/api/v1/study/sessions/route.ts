import { withApiAuth } from "@/server/api";
import { logStudySession } from "@/server/services/study";
import { logStudySessionSchema } from "@/shared/schemas/study";

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = logStudySessionSchema.parse(await request.json());
      return logStudySession(userId, input);
    },
    { status: 201 },
  );
}
