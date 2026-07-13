import { describe, expect, it } from "vitest";

import { computeGoalProgress } from "@/server/services/goals";

describe("computeGoalProgress", () => {
  it("percentual manual usa currentValue com clamp 0–100", () => {
    expect(
      computeGoalProgress(
        { progressType: "manual_percent", currentValue: 40, targetValue: null },
        0,
        0,
      ),
    ).toBe(40);
    expect(
      computeGoalProgress(
        { progressType: "manual_percent", currentValue: 150, targetValue: null },
        0,
        0,
      ),
    ).toBe(100);
    expect(
      computeGoalProgress(
        { progressType: "manual_percent", currentValue: -5, targetValue: null },
        0,
        0,
      ),
    ).toBe(0);
  });

  it("numérica calcula atual/alvo com teto de 100%", () => {
    expect(
      computeGoalProgress({ progressType: "numeric", currentValue: 3, targetValue: 12 }, 0, 0),
    ).toBe(25);
    expect(
      computeGoalProgress({ progressType: "numeric", currentValue: 15, targetValue: 12 }, 0, 0),
    ).toBe(100);
  });

  it("numérica sem alvo válido retorna 0", () => {
    expect(
      computeGoalProgress({ progressType: "numeric", currentValue: 5, targetValue: null }, 0, 0),
    ).toBe(0);
    expect(
      computeGoalProgress({ progressType: "numeric", currentValue: 5, targetValue: 0 }, 0, 0),
    ).toBe(0);
  });

  it("por marcos usa a razão de concluídos", () => {
    expect(
      computeGoalProgress({ progressType: "milestones", currentValue: 0, targetValue: null }, 2, 4),
    ).toBe(50);
    expect(
      computeGoalProgress({ progressType: "milestones", currentValue: 0, targetValue: null }, 0, 0),
    ).toBe(0);
    expect(
      computeGoalProgress({ progressType: "milestones", currentValue: 0, targetValue: null }, 3, 3),
    ).toBe(100);
  });
});
