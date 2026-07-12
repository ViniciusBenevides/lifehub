"use client";

import * as React from "react";
import { toast } from "sonner";

import { CurrencyInput } from "@/components/features/finance/currency-input";
import { DynamicIcon } from "@/components/features/icon";
import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createTransactionAction, updateTransactionAction } from "@/server/actions/finance";
import type { Transaction, TransactionCategory } from "@/server/services/finance";
import { createTransactionSchema } from "@/shared/schemas/finance";

type TransactionFormDialogProps = {
  categories: TransactionCategory[];
  transaction?: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function TransactionFormDialog({
  categories,
  transaction,
  open,
  onOpenChange,
  trigger,
}: TransactionFormDialogProps) {
  const isEdit = Boolean(transaction);
  const [type, setType] = React.useState<"income" | "expense">(transaction?.type ?? "expense");
  const [amountCents, setAmountCents] = React.useState(transaction?.amountCents ?? 0);
  const [description, setDescription] = React.useState(transaction?.description ?? "");
  const [categoryId, setCategoryId] = React.useState(transaction?.categoryId ?? "");
  const [date, setDate] = React.useState(transaction?.date ?? toDateKey(new Date()));
  const [isRecurring, setIsRecurring] = React.useState(transaction?.isRecurring ?? false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const typeCategories = categories.filter((category) => category.type === type);

  function switchType(next: "income" | "expense") {
    setType(next);
    setCategoryId("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = createTransactionSchema.safeParse({
      description,
      amountCents,
      type,
      categoryId,
      date,
      isRecurring,
      recurrenceRule: isRecurring ? "monthly" : null,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateTransactionAction(transaction!.id, parsed.data)
      : await createTransactionAction(parsed.data);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEdit ? "Transação atualizada." : "Transação registrada!");
    onOpenChange(false);
    if (!isEdit) {
      setAmountCents(0);
      setDescription("");
      setCategoryId("");
      setIsRecurring(false);
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar transação" : "Nova transação"}
      trigger={trigger}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo">
            <button
              type="button"
              role="radio"
              aria-checked={type === "expense"}
              onClick={() => switchType("expense")}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-medium transition-colors",
                type === "expense"
                  ? "border-rose-500/60 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "hover:bg-accent",
              )}
            >
              Despesa
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={type === "income"}
              onClick={() => switchType("income")}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-medium transition-colors",
                type === "income"
                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "hover:bg-accent",
              )}
            >
              Receita
            </button>
          </div>

          <Field>
            <FieldLabel htmlFor="tx-amount">Valor</FieldLabel>
            <CurrencyInput
              id="tx-amount"
              valueCents={amountCents}
              onValueChange={setAmountCents}
              className="text-lg font-medium"
              autoFocus={!isEdit}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="tx-description">Descrição</FieldLabel>
            <Input
              id="tx-description"
              placeholder={type === "expense" ? "Ex.: Mercado da semana" : "Ex.: Salário"}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Categoria</FieldLabel>
              <Select value={categoryId || undefined} onValueChange={setCategoryId}>
                <SelectTrigger aria-label="Categoria">
                  <SelectValue placeholder="Escolher…" />
                </SelectTrigger>
                <SelectContent>
                  {typeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <DynamicIcon name={category.icon} className="size-4" />
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="tx-date">Data</FieldLabel>
              <Input
                id="tx-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <span>
              <span className="block text-sm font-medium">Repetir todo mês</span>
              <span className="block text-xs text-muted-foreground">
                Gera automaticamente nos próximos meses (salário, assinatura, aluguel…)
              </span>
            </span>
            <Switch
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
              aria-label="Transação recorrente mensal"
            />
          </label>

          {error ? <FieldError>{error}</FieldError> : null}

          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : null}
            {isEdit ? "Salvar alterações" : "Registrar"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}
