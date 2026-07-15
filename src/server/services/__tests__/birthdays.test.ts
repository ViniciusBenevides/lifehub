import { describe, expect, it } from "vitest";

import { nextOccurrence } from "@/server/services/birthdays";

// Referência: 14/07/2026.
const TODAY = new Date(2026, 6, 14);

describe("nextOccurrence", () => {
  it("aniversário hoje: 0 dias e idade correta", () => {
    const result = nextOccurrence("1995-07-14", TODAY);
    expect(result).toEqual({ nextDate: "2026-07-14", daysUntil: 0, turnsAge: 31 });
  });

  it("aniversário ainda neste ano", () => {
    const result = nextOccurrence("1990-11-02", TODAY);
    expect(result.nextDate).toBe("2026-11-02");
    expect(result.turnsAge).toBe(36);
    expect(result.daysUntil).toBeGreaterThan(0);
  });

  it("aniversário já passado rola para o próximo ano", () => {
    const result = nextOccurrence("2000-01-10", TODAY);
    expect(result.nextDate).toBe("2027-01-10");
    expect(result.turnsAge).toBe(27);
  });

  it("29/02 é normalizado em ano não bissexto", () => {
    const result = nextOccurrence("1996-02-29", TODAY);
    // 2027 não é bissexto: a data vira 01/03.
    expect(result.nextDate).toBe("2027-03-01");
  });
});
