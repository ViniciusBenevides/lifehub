"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, fromDateKey } from "@/lib/format";
import type { CategoryTotal, MonthFlowPoint } from "@/server/services/finance";

// Pares validados com o validador de paleta (claro/escuro).
const INCOME_COLOR = { light: "#059669", dark: "#059669" };
const EXPENSE_COLOR = { light: "#e11d48", dark: "#f43f5e" };

function useChartColors() {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  return {
    income: INCOME_COLOR[mode],
    expense: EXPENSE_COLOR[mode],
    grid: mode === "dark" ? "#2c2c2a" : "#e1e0d9",
    muted: "#898781",
    surface: mode === "dark" ? "var(--card)" : "#ffffff",
  };
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label ? <p className="mb-1 font-medium">{label}</p> : null}
      {payload.map((entry, index) => (
        <p key={index} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium tabular-nums">{formatBRL(Number(entry.value))}</span>
        </p>
      ))}
    </div>
  );
}

const MAX_SLICES = 6;

export function ExpensesByCategoryChart({ data }: { data: CategoryTotal[] }) {
  const colors = useChartColors();
  const total = data.reduce((sum, entry) => sum + entry.totalCents, 0);

  const slices = React.useMemo(() => {
    const top = data.slice(0, MAX_SLICES - 1);
    const rest = data.slice(MAX_SLICES - 1);
    const result = top.map((entry) => ({
      name: entry.category.name,
      value: entry.totalCents,
      color: entry.category.color ?? "#64748b",
    }));
    if (rest.length > 0) {
      result.push({
        name: "Outras",
        value: rest.reduce((sum, entry) => sum + entry.totalCents, 0),
        color: "#64748b",
      });
    }
    return result;
  }, [data]);

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhuma despesa neste mês ainda.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={85}
            paddingAngle={1}
            strokeWidth={2}
            stroke={colors.surface}
          >
            {slices.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legenda-lista: identidade nunca depende só da cor. */}
      <ul className="w-full flex-1 space-y-1.5 text-sm">
        {slices.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate">{slice.name}</span>
            <span className="font-medium tabular-nums">{formatBRL(slice.value)}</span>
            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
              {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MonthlyFlowChart({ data }: { data: MonthFlowPoint[] }) {
  const colors = useChartColors();
  const chartData = data.map((point) => ({
    label: format(fromDateKey(`${point.month}-01`), "MMM", { locale: ptBR }),
    Receitas: point.incomeCents,
    Despesas: point.expenseCents,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barGap={2}>
          <CartesianGrid vertical={false} stroke={colors.grid} strokeWidth={1} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.muted, fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: colors.muted, fontSize: 10 }}
            tickFormatter={(value: number) =>
              value >= 1_000_00 ? `${Math.round(value / 1_000_00)}k` : `${Math.round(value / 100)}`
            }
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: colors.grid, opacity: 0.4 }} />
          <Bar dataKey="Receitas" fill={colors.income} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="Despesas" fill={colors.expense} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: colors.income }} />
          Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: colors.expense }} />
          Despesas
        </span>
      </div>
    </div>
  );
}

export function FinanceChartsSection({
  expensesByCategory,
  flow,
}: {
  expensesByCategory: CategoryTotal[];
  flow: MonthFlowPoint[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpensesByCategoryChart data={expensesByCategory} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fluxo — últimos 6 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyFlowChart data={flow} />
        </CardContent>
      </Card>
    </div>
  );
}
