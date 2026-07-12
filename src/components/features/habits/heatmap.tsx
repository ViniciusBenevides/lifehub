import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { fromDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { HeatmapDay } from "@/server/services/habits";

const LEVEL_CLASSES = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
] as const;

function levelFor(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 1) return 4;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

/**
 * Heatmap estilo GitHub: colunas = semanas, linhas = dias (dom–sáb).
 * Renderizado no servidor; `days` deve vir ordenado do mais antigo ao atual.
 */
export function Heatmap({ days, label }: { days: HeatmapDay[]; label: string }) {
  if (days.length === 0) return null;

  const max = Math.max(...days.map((day) => day.count));
  // Preenche o início para alinhar a primeira coluna no domingo.
  const firstWeekday = fromDateKey(days[0].date).getDay();
  const cells: (HeatmapDay | null)[] = [...Array<null>(firstWeekday).fill(null), ...days];
  const weeks: (HeatmapDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Rótulos de mês nas colunas onde o mês muda.
  const monthLabels = weeks.map((week, index) => {
    const firstDay = week.find((cell) => cell != null);
    if (!firstDay) return null;
    const date = fromDateKey(firstDay.date);
    if (date.getDate() <= 7 || index === 0) {
      return format(date, "MMM", { locale: ptBR });
    }
    return null;
  });

  return (
    <div className="overflow-x-auto" role="img" aria-label={label}>
      <div className="inline-flex min-w-full flex-col gap-1">
        <div className="flex gap-[3px] pl-0 text-[10px] text-muted-foreground">
          {monthLabels.map((month, index) => (
            <span key={index} className="w-2.5 shrink-0 overflow-visible whitespace-nowrap">
              {month ?? ""}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const cell = week[dayIndex];
                if (!cell) {
                  return <span key={dayIndex} className="size-2.5 rounded-[3px]" />;
                }
                const date = fromDateKey(cell.date);
                return (
                  <span
                    key={dayIndex}
                    title={`${format(date, "dd/MM/yyyy")}: ${cell.count} ${cell.count === 1 ? "conclusão" : "conclusões"}`}
                    className={cn(
                      "size-2.5 rounded-[3px]",
                      LEVEL_CLASSES[levelFor(cell.count, max)],
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          Menos
          {LEVEL_CLASSES.map((className) => (
            <span key={className} className={cn("size-2.5 rounded-[3px]", className)} />
          ))}
          Mais
        </div>
      </div>
    </div>
  );
}
