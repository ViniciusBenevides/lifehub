import { withApiAuth } from "@/server/api";
import { exportUserData, importUserData } from "@/server/services/backup";

export async function GET() {
  return withApiAuth(async (userId) => exportUserData(userId));
}

export async function POST(request: Request) {
  return withApiAuth(async (userId) => {
    const payload = await request.json();
    return importUserData(userId, payload);
  });
}
