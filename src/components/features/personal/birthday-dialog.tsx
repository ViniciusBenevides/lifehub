"use client";

import * as React from "react";
import { Cake, Check, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { fromDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createBirthdayAction,
  deleteBirthdayAction,
  updateBirthdayAction,
} from "@/server/actions/personal";
import type { BirthdayWithNext } from "@/server/services/birthdays";
import { RELATIONSHIP_META, type BirthdayRelationship } from "@/shared/constants/personal";
import { birthdayRelationshipValues, createBirthdaySchema } from "@/shared/schemas/personal";

export function BirthdayDialog({
  birthday,
  open,
  onOpenChange,
  trigger,
}: {
  birthday?: BirthdayWithNext;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}) {
  const isEdit = Boolean(birthday);
  const [name, setName] = React.useState(birthday?.name ?? "");
  const [birthDate, setBirthDate] = React.useState(birthday?.birthDate ?? "");
  const [relationship, setRelationship] = React.useState<BirthdayRelationship>(
    birthday?.relationship ?? "familia",
  );
  const [notes, setNotes] = React.useState(birthday?.notes ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = createBirthdaySchema.safeParse({
      name,
      birthDate,
      relationship,
      notes: notes || null,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateBirthdayAction(birthday!.id, parsed.data)
      : await createBirthdayAction(parsed.data);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEdit ? "Aniversário atualizado." : "Aniversário salvo! 🎂");
    onOpenChange(false);
    if (!isEdit) {
      setName("");
      setBirthDate("");
      setNotes("");
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar Aniversário" : "Novo Aniversário"}
      description="Nunca mais esqueça datas importantes"
      trigger={trigger}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="birthday-name">Nome</FieldLabel>
            <Input
              id="birthday-name"
              placeholder="Ex: Maria Silva"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus={!isEdit}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="birthday-date">Data de Nascimento</FieldLabel>
            <Input
              id="birthday-date"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Relacionamento</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {birthdayRelationshipValues.map((value) => {
                const active = relationship === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setRelationship(value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      active ? "border-transparent bg-pink-600 text-white" : "hover:bg-accent",
                    )}
                  >
                    {active ? <Check className="size-3.5" aria-hidden /> : null}
                    {RELATIONSHIP_META[value]}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="birthday-notes">Notas (Opcional)</FieldLabel>
            <Textarea
              id="birthday-notes"
              placeholder="Ex: Presente favorito, gostos, alergias..."
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>
          {error ? <FieldError>{error}</FieldError> : null}
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="bg-pink-600 text-white hover:bg-pink-600/90"
          >
            {saving ? <Spinner /> : <Check aria-hidden />}
            Salvar
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export function NewBirthdayButton({ first = false }: { first?: boolean }) {
  const [open, setOpen] = React.useState(false);
  return (
    <BirthdayDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button className="bg-pink-600 text-white hover:bg-pink-600/90">
          <Plus aria-hidden /> {first ? "Adicionar Primeiro Aniversário" : "Novo Aniversário"}
        </Button>
      }
    />
  );
}

export function BirthdayRow({ birthday }: { birthday: BirthdayWithNext }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const isToday = birthday.daysUntil === 0;
  const nextDate = fromDateKey(birthday.nextDate);

  async function handleDelete() {
    const result = await deleteBirthdayAction(birthday.id);
    if (!result.ok) toast.error(result.error);
    else toast.success("Aniversário removido.");
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3.5 rounded-2xl border bg-card p-4 transition-all hover:border-pink-500/40",
        isToday && "border-pink-500/60 bg-pink-500/5",
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pink-500/15 text-lg font-bold text-pink-600 dark:text-pink-400">
        {isToday ? <Cake className="size-5" aria-hidden /> : birthday.name.charAt(0).toUpperCase()}
      </span>
      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Editar ${birthday.name}`}
      >
        <p className="truncate font-semibold">{birthday.name}</p>
        <p className="text-xs text-muted-foreground">
          {format(nextDate, "d 'de' MMMM", { locale: ptBR })} ·{" "}
          {RELATIONSHIP_META[birthday.relationship]}
        </p>
        {birthday.notes ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground/80">{birthday.notes}</p>
        ) : null}
      </button>
      <div className="shrink-0 text-right">
        {isToday ? (
          <p className="text-sm font-bold text-pink-600 dark:text-pink-400">🎉 Hoje!</p>
        ) : (
          <p className="text-sm font-semibold">
            {birthday.daysUntil} dia{birthday.daysUntil === 1 ? "" : "s"}
          </p>
        )}
        <p className="text-xs text-muted-foreground">faz {birthday.turnsAge} anos</p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Excluir ${birthday.name}`}
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        onClick={handleDelete}
      >
        <Trash2 className="size-3.5" aria-hidden />
      </Button>
      <BirthdayDialog birthday={birthday} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
