import { withApiAuth } from "@/server/api";
import { createBirthday, listBirthdays } from "@/server/services/birthdays";
import { createBirthdaySchema } from "@/shared/schemas/personal";

export async function GET() {
  return withApiAuth(async (userId) => listBirthdays(userId, new Date()));
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createBirthdaySchema.parse(await request.json());
      return createBirthday(userId, input);
    },
    { status: 201 },
  );
}
