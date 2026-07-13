import { describe, expect, it } from "vitest";

import { computeStreaks, countScheduledDays, toKey } from "@/server/services/streaks";

// Referência: 2026-07-12 é um domingo.
const TODAY = new Date(2026, 6, 12);

function dates(...keys: string[]): Set<string> {
  return new Set(keys);
}

describe("computeStreaks — hábito diário", () => {
  it("conta dias consecutivos terminando hoje", () => {
    const result = computeStreaks(
      dates("2026-07-10", "2026-07-11", "2026-07-12"),
      { type: "daily" },
      TODAY,
    );
    expect(result).toEqual({ current: 3, best: 3, unit: "days" });
  });

  it("hoje pendente não quebra a sequência", () => {
    const result = computeStreaks(dates("2026-07-10", "2026-07-11"), { type: "daily" }, TODAY);
    expect(result.current).toBe(2);
  });

  it("um dia perdido zera a sequência atual mas preserva o recorde", () => {
    const result = computeStreaks(
      dates("2026-07-05", "2026-07-06", "2026-07-07", "2026-07-08", "2026-07-11", "2026-07-12"),
      { type: "daily" },
      TODAY,
    );
    expect(result.current).toBe(2);
    expect(result.best).toBe(4);
  });

  it("sem logs retorna zero", () => {
    const result = computeStreaks(dates(), { type: "daily" }, TODAY);
    expect(result).toEqual({ current: 0, best: 0, unit: "days" });
  });
});

describe("computeStreaks — dias fixos da semana", () => {
  // seg/qua/sex = [1, 3, 5]
  const frequency = { type: "weekly_days" as const, weeklyDays: [1, 3, 5] };

  it("dias não agendados não quebram a sequência", () => {
    // sex 10/07 e qua 08/07 e seg 06/07 feitos; sáb/dom não contam.
    const result = computeStreaks(
      dates("2026-07-06", "2026-07-08", "2026-07-10"),
      frequency,
      TODAY,
    );
    expect(result.current).toBe(3);
    expect(result.best).toBe(3);
  });

  it("dia agendado perdido quebra a sequência", () => {
    // qua 08/07 perdida.
    const result = computeStreaks(dates("2026-07-06", "2026-07-10"), frequency, TODAY);
    expect(result.current).toBe(1);
  });
});

describe("computeStreaks — X vezes por semana", () => {
  const frequency = { type: "times_per_week" as const, timesPerWeek: 3 };

  it("semanas consecutivas batendo a cota contam em semanas", () => {
    // Semana 28/06–04/07: 3 conclusões; semana 05/07–11/07: 3 conclusões.
    const result = computeStreaks(
      dates("2026-06-29", "2026-07-01", "2026-07-03", "2026-07-06", "2026-07-08", "2026-07-10"),
      frequency,
      TODAY,
    );
    expect(result.unit).toBe("weeks");
    expect(result.current).toBe(2);
    expect(result.best).toBe(2);
  });

  it("semana corrente incompleta não quebra a sequência", () => {
    // Apenas a semana passada completa; a atual (começou hoje, domingo) tem 0.
    const result = computeStreaks(
      dates("2026-07-06", "2026-07-08", "2026-07-10"),
      frequency,
      TODAY,
    );
    expect(result.current).toBe(1);
  });

  it("semana que não bateu a cota quebra", () => {
    // Duas semanas atrás completa, semana passada só 1.
    const result = computeStreaks(
      dates("2026-06-29", "2026-07-01", "2026-07-03", "2026-07-06"),
      frequency,
      TODAY,
    );
    expect(result.current).toBe(0);
    expect(result.best).toBe(1);
  });
});

describe("countScheduledDays", () => {
  it("diário conta todos os dias do intervalo", () => {
    expect(countScheduledDays({ type: "daily" }, new Date(2026, 6, 6), TODAY)).toBe(7);
  });

  it("dias fixos conta apenas os agendados", () => {
    expect(
      countScheduledDays(
        { type: "weekly_days", weeklyDays: [1, 3, 5] },
        new Date(2026, 6, 6),
        TODAY,
      ),
    ).toBe(3);
  });

  it("X por semana aproxima pela cota", () => {
    expect(
      countScheduledDays({ type: "times_per_week", timesPerWeek: 3 }, new Date(2026, 6, 6), TODAY),
    ).toBe(3);
  });
});

describe("toKey", () => {
  it("formata como AAAA-MM-DD", () => {
    expect(toKey(TODAY)).toBe("2026-07-12");
  });
});
