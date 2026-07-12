import { withApiAuth } from "@/server/api";
import { listLifeAreas } from "@/server/services/goals";

export async function GET() {
  return withApiAuth((userId) => listLifeAreas(userId));
}
