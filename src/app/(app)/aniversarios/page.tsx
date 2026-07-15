import type { Metadata } from "next";
import { Cake } from "lucide-react";

import { BirthdayRow, NewBirthdayButton } from "@/components/features/personal/birthday-dialog";
import { PageHeader } from "@/components/features/shell/page-header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { listBirthdays } from "@/server/services/birthdays";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Aniversários",
};

export default async function AniversariosPage() {
  const user = await requireUser();
  const birthdays = await listBirthdays(user.id, new Date());
  const upcoming = birthdays.filter((birthday) => birthday.daysUntil <= 30);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Aniversários"
        description={
          birthdays.length > 0
            ? `${birthdays.length} data${birthdays.length === 1 ? "" : "s"} · ${upcoming.length} nos próximos 30 dias`
            : "Nunca mais esqueça uma data especial."
        }
      >
        {birthdays.length > 0 && <NewBirthdayButton />}
      </PageHeader>

      {birthdays.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-pink-500/15 text-pink-600 dark:text-pink-400">
              <Cake aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Nenhum aniversário cadastrado</EmptyTitle>
            <EmptyDescription>
              Adicione aniversários de pessoas importantes e nunca mais esqueça uma data especial!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewBirthdayButton first />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-2.5">
          {birthdays.map((birthday) => (
            <BirthdayRow key={birthday.id} birthday={birthday} />
          ))}
        </div>
      )}
    </div>
  );
}
