import { withApiAuth } from "@/server/api";
import { createTransaction, listTransactions } from "@/server/services/finance";
import { createTransactionSchema, transactionFiltersSchema } from "@/shared/schemas/finance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return withApiAuth((userId) => {
    const filters = transactionFiltersSchema.parse({
      month: searchParams.get("mes") ?? undefined,
      categoryId: searchParams.get("categoria") ?? undefined,
      type: searchParams.get("tipo") ?? undefined,
      search: searchParams.get("busca") ?? undefined,
    });
    return listTransactions(userId, filters);
  });
}

export async function POST(request: Request) {
  return withApiAuth(
    async (userId) => {
      const input = createTransactionSchema.parse(await request.json());
      return createTransaction(userId, input);
    },
    { status: 201 },
  );
}
