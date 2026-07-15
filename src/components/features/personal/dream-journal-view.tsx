"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  ChartColumnBig,
  Columns3,
  List,
  MoonStar,
  Plus,
  Sparkles,
  Star,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { addMonths, format, getDay, getDaysInMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { fromDateKey, toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createDreamEntryAction,
  deleteDreamEntryAction,
  updateDreamEntryAction,
} from "@/server/actions/personal";
import type { DreamEntry } from "@/server/services/dream-journal";
import { MOOD_META, type Mood } from "@/shared/constants/personal";
import { createDreamEntrySchema, moodValues } from "@/shared/schemas/personal";

const VIEWS = [
  { value: "lista", label: "Lista", icon: List },
  { value: "semana", label: "Semana", icon: Columns3 },
  { value: "calendario", label: "Calendário", icon: Calendar },
] as const;

type DreamView = (typeof VIEWS)[number]["value"];

function DreamDialog({
  entry,
  open,
  onOpenChange,
  trigger,
}: {
  entry?: DreamEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}) {
  const isEdit = Boolean(entry);
  const [date, setDate] = React.useState(entry?.date ?? toDateKey(new Date()));
  const [title, setTitle] = React.useState(entry?.title ?? "");
  const [description, setDescription] = React.useState(entry?.description ?? "");
  const [lucid, setLucid] = React.useState(entry?.lucid ?? false);
  const [nightmare, setNightmare] = React.useState(entry?.nightmare ?? false);
  const [clarity, setClarity] = React.useState(entry?.clarity ?? 3);
  const [mood, setMood] = React.useState<Mood | null>(entry?.mood ?? null);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = createDreamEntrySchema.safeParse({
      date,
      title,
      description: description || null,
      lucid,
      nightmare,
      clarity,
      mood,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateDreamEntryAction(entry!.id, parsed.data)
      : await createDreamEntryAction(parsed.data);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEdit ? "Sonho atualizado." : "Sonho registrado! 🌙");
    onOpenChange(false);
    if (!isEdit) {
      setTitle("");
      setDescription("");
      setLucid(false);
      setNightmare(false);
      setClarity(3);
      setMood(null);
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar Sonho" : "Registrar Sonho"}
      description="Anote assim que acordar para não esquecer"
      trigger={trigger}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="dream-date">Data</FieldLabel>
              <Input
                id="dream-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="dream-title">Título</FieldLabel>
              <Input
                id="dream-title"
                placeholder="Voando sobre a cidade"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                autoFocus={!isEdit}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="dream-description">Descrição (opcional)</FieldLabel>
            <Textarea
              id="dream-description"
              rows={4}
              placeholder="Descreva o que você lembra do sonho..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          <div className="space-y-3 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-violet-500" aria-hidden /> Sonho lúcido
              </span>
              <Switch checked={lucid} onCheckedChange={setLucid} aria-label="Sonho lúcido" />
            </div>
            <div className="flex items-center justify-between gap-3 border-t pt-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <TriangleAlert className="size-4 text-red-500" aria-hidden /> Pesadelo
              </span>
              <Switch checked={nightmare} onCheckedChange={setNightmare} aria-label="Pesadelo" />
            </div>
          </div>
          <Field>
            <FieldLabel>Clareza da lembrança</FieldLabel>
            <div
              className="flex items-center gap-1.5"
              role="radiogroup"
              aria-label="Clareza (0 a 5)"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={clarity === value}
                  aria-label={`${value} de 5`}
                  onClick={() => setClarity(value)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "size-7",
                      value <= clarity
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30",
                    )}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <FieldLabel>Humor do sonho (opcional)</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {moodValues.map((value) => {
                const meta = MOOD_META[value];
                const active = mood === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMood(active ? null : value)}
                    className={cn(
                      "grid size-11 place-items-center rounded-xl border-2 text-xl transition-all",
                      active ? "scale-110" : "border-transparent bg-secondary/50 hover:bg-accent",
                    )}
                    style={active ? { borderColor: meta.color } : undefined}
                    title={meta.label}
                  >
                    {meta.emoji}
                  </button>
                );
              })}
            </div>
          </Field>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="bg-violet-600 text-white hover:bg-violet-600/90"
          >
            {saving ? <Spinner /> : null}
            {isEdit ? "Salvar Alterações" : "Registrar Sonho"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

function DreamCard({ entry }: { entry: DreamEntry }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const meta = entry.mood ? MOOD_META[entry.mood] : null;

  async function handleDelete() {
    const result = await deleteDreamEntryAction(entry.id);
    if (!result.ok) toast.error(result.error);
    else toast.success("Sonho excluído.");
  }

  return (
    <div className="group rounded-2xl border bg-card p-4 transition-all hover:border-violet-500/40">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
            {format(fromDateKey(entry.date), "EEE, dd/MM/yyyy", { locale: ptBR })}
          </p>
          <h3 className="mt-0.5 font-semibold">{entry.title}</h3>
          {entry.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{entry.description}</p>
          ) : null}
          <span className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {entry.lucid ? (
              <span className="rounded-full bg-violet-500/15 px-2 py-0.5 font-medium text-violet-600 dark:text-violet-400">
                ✨ Lúcido
              </span>
            ) : null}
            {entry.nightmare ? (
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-medium text-red-500">
                ⚠️ Pesadelo
              </span>
            ) : null}
            <span
              className="flex items-center gap-0.5 text-amber-500"
              aria-label={`Clareza ${entry.clarity} de 5`}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    "size-3",
                    index < entry.clarity ? "fill-current" : "text-muted-foreground/30",
                  )}
                  aria-hidden
                />
              ))}
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          {meta ? (
            <span className="text-2xl" title={meta.label} aria-label={`Humor: ${meta.label}`}>
              {meta.emoji}
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Excluir sonho"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
      <DreamDialog entry={entry} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}

export function DreamJournalView({ entries }: { entries: DreamEntry[] }) {
  const [view, setView] = React.useState<DreamView>("lista");
  const [newOpen, setNewOpen] = React.useState(false);
  const [monthKey, setMonthKey] = React.useState(() => format(new Date(), "yyyy-MM"));
  const [selectedDay, setSelectedDay] = React.useState(() => toDateKey(new Date()));

  const weekStart = toDateKey(subDays(new Date(), 6));
  const weekEntries = entries.filter((entry) => entry.date >= weekStart);

  const monthStart = fromDateKey(`${monthKey}-01`);
  const daysInMonth = getDaysInMonth(monthStart);
  const firstWeekday = getDay(monthStart);
  const byDay = new Map<string, DreamEntry[]>();
  for (const entry of entries) {
    const list = byDay.get(entry.date) ?? [];
    list.push(entry);
    byDay.set(entry.date, list);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="radiogroup"
          aria-label="Visualização"
          className="flex w-fit [scrollbar-width:none] gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        >
          {VIEWS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={view === option.value}
              onClick={() => setView(option.value)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                view === option.value
                  ? "border-transparent bg-violet-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <option.icon className="size-4" aria-hidden />
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/diario-sonhos/analise">
              <ChartColumnBig aria-hidden /> Análise
            </Link>
          </Button>
          {entries.length > 0 && (
            <DreamDialog
              open={newOpen}
              onOpenChange={setNewOpen}
              trigger={
                <Button size="sm" className="bg-violet-600 text-white hover:bg-violet-600/90">
                  <Plus aria-hidden /> Registrar
                </Button>
              }
            />
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="bg-violet-500/15 text-violet-600 dark:text-violet-400"
            >
              <MoonStar aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Nenhum sonho registrado</EmptyTitle>
            <EmptyDescription>Registre seus sonhos ao acordar</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <DreamDialog
              open={newOpen}
              onOpenChange={setNewOpen}
              trigger={
                <Button className="bg-violet-600 text-white hover:bg-violet-600/90">
                  <Plus aria-hidden /> Adicionar Primeiro Sonho
                </Button>
              }
            />
          </EmptyContent>
        </Empty>
      ) : view === "lista" ? (
        <div className="space-y-3">
          {entries.map((entry) => (
            <DreamCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : view === "semana" ? (
        weekEntries.length === 0 ? (
          <p className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            Nenhum sonho nos últimos 7 dias.
          </p>
        ) : (
          <div className="space-y-3">
            {weekEntries.map((entry) => (
              <DreamCard key={entry.id} entry={entry} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonthKey(format(addMonths(monthStart, -1), "yyyy-MM"))}
                aria-label="Mês anterior"
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                ‹
              </button>
              <p className="text-sm font-semibold capitalize">
                {format(monthStart, "MMMM yyyy", { locale: ptBR })}
              </p>
              <button
                type="button"
                onClick={() => setMonthKey(format(addMonths(monthStart, 1), "yyyy-MM"))}
                aria-label="Próximo mês"
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                ›
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((weekday) => (
                <span key={weekday} className="py-1 text-xs font-medium text-muted-foreground">
                  {weekday}
                </span>
              ))}
              {Array.from({ length: firstWeekday }).map((_, index) => (
                <span key={`empty-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dayKey = `${monthKey}-${String(day).padStart(2, "0")}`;
                const has = (byDay.get(dayKey)?.length ?? 0) > 0;
                const isSelected = selectedDay === dayKey;
                return (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => setSelectedDay(dayKey)}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative mx-auto grid size-9 place-items-center rounded-xl text-sm transition-colors",
                      isSelected
                        ? "border border-violet-500 bg-violet-500/10 font-semibold text-violet-600 dark:text-violet-400"
                        : "hover:bg-accent",
                    )}
                  >
                    {day}
                    {has && (
                      <span
                        className="absolute bottom-1 size-1.5 rounded-full bg-violet-500"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
          <div className="space-y-3">
            {(byDay.get(selectedDay) ?? []).map((entry) => (
              <DreamCard key={entry.id} entry={entry} />
            ))}
            {(byDay.get(selectedDay)?.length ?? 0) === 0 && (
              <p className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
                Nenhum sonho neste dia.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
