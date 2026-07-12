import { format } from "date-fns";

import { withApiAuth } from "@/server/api";
import { getMonthlyFlow, getMonthOverview } from "@/server/services/finance";
import { monthKeySchema } from "@/shared/schemas/finance";

/** Visão mensal completa: totais, transações, categorias, orçamentos e fluxo. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return withApiAuth(async (userId) => {
    const month = monthKeySchema.parse(searchParams.get("mes") ?? format(new Date(), "yyyy-MM"));
    const [overview, flow] = await Promise.all([
      getMonthOverview(userId, month),
      getMonthlyFlow(userId, month, 6),
    ]);
    return { ...overview, flow };
  });
}
