import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookMarked, Calendar, Flame, Lightbulb, Smile } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getMoodAnalysis } from "@/server/services/mood";
import { MOOD_META } from "@/shared/constants/personal";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Análise de Humor",
};

export default async function AnaliseHumorPage() {
  const user = await requireUser();
  const analysis = await getMoodAnalysis(user.id, new Date());
  const mostFrequent = analysis.mostFrequent ? MOOD_META[analysis.mostFrequent] : null;

  const stats = [
    {
      label: "Total",
      value: String(analysis.total),
      icon: BookMarked,
      tint: "text-pink-600 dark:text-pink-400",
    },
    {
      label: "Sequência",
      value: String(analysis.streak),
      icon: Flame,
      tint: "text-amber-500",
    },
    {
      label: "Por Semana",
      value: String(analysis.lastWeek),
      icon: Calendar,
      tint: "text-blue-500",
    },
    {
      label: "Humor + Freq",
      value: mostFrequent ? mostFrequent.emoji : "—",
      icon: Smile,
      tint: "text-purple-500",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/humor"
          aria-label="Voltar para Humor"
          className="grid size-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="size-4.5" aria-hidden />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Análise de Humor</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex flex-col items-center gap-1.5 p-5">
            <stat.icon className={`size-6 ${stat.tint}`} aria-hidden />
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <section aria-label="Distribuição de humor" className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight">Distribuição de Humor</h2>
        {analysis.distribution.length === 0 ? (
          <p className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
            Registre seu humor para ver a distribuição.
          </p>
        ) : (
          <Card className="space-y-4 p-4">
            {analysis.distribution.map((item) => {
              const meta = MOOD_META[item.mood];
              return (
                <div key={item.mood} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="text-xl" aria-hidden>
                        {meta.emoji}
                      </span>
                      {meta.label}
                    </span>
                    <span className="font-semibold" style={{ color: meta.color }}>
                      {item.count} ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.percent}%`, backgroundColor: meta.color }}
                      aria-hidden
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </section>

      <Card className="flex items-start gap-3 border-pink-500/30 bg-pink-500/10 p-4">
        <Lightbulb
          className="mt-0.5 size-5 shrink-0 text-pink-600 dark:text-pink-400"
          aria-hidden
        />
        <div>
          <p className="font-semibold text-pink-600 dark:text-pink-400">
            {analysis.streak >= 3 ? "Continue assim!" : "Crie o hábito!"}
          </p>
          <p className="text-sm text-muted-foreground">
            Registrar diariamente ajuda a entender suas emoções.
          </p>
        </div>
      </Card>
    </div>
  );
}
