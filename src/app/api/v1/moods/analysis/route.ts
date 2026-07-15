import { withApiAuth } from "@/server/api";
import { getMoodAnalysis } from "@/server/services/mood";

export async function GET() {
  return withApiAuth(async (userId) => getMoodAnalysis(userId, new Date()));
}
