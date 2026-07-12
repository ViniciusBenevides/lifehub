import type { Metadata } from "next";

import { ComingSoon } from "@/components/features/shell/coming-soon";
import { formatDateLong } from "@/lib/format";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

function greetingForHour(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greetingForHour(now.getHours())}, {firstName}!
        </h1>
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          {formatDateLong(now)}
        </p>
      </header>
      <ComingSoon module="resumo do seu dia" />
    </div>
  );
}
