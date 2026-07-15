import { withApiAuth } from "@/server/api";
import { listMoods, upsertMood } from "@/server/services/mood";
import { upsertMoodSchema } from "@/shared/schemas/personal";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return withApiAuth(async (userId) =>
    listMoods(userId, {
      from: searchParams.get("de") ?? undefined,
      to: searchParams.get("ate") ?? undefined,
    }),
  );
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = upsertMoodSchema.parse(await request.json());
      return upsertMood(userId, input);
    },
    { status: 201 },
  );
}
