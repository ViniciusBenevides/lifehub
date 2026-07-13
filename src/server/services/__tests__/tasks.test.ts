import { describe, expect, it } from "vitest";

import { occurrencesInRange } from "@/server/services/tasks";

describe("occurrencesInRange (recorrência de tarefas)", () => {
  it("diária gera um dia após o template, limitada ao intervalo", () => {
    expect(occurrencesInRange("2026-07-10", "daily", "2026-07-11", "2026-07-14")).toEqual([
      "2026-07-11",
      "2026-07-12",
      "2026-07-13",
      "2026-07-14",
    ]);
  });

  it("não gera a própria data do template", () => {
    expect(occurrencesInRange("2026-07-12", "daily", "2026-07-12", "2026-07-12")).toEqual([]);
  });

  it("semanal mantém o dia da semana", () => {
    // 2026-07-06 é segunda-feira.
    expect(occurrencesInRange("2026-07-06", "weekly", "2026-07-07", "2026-07-31")).toEqual([
      "2026-07-13",
      "2026-07-20",
      "2026-07-27",
    ]);
  });

  it("mensal mantém o dia do mês", () => {
    expect(occurrencesInRange("2026-07-15", "monthly", "2026-08-01", "2026-10-31")).toEqual([
      "2026-08-15",
      "2026-09-15",
      "2026-10-15",
    ]);
  });

  it("intervalo antes da primeira ocorrência retorna vazio", () => {
    expect(occurrencesInRange("2026-07-10", "monthly", "2026-07-11", "2026-08-09")).toEqual([]);
  });
});
