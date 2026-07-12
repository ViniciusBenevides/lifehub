import { format } from "date-fns";

import { withApiAuth } from "@/server/api";
import { budgetsForMonth, upsertBudget } from "@/server/services/finance";
import { monthKeySchema, upsertBudgetSchema } from "@/shared/schemas/finance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return withApiAuth((userId) => {
    const month = monthKeySchema.parse(searchParams.get("mes") ?? format(new Date(), "yyyy-MM"));
    return budgetsForMonth(userId, month);
  });
}

/** PUT cria ou atualiza o orçamento (categoria + mês). */
export async function PUT(request: Request) {
  return withApiAuth(async (userId) => {
    const input = upsertBudgetSchema.parse(await request.json());
    return upsertBudget(userId, input);
  });
}
