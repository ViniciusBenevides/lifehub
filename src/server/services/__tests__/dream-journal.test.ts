import { describe, expect, it } from "vitest";

import { analyzeDreams, type DreamEntry } from "@/server/services/dream-journal";

function entry(partial: Partial<DreamEntry>): DreamEntry {
  return {
    id: crypto.randomUUID(),
    userId: "user",
    date: "2026-07-14",
    title: "Sonho",
    description: null,
    lucid: false,
    nightmare: false,
    clarity: 3,
    mood: null,
    createdAt: new Date(),
    ...partial,
  };
}

describe("analyzeDreams", () => {
  it("retorna zeros sem entradas", () => {
    expect(analyzeDreams([])).toEqual({
      total: 0,
      lucidCount: 0,
      nightmareCount: 0,
      averageClarity: 0,
      distribution: [],
    });
  });

  it("agrega totais, médias e distribuição por humor", () => {
    const result = analyzeDreams([
      entry({ lucid: true, clarity: 5, mood: "feliz" }),
      entry({ nightmare: true, clarity: 2, mood: "ansioso" }),
      entry({ clarity: 4, mood: "feliz" }),
      entry({ clarity: 3 }), // sem humor: fora da distribuição
    ]);
    expect(result.total).toBe(4);
    expect(result.lucidCount).toBe(1);
    expect(result.nightmareCount).toBe(1);
    expect(result.averageClarity).toBe(3.5);
    expect(result.distribution[0]).toMatchObject({ mood: "feliz", count: 2, percent: 67 });
    expect(result.distribution[1]).toMatchObject({ mood: "ansioso", count: 1, percent: 33 });
  });
});
