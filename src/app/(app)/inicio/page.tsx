import type { Metadata } from "next";

import { HubView } from "@/components/features/hub/hub-view";
import { formatDateLong } from "@/lib/format";
import { getHubData } from "@/server/services/hub";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Início",
};

function greetingForHour(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function InicioPage() {
  const user = await requireUser();
  const now = new Date();
  const data = await getHubData(user.id, now);

  return (
    <HubView
      greeting={greetingForHour(now.getHours())}
      firstName={user.name.split(" ")[0]}
      dateLabel={formatDateLong(now)}
      data={data}
    />
  );
}
