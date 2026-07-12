import { withApiAuth } from "@/server/api";
import { createHabit, listHabits } from "@/server/services/habits";
import { createHabitSchema } from "@/shared/schemas/habits";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("incluirInativos") === "true";
  return withApiAuth((userId) => listHabits(userId, new Date(), { includeInactive }));
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createHabitSchema.parse(await request.json());
      return createHabit(userId, input);
    },
    { status: 201 },
  );
}
