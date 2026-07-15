import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { FinanceChartsSection } from "@/components/features/finance/finance-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, fromDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getMonthlyFlow, getMonthOverview } from "@/server/services/finance";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Estatísticas",
};

function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + offset, 1);
  return format(date, "yyyy-MM");
}

export default async function EstatisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(params.mes ?? "")
    ? params.mes!
    : format(new Date(), "yyyy-MM");

  const [overview, previous, flow] = await Promise.all([
    getMonthOverview(user.id, month),
    getMonthOverview(user.id, shiftMonth(month, -1)),
    getMonthlyFlow(user.id, month, 12),
  ]);

  const expenseDelta =
    previous.expenseCents > 0
      ? Math.round(((overview.expenseCents - previous.expenseCents) / previous.expenseCents) * 100)
      : null;
  const topExpenses = overview.transactions
    .filter((transaction) => transaction.type === "expense")
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, 5);
  const monthLabel = format(fromDateKey(`${month}-01`), "MMMM yyyy", { locale: ptBR });

  const stats = [
    {
      label: "Receitas",
      value: formatBRL(overview.incomeCents),
      icon: ArrowUpRight,
      tint: "text-emerald-500",
    },
    {
      label: "Despesas",
      value: formatBRL(overview.expenseCents),
      icon: ArrowDownRight,
      tint: "text-red-500",
    },
    {
      label: "Saldo",
      value: formatBRL(overview.balanceCents),
      icon: Scale,
      tint: overview.balanceCents >= 0 ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "vs. mês anterior",
      value: expenseDelta == null ? "—" : `${expenseDelta > 0 ? "+" : ""}${expenseDelta}%`,
      icon: expenseDelta != null && expenseDelta > 0 ? TrendingUp : TrendingDown,
      tint: expenseDelta != null && expenseDelta > 0 ? "text-red-500" : "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/financas"
            aria-label="Voltar para Gestão"
            className="grid size-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-4.5" aria-hidden />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Estatísticas</h1>
            <p className="text-sm text-muted-foreground">Análises detalhadas das suas finanças.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/financas/estatisticas?mes=${shiftMonth(month, -1)}`}
            aria-label="Mês anterior"
            className="grid size-8 place-items-center rounded-full border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Link>
          <span className="min-w-32 text-center text-sm font-semibold capitalize">
            {monthLabel}
          </span>
          <Link
            href={`/financas/estatisticas?mes=${shiftMonth(month, 1)}`}
            aria-label="Próximo mês"
            className="grid size-8 place-items-center rounded-full border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <stat.icon className={cn("size-4", stat.tint)} aria-hidden />
            </div>
            <p className={cn("mt-1.5 text-xl font-bold", stat.label === "Saldo" && stat.tint)}>
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <FinanceChartsSection expensesByCategory={overview.expensesByCategory} flow={flow} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maiores gastos do mês</CardTitle>
        </CardHeader>
        <CardContent>
          {topExpenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma despesa registrada neste mês.
            </p>
          ) : (
            <div className="divide-y">
              {topExpenses.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-xl text-base"
                    style={{ backgroundColor: `${transaction.category.color ?? "#6366f1"}26` }}
                    aria-hidden
                  >
                    {transaction.category.icon ?? "💸"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.category.name} · {format(fromDateKey(transaction.date), "dd/MM")}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-red-500">
                    -{formatBRL(transaction.amountCents)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
