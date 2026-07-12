"use client";

import * as React from "react";
import { Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { CurrencyInput } from "@/components/features/finance/currency-input";
import { DynamicIcon } from "@/components/features/icon";
import { ResponsiveDialog } from "@/components/features/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteBudgetAction, upsertBudgetAction } from "@/server/actions/finance";
import type { BudgetWithSpent, TransactionCategory } from "@/server/services/finance";

function BudgetRow({ budget }: { budget: BudgetWithSpent }) {
  const percent = Math.round((budget.spentCents / budget.limitCents) * 100);
  const over = percent >= 100;
  const warning = percent >= 80 && !over;

  async function handleDelete() {
    const result = await deleteBudgetAction(budget.id);
    if (!result.ok) toast.error(result.error);
  }

  return (
    <li className="group space-y-1.5">
      <div className="flex items-center gap-2 text-sm">
        <DynamicIcon name={budget.category.icon} className="size-4" aria-hidden />
        <span className="min-w-0 flex-1 truncate font-medium">{budget.category.name}</span>
        {(over || warning) && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              over
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            )}
          >
            <TriangleAlert className="size-3" aria-hidden />
            {over ? "Estourado" : "Atenção"}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remover orçamento de ${budget.category.name}`}
          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      </div>
      <Progress
        value={Math.min(100, percent)}
        aria-label={`${budget.category.name}: ${percent}% do orçamento`}
        className={cn(
          over && "[&>[data-slot=progress-indicator]]:bg-rose-500",
          warning && "[&>[data-slot=progress-indicator]]:bg-amber-500",
        )}
      />
      <p className="text-xs text-muted-foreground tabular-nums">
        {formatBRL(budget.spentCents)} de {formatBRL(budget.limitCents)} ({percent}%)
      </p>
    </li>
  );
}

export function BudgetsCard({
  budgets,
  categories,
  month,
}: {
  budgets: BudgetWithSpent[];
  categories: TransactionCategory[];
  month: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [categoryId, setCategoryId] = React.useState("");
  const [limitCents, setLimitCents] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const expenseCategories = categories.filter((category) => category.type === "expense");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!categoryId || limitCents <= 0) {
      setError("Escolha a categoria e um limite maior que zero.");
      return;
    }
    setSaving(true);
    const result = await upsertBudgetAction({ categoryId, month, limitCents });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Orçamento salvo.");
    setOpen(false);
    setCategoryId("");
    setLimitCents(0);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Orçamentos do mês</CardTitle>
        <ResponsiveDialog
          open={open}
          onOpenChange={setOpen}
          title="Definir orçamento"
          description="Limite de gasto para uma categoria neste mês."
          trigger={
            <Button variant="outline" size="sm">
              <Plus aria-hidden /> Definir
            </Button>
          }
        >
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <Select value={categoryId || undefined} onValueChange={setCategoryId}>
                  <SelectTrigger aria-label="Categoria do orçamento">
                    <SelectValue placeholder="Escolher…" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <DynamicIcon name={category.icon} className="size-4" />
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="budget-limit">Limite mensal</FieldLabel>
                <CurrencyInput
                  id="budget-limit"
                  valueCents={limitCents}
                  onValueChange={setLimitCents}
                />
              </Field>
              {error ? <FieldError>{error}</FieldError> : null}
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner /> : <Pencil aria-hidden />} Salvar orçamento
              </Button>
            </FieldGroup>
          </form>
        </ResponsiveDialog>
      </CardHeader>
      <CardContent>
        {budgets.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Defina limites por categoria para acompanhar seus gastos.
          </p>
        ) : (
          <ul className="space-y-4">
            {budgets.map((budget) => (
              <BudgetRow key={budget.id} budget={budget} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
