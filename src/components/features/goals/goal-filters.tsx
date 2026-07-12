"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LifeArea } from "@/server/services/goals";

const STATUS_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "completed", label: "Concluídas" },
  { value: "paused", label: "Pausadas" },
  { value: "archived", label: "Arquivadas" },
];

export function GoalFilters({ lifeAreas }: { lifeAreas: LifeArea[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={searchParams.get("status") ?? "todas"}
        onValueChange={(value) => setParam("status", value === "todas" ? null : value)}
      >
        <SelectTrigger className="w-36" aria-label="Filtrar por status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("area") ?? "todas"}
        onValueChange={(value) => setParam("area", value === "todas" ? null : value)}
      >
        <SelectTrigger className="w-44" aria-label="Filtrar por área da vida">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as áreas</SelectItem>
          {lifeAreas.map((area) => (
            <SelectItem key={area.id} value={area.id}>
              {area.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
