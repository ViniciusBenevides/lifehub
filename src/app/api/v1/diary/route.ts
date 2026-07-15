import { withApiAuth } from "@/server/api";
import { createDiaryEntry, listDiaryEntries } from "@/server/services/diary";
import { createDiaryEntrySchema } from "@/shared/schemas/personal";

export async function GET() {
  return withApiAuth(async (userId) => listDiaryEntries(userId));
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createDiaryEntrySchema.parse(await request.json());
      return createDiaryEntry(userId, input);
    },
    { status: 201 },
  );
}
