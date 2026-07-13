import { withApiAuth } from "@/server/api";
import { createNote, listNotes } from "@/server/services/notes";
import { createNoteSchema, noteCategorySchema } from "@/shared/schemas/notes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return withApiAuth(async (userId) => {
    const categoryParam = searchParams.get("categoria");
    const category = categoryParam ? noteCategorySchema.parse(categoryParam) : undefined;
    const search = searchParams.get("busca") ?? undefined;
    return listNotes(userId, { category, search });
  });
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createNoteSchema.parse(await request.json());
      return createNote(userId, input);
    },
    { status: 201 },
  );
}
