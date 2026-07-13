import Link from "next/link";
import { Calendar, ChevronRight, Palette, Trophy } from "lucide-react";

import {
  HUB_PRIMARY_SECTIONS,
  HUB_SECONDARY_SECTIONS,
  type HubItem,
  type HubSection,
  type HubStatKey,
} from "@/components/features/hub/hub-data";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { HubData } from "@/server/services/hub";

function buildStats(data: HubData): Record<HubStatKey, string> {
  return {
    tasks:
      data.pendingTasksToday === 0
        ? data.overdueTasks > 0
          ? `${data.overdueTasks} atrasada${data.overdueTasks > 1 ? "s" : ""}`
          : "0 pendentes hoje"
        : `${data.pendingTasksToday} pendente${data.pendingTasksToday > 1 ? "s" : ""} hoje`,
    habits:
      data.habitsDueToday === 0
        ? "Nenhum para hoje"
        : `${data.habitsDoneToday}/${data.habitsDueToday} hoje`,
    goals: `${data.activeGoals} ativa${data.activeGoals === 1 ? "" : "s"}`,
    balance: `Saldo ${formatBRL(data.monthBalanceCents)}`,
    level: `Nível ${data.level.level}`,
  };
}

function HabitsBadge({ data }: { data: HubData }) {
  if (data.habitsDueToday === 0) return null;
  const complete = data.habitsDoneToday >= data.habitsDueToday;
  return (
    <span
      className={cn(
        "absolute top-3 right-3 rounded-full px-2 py-0.5 text-xs font-semibold",
        complete
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-destructive/15 text-destructive",
      )}
    >
      {data.habitsDoneToday}/{data.habitsDueToday}
    </span>
  );
}

function GridCard({
  item,
  stats,
  data,
}: {
  item: HubItem;
  stats: Record<HubStatKey, string>;
  data: HubData;
}) {
  const sublabel = item.statKey ? stats[item.statKey] : item.sublabel;

  if (item.wide) {
    return (
      <Link
        href={item.href}
        className={cn(
          "group relative col-span-2 flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all md:col-span-3",
          "hover:border-primary/30 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
      >
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105",
            item.tile,
          )}
        >
          <item.icon className="size-6" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-semibold">{item.label}</span>
          {sublabel ? (
            <span className="block truncate text-sm text-muted-foreground">{sublabel}</span>
          ) : null}
        </span>
        <ChevronRight
          className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all",
        "hover:border-primary/30 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
    >
      {item.statKey === "habits" ? <HabitsBadge data={data} /> : null}
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105",
          item.tile,
        )}
      >
        <item.icon className="size-5.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{item.label}</span>
        {sublabel ? (
          <span className="block truncate text-sm text-muted-foreground">{sublabel}</span>
        ) : null}
      </span>
    </Link>
  );
}

function ListRow({ item, stats }: { item: HubItem; stats: Record<HubStatKey, string> }) {
  const sublabel = item.statKey ? stats[item.statKey] : item.sublabel;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3.5 px-4 py-3.5 transition-colors first:rounded-t-2xl last:rounded-b-2xl",
        "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105",
          item.tile,
        )}
      >
        <item.icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{item.label}</span>
        {sublabel ? (
          <span className="block truncate text-xs text-muted-foreground">{sublabel}</span>
        ) : null}
      </span>
      <ChevronRight
        className="size-4.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}

function Section({
  section,
  stats,
  data,
}: {
  section: HubSection;
  stats: Record<HubStatKey, string>;
  data: HubData;
}) {
  return (
    <section aria-label={section.title}>
      <h2 className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {section.title}
      </h2>
      {section.layout === "grid" ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {section.items.map((item) => (
            <GridCard key={item.href} item={item} stats={stats} data={data} />
          ))}
        </div>
      ) : (
        <Card className="divide-y p-0">
          {section.items.map((item) => (
            <ListRow key={item.href} item={item} stats={stats} />
          ))}
        </Card>
      )}
    </section>
  );
}

export function HubView({
  greeting,
  firstName,
  dateLabel,
  data,
}: {
  greeting: string;
  firstName: string;
  dateLabel: string;
  data: HubData;
}) {
  const stats = buildStats(data);

  return (
    <div>
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/perfil"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-600 transition-colors dark:text-amber-400",
              "hover:bg-amber-500/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            <Trophy className="size-3.5" aria-hidden /> Nv {data.level.level}
          </Link>
          <h1 className="mt-3 truncate text-2xl font-bold tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground first-letter:uppercase">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/atividades?vista=calendario"
            aria-label="Calendário de tarefas"
            className="grid size-10 place-items-center rounded-full border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Calendar className="size-5" aria-hidden />
          </Link>
          <Link
            href="/temas"
            aria-label="Escolher tema"
            className="grid size-10 place-items-center rounded-full border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Palette className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {HUB_PRIMARY_SECTIONS.map((section) => (
            <Section key={section.title} section={section} stats={stats} data={data} />
          ))}
        </div>
        <div className="space-y-8">
          {HUB_SECONDARY_SECTIONS.map((section) => (
            <Section key={section.title} section={section} stats={stats} data={data} />
          ))}
        </div>
      </div>
    </div>
  );
}
