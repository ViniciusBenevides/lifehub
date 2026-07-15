import { describe, expect, it } from "vitest";

import {
  buildAchievements,
  dateStreak,
  levelFromXp,
  totalXpFromCounts,
  xpForLevel,
  type ActivityCounts,
} from "@/server/services/gamification";

const TODAY = new Date(2026, 6, 14);

const ZERO: ActivityCounts = {
  tasksDone: 0,
  habitChecks: 0,
  pomodoros: 0,
  studyMinutes: 0,
  goalsCompleted: 0,
  dreamsAchieved: 0,
  moodEntries: 0,
};

describe("xpForLevel / levelFromXp", () => {
  it("curva cumulativa: 0, 100, 300, 600, 1000…", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(xpForLevel(4)).toBe(600);
    expect(xpForLevel(5)).toBe(1000);
  });

  it("nível 1 com 0 XP e limites exatos de subida", () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(299).level).toBe(2);
    expect(levelFromXp(300).level).toBe(3);
  });

  it("expõe o progresso dentro do nível", () => {
    const info = levelFromXp(150);
    expect(info).toEqual({ level: 2, totalXp: 150, levelStartXp: 100, nextLevelXp: 300 });
  });
});

describe("totalXpFromCounts", () => {
  it("soma cada fonte com seu peso", () => {
    expect(
      totalXpFromCounts({
        tasksDone: 2, // 20
        habitChecks: 3, // 15
        pomodoros: 1, // 15
        studyMinutes: 65, // 2 meias-horas → 20
        goalsCompleted: 1, // 50
        dreamsAchieved: 1, // 40
        moodEntries: 5, // 10
      }),
    ).toBe(170);
  });

  it("zera com contagens zeradas", () => {
    expect(totalXpFromCounts(ZERO)).toBe(0);
  });
});

describe("dateStreak", () => {
  it("conta dias consecutivos terminando hoje", () => {
    expect(dateStreak(["2026-07-14", "2026-07-13", "2026-07-12"], TODAY)).toBe(3);
  });

  it("aceita a sequência terminando ontem (hoje ainda pendente)", () => {
    expect(dateStreak(["2026-07-13", "2026-07-12"], TODAY)).toBe(2);
  });

  it("quebra quando há um buraco", () => {
    expect(dateStreak(["2026-07-14", "2026-07-12"], TODAY)).toBe(1);
  });

  it("zera quando a última atividade é antiga", () => {
    expect(dateStreak(["2026-07-10"], TODAY)).toBe(0);
    expect(dateStreak([], TODAY)).toBe(0);
  });
});

describe("buildAchievements", () => {
  it("desbloqueia pelo alvo e limita o progresso exibido", () => {
    const achievements = buildAchievements({ ...ZERO, tasksDone: 250 }, 0, 1);
    const first = achievements.find((achievement) => achievement.id === "primeira-tarefa")!;
    const hundred = achievements.find((achievement) => achievement.id === "cem-tarefas")!;
    expect(first.unlocked).toBe(true);
    expect(hundred.unlocked).toBe(true);
    expect(hundred.current).toBe(100);
  });

  it("mantém bloqueadas as metas não atingidas, com progresso parcial", () => {
    const achievements = buildAchievements({ ...ZERO, pomodoros: 4 }, 2, 1);
    const focus = achievements.find((achievement) => achievement.id === "pomodoro-10")!;
    const streak = achievements.find((achievement) => achievement.id === "sequencia-7")!;
    expect(focus.unlocked).toBe(false);
    expect(focus.current).toBe(4);
    expect(streak.current).toBe(2);
  });
});
