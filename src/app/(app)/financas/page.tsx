import type { Metadata } from "next";
import { format } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";

import { BudgetsCard } from "@/components/features/finance/budgets-card";
import { CategoriesManager } from "@/components/features/finance/categories-manager";
import { FinanceChartsSection } from "@/components/features/finance/finance-charts";
import { MonthNavigator } from "@/components/features/finance/month-navigator";
import { NewTransactionButton } from "@/components/features/finance/new-transaction-button";
import { TransactionsList } from "@/components/features/finance/transactions-list";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getMonthlyFlow, getMonthOverview, listCategories } from "@/server/services/finance";
import { requireUser } from "@/server/session";
import { monthKeySchema } from "@/shared/schemas/finance";

export const metadata: Metadata = {
  title: "Finanças",
};

function SummaryCard({
  label,
  valueCents,
  icon: Icon,
  tone,
}: {
  label: string;
  valueCents: number;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: "income" | "expense" | "balance";
}) {
  return (
    <Card className="gap-1.5 p-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon
          className={cn(
            "size-3.5",
            tone === "income" && "text-emerald-600 dark:text-emerald-400",
            tone === "expense" && "text-rose-600 dark:text-rose-400",
          )}
          aria-hidden
        />
        {label}
      </span>
      <span
        className={cn(
          "text-xl font-semibold tabular-nums sm:text-2xl",
          tone === "balance" &&
            (valueCents >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"),
        )}
      >
        {formatBRL(valueCents)}
      </span>
    </Card>
  );
}

export default async function FinancasPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const parsedMonth = monthKeySchema.safeParse(params.mes);
  const month = parsedMonth.success ? parsedMonth.data : format(new Date(), "yyyy-MM");

  const [overview, flow, categories] = await Promise.all([
    getMonthOverview(user.id, month),
    getMonthlyFlow(user.id, month, 6),
    listCategories(user.id),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Finanças</h1>
          <p className="text-sm text-muted-foreground">Receitas, despesas e orçamentos.</p>
        </div>
        <div className="flex items-center gap-2">
          <CategoriesManager categories={categories} />
          <NewTransactionButton categories={categories} />
        </div>
      </header>

      <div className="flex justify-center">
        <MonthNavigator month={month} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Receitas"
          valueCents={overview.incomeCents}
          icon={ArrowUpCircle}
          tone="income"
        />
        <SummaryCard
          label="Despesas"
          valueCents={overview.expenseCents}
          icon={ArrowDownCircle}
          tone="expense"
        />
        <SummaryCard label="Saldo" valueCents={overview.balanceCents} icon={Scale} tone="balance" />
      </div>

      <FinanceChartsSection expensesByCategory={overview.expensesByCategory} flow={flow} />

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(280px,0.6fr)]">
        <section aria-label="Transações do mês" className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Transações · {overview.transactions.length}
          </h2>
          <TransactionsList transactions={overview.transactions} categories={categories} />
        </section>
        <BudgetsCard budgets={overview.budgets} categories={categories} month={month} />
      </div>
    </div>
  );
}
