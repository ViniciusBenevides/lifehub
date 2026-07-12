"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addMonths, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

function parseMonth(month: string): Date {
  return new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1);
}

export function MonthNavigator({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = parseMonth(month);

  function goTo(date: Date) {
    const params = new URLSearchParams(searchParams);
    params.set("mes", format(date, "yyyy-MM"));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Mês anterior"
        onClick={() => goTo(subMonths(current, 1))}
      >
        <ChevronLeft aria-hidden />
      </Button>
      <span className="min-w-36 text-center text-sm font-medium capitalize">
        {format(current, "MMMM 'de' yyyy", { locale: ptBR })}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Próximo mês"
        onClick={() => goTo(addMonths(current, 1))}
      >
        <ChevronRight aria-hidden />
      </Button>
    </div>
  );
}
