"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartPoint, ScheduledVsDonePoint } from "@/server/services/productivity";

// Cores validadas com o validador de paleta (banda de luminosidade dark/light).
const SCHEDULED_COLOR = "#2563eb";
const DONE_COLOR = "#059669";
export const PRIORITY_CHART_COLORS = { high: "#e11d48", medium: "#d97706", low: "#0284c7" };

function useChartBasics() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return {
    grid: dark ? "#2e2e33" : "#e4e4e7",
    muted: "#898781",
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
          <span className="font-medium tabular-nums">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

/** Programadas × concluídas por dia (ou semana em períodos longos). */
export function ScheduledVsDoneChart({
  data,
  bucketLabel,
}: {
  data: ScheduledVsDonePoint[];
  bucketLabel: string;
}) {
  const { grid, muted } = useChartBasics();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Programadas × Concluídas</CardTitle>
        <p className="text-xs text-muted-foreground">Por {bucketLabel} no período</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: muted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: muted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="scheduled"
                name="Programadas"
                fill={SCHEDULED_COLOR}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
              />
              <Bar
                dataKey="done"
                name="Concluídas"
                fill={DONE_COLOR}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Legend
          items={[
            { label: "Programadas", color: SCHEDULED_COLOR },
            { label: "Concluídas", color: DONE_COLOR },
          ]}
        />
      </CardContent>
    </Card>
  );
}

/** Conclusões por dia da semana (série única na cor primária). */
export function WeekdayChart({ data }: { data: ChartPoint[] }) {
  const { grid, muted } = useChartBasics();
  const total = data.reduce((sum, point) => sum + point.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conclusões por dia da semana</CardTitle>
        <p className="text-xs text-muted-foreground">Quando você mais finaliza tarefas</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: muted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: muted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="value"
                name="Concluídas"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-muted-foreground">Total no período: {total}</p>
      </CardContent>
    </Card>
  );
}

/** Linha de produtividade (concluídas por dia). */
export function DailyDoneChart({ data, bucketLabel }: { data: ChartPoint[]; bucketLabel: string }) {
  const { grid, muted } = useChartBasics();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Produtividade</CardTitle>
        <p className="text-xs text-muted-foreground">Tarefas concluídas por {bucketLabel}</p>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: muted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: muted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: grid }} />
              <Line
                type="monotone"
                dataKey="value"
                name="Concluídas"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/** Tarefas por prioridade (cores fixas por prioridade + rótulos no eixo). */
export function PriorityChart({
  counts,
}: {
  counts: { high: number; medium: number; low: number };
}) {
  const { grid, muted } = useChartBasics();
  const data = [
    { label: "Alta", value: counts.high, color: PRIORITY_CHART_COLORS.high },
    { label: "Média", value: counts.medium, color: PRIORITY_CHART_COLORS.medium },
    { label: "Baixa", value: counts.low, color: PRIORITY_CHART_COLORS.low },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tarefas por Prioridade</CardTitle>
        <p className="text-xs text-muted-foreground">No período selecionado</p>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: muted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: muted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" name="Tarefas" radius={[4, 4, 0, 0]} maxBarSize={44}>
                {data.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
