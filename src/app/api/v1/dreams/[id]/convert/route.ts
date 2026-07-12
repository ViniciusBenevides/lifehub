import { withApiAuth } from "@/server/api";
import { convertDreamToGoal } from "@/server/services/dreams";
import { convertDreamSchema } from "@/shared/schemas/dreams";

type Context = { params: Promise<{ id: string }> };

/** POST transforma o sonho em meta vinculada. Body: { lifeAreaId }. */
export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  return withApiAuth(
    async (userId) => {
      const input = convertDreamSchema.parse(await request.json());
      return convertDreamToGoal(userId, id, input.lifeAreaId);
    },
    { status: 201 },
  );
}
