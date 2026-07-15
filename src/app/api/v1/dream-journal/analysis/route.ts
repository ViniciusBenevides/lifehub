import { withApiAuth } from "@/server/api";
import { getDreamAnalysis } from "@/server/services/dream-journal";

export async function GET() {
  return withApiAuth(async (userId) => getDreamAnalysis(userId));
}
