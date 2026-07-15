"use client";

import * as React from "react";
import Link from "next/link";
import { ChartColumnBig } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { fromDateKey, toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { upsertMoodAction } from "@/server/actions/personal";
import type { MoodEntry } from "@/server/services/mood";
import { MOOD_META, type Mood } from "@/shared/constants/personal";
import { moodValues } from "@/shared/schemas/personal";

export function MoodView({ entries }: { entries: MoodEntry[] }) {
  const todayKey = toDateKey(new Date());
  const todayEntry = entries.find((entry) => entry.date === todayKey) ?? null;
  const [selected, setSelected] = React.useState<Mood | null>(todayEntry?.mood ?? null);
  const [note, setNote] = React.useState(todayEntry?.note ?? "");
  const [saving, setSaving] = React.useState(false);

  async function save(mood: Mood) {
    setSelected(mood);
    setSaving(true);
    const result = await upsertMoodAction({ date: todayKey, mood, note: note || null });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Humor de hoje: ${MOOD_META[mood].emoji} ${MOOD_META[mood].label}`);
  }

  async function saveNote() {
    if (!selected) return;
    const result = await upsertMoodAction({ date: todayKey, mood: selected, note: note || null });
    if (!result.ok) toast.error(result.error);
    else toast.success("Nota salva.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="space-y-4 p-5">
        <div>
          <h2 className="font-semibold">Como você está se sentindo hoje?</h2>
          <p className="text-xs text-muted-foreground first-letter:uppercase">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {moodValues.map((mood) => {
            const meta = MOOD_META[mood];
            const active = selected === mood;
            return (
              <button
                key={mood}
                type="button"
                aria-pressed={active}
                disabled={saving}
                onClick={() => save(mood)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active
                    ? "scale-105 shadow-lg"
                    : "border-transparent bg-secondary/50 hover:bg-accent",
                )}
                style={
                  active
                    ? { borderColor: meta.color, backgroundColor: `${meta.color}1f` }
                    : undefined
                }
              >
                <span className="text-3xl" aria-hidden>
                  {meta.emoji}
                </span>
                <span className="text-xs font-medium">{meta.label}</span>
              </button>
            );
          })}
        </div>
        {selected ? (
          <div className="space-y-2">
            <Textarea
              rows={2}
              placeholder="Quer anotar o motivo? (opcional)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <Button variant="outline" size="sm" onClick={saveNote}>
              Salvar nota
            </Button>
          </div>
        ) : null}
      </Card>

      <Button asChild variant="outline" className="w-full">
        <Link href="/humor/analise">
          <ChartColumnBig aria-hidden /> Ver Análise de Humor
        </Link>
      </Button>

      {entries.length > 0 && (
        <section aria-label="Histórico" className="space-y-2.5">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Últimos registros
          </h2>
          {entries.slice(0, 14).map((entry) => {
            const meta = MOOD_META[entry.mood];
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border bg-card px-3.5 py-2.5"
              >
                <span className="text-2xl" aria-hidden>
                  {meta.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium first-letter:uppercase">
                    {format(fromDateKey(entry.date), "EEEE, dd/MM", { locale: ptBR })}
                  </p>
                  {entry.note ? (
                    <p className="truncate text-xs text-muted-foreground">{entry.note}</p>
                  ) : null}
                </div>
                <span className="text-xs font-medium" style={{ color: meta.color }}>
                  {meta.label}
                </span>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
