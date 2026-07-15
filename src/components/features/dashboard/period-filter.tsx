"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PeriodDays } from "@/server/services/productivity";

const PERIODS: Array<{ value: PeriodDays; label: string }> = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];

export function PeriodFilter({ period }: { period: PeriodDays }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setPeriod(value: PeriodDays) {
    const params = new URLSearchParams(searchParams);
    params.set("periodo", String(value));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div role="radiogroup" aria-label="Período" className="flex w-fit gap-1.5">
      {PERIODS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={period === option.value}
          onClick={() => setPeriod(option.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            period === option.value
              ? "border-transparent bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {period === option.value ? <Check className="size-3.5" aria-hidden /> : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}
