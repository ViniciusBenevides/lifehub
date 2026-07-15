import { withApiAuth } from "@/server/api";
import { createDreamEntry, listDreamEntries } from "@/server/services/dream-journal";
import { createDreamEntrySchema } from "@/shared/schemas/personal";

export async function GET() {
  return withApiAuth(async (userId) => listDreamEntries(userId));
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createDreamEntrySchema.parse(await request.json());
      return createDreamEntry(userId, input);
    },
    { status: 201 },
  );
}
