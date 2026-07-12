import { withApiAuth } from "@/server/api";
import { getDashboardData } from "@/server/services/dashboard";

export async function GET() {
  return withApiAuth((userId) => getDashboardData(userId, new Date()));
}
