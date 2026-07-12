import { withApiAuth } from "@/server/api";
import { getUserHeatmap } from "@/server/services/habits";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(730, Math.max(7, Number(searchParams.get("dias")) || 365));
  return withApiAuth((userId) => getUserHeatmap(userId, new Date(), days));
}
