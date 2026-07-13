import { describe, expect, it } from "vitest";

import { monthRange, occurrenceDateForMonth } from "@/server/services/finance";

describe("monthRange", () => {
  it("cobre do primeiro ao último dia do mês", () => {
    expect(monthRange("2026-07")).toEqual({ start: "2026-07-01", end: "2026-07-31" });
    expect(monthRange("2026-02")).toEqual({ start: "2026-02-01", end: "2026-02-28" });
    expect(monthRange("2028-02")).toEqual({ start: "2028-02-01", end: "2028-02-29" });
  });
});

describe("occurrenceDateForMonth (recorrência mensal)", () => {
  it("mantém o dia do template", () => {
    expect(occurrenceDateForMonth("2026-07-05", "2026-08")).toBe("2026-08-05");
  });

  it("clampa o dia ao fim de meses mais curtos", () => {
    expect(occurrenceDateForMonth("2026-01-31", "2026-02")).toBe("2026-02-28");
    expect(occurrenceDateForMonth("2026-01-31", "2026-04")).toBe("2026-04-30");
    expect(occurrenceDateForMonth("2026-01-31", "2026-03")).toBe("2026-03-31");
  });
});
