"use client";

import * as React from "react";
import { Repeat, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { TransactionFormDialog } from "@/components/features/finance/transaction-form-dialog";
import { DynamicIcon } from "@/components/features/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBRL, formatDateShort, fromDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteTransactionAction } from "@/server/actions/finance";
import type { TransactionCategory, TransactionWithCategory } from "@/server/services/finance";

export function TransactionsList({
  transactions,
  categories,
}: {
  transactions: TransactionWithCategory[];
  categories: TransactionCategory[];
}) {
  const [typeFilter, setTypeFilter] = React.useState("todos");
  const [categoryFilter, setCategoryFilter] = React.useState("todas");
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<TransactionWithCategory | null>(null);

  const filtered = transactions.filter((transaction) => {
    if (typeFilter !== "todos" && transaction.type !== typeFilter) return false;
    if (categoryFilter !== "todas" && transaction.categoryId !== categoryFilter) return false;
    if (search && !transaction.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  async function handleDelete(transaction: TransactionWithCategory) {
    const result = await deleteTransactionAction(transaction.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Transação excluída.");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-40 flex-1">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar transação…"
            className="pl-9"
            aria-label="Buscar transação"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32" aria-label="Filtrar por tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40" aria-label="Filtrar por categoria">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          {transactions.length === 0
            ? "Nenhuma transação neste mês. Registre a primeira!"
            : "Nada encontrado com esses filtros."}
        </p>
      ) : (
        <Card className="divide-y p-0">
          {filtered.map((transaction) => (
            <div key={transaction.id} className="group flex items-center gap-3 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setEditing(transaction)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`Editar ${transaction.description}`}
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${transaction.category.color ?? "#64748b"}22`,
                    color: transaction.category.color ?? "#64748b",
                  }}
                >
                  <DynamicIcon name={transaction.category.icon} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 truncate text-sm font-medium">
                    {transaction.description}
                    {(transaction.isRecurring || transaction.recurringSourceId) && (
                      <Repeat className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {transaction.category.name} · {formatDateShort(fromDateKey(transaction.date))}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    transaction.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {transaction.type === "income" ? "+" : "−"}
                  {formatBRL(transaction.amountCents)}
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Excluir ${transaction.description}`}
                className="opacity-60 group-hover:opacity-100"
                onClick={() => handleDelete(transaction)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          ))}
        </Card>
      )}

      {editing ? (
        <TransactionFormDialog
          categories={categories}
          transaction={editing}
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}
