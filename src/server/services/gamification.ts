import { and, count, desc, eq, gte, isNotNull, sql, sum } from "drizzle-orm";
import { differenceInCalendarDays, format, subDays } from "date-fns";

import { getDb } from "@/server/db";
import {
  dreams,
  goals,
  habitLogs,
  habits,
  moodEntries,
  pomodoroSessions,
  studySessions,
  tasks,
} from "@/server/db/schema";

/**
 * XP awarded per activity. XP is always derived from real activity counts at
 * read time — there is no ledger table, which keeps it idempotent by
 * construction (important because the neon-http driver has no transactions).
 */
export const XP_VALUES = {
  taskCompleted: 10,
  habitCheck: 5,
  pomodoroFocus: 15,
  studyHalfHour: 10,
  goalCompleted: 50,
  dreamAchieved: 40,
  moodEntry: 2,
} as const;

export type LevelInfo = {
  level: number;
  totalXp: number;
  /** Cumulative XP where the current level starts. */
  levelStartXp: number;
  /** Cumulative XP required for the next level. */
  nextLevelXp: number;
};

export type ActivityCounts = {
  tasksDone: number;
  habitChecks: number;
  pomodoros: number;
  studyMinutes: number;
  goalsCompleted: number;
  dreamsAchieved: number;
  moodEntries: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  unlocked: boolean;
};

export type GamificationSummary = {
  level: LevelInfo;
  counts: ActivityCounts;
  /** Dias consecutivos com alguma atividade (tarefa, hábito ou pomodoro). */
  activityStreak: number;
  achievements: Achievement[];
  unlockedCount: number;
};

/** Cumulative XP required to reach `level`: 0, 100, 300, 600, 1000… */
export function xpForLevel(level: number): number {
  return (100 * (level - 1) * level) / 2;
}

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level += 1;
  return {
    level,
    totalXp,
    levelStartXp: xpForLevel(level),
    nextLevelXp: xpForLevel(level + 1),
  };
}

export function totalXpFromCounts(counts: ActivityCounts): number {
  return (
    counts.tasksDone * XP_VALUES.taskCompleted +
    counts.habitChecks * XP_VALUES.habitCheck +
    counts.pomodoros * XP_VALUES.pomodoroFocus +
    Math.floor(counts.studyMinutes / 30) * XP_VALUES.studyHalfHour +
    counts.goalsCompleted * XP_VALUES.goalCompleted +
    counts.dreamsAchieved * XP_VALUES.dreamAchieved +
    counts.moodEntries * XP_VALUES.moodEntry
  );
}

/** Sequência de dias consecutivos (datas em ordem decrescente, únicas). */
export function dateStreak(datesDesc: string[], today: Date): number {
  if (datesDesc.length === 0) return 0;
  const first = new Date(`${datesDesc[0]}T00:00:00`);
  // A sequência só vale se a atividade mais recente for de hoje ou ontem.
  if (differenceInCalendarDays(today, first) > 1) return 0;
  let streak = 1;
  for (let i = 1; i < datesDesc.length; i++) {
    const previous = new Date(`${datesDesc[i - 1]}T00:00:00`);
    const current = new Date(`${datesDesc[i]}T00:00:00`);
    if (differenceInCalendarDays(previous, current) === 1) streak += 1;
    else break;
  }
  return streak;
}

async function getActivityCounts(userId: string): Promise<ActivityCounts> {
  const db = getDb();
  const [
    tasksDone,
    habitChecks,
    pomodoros,
    studyMinutes,
    goalsCompleted,
    dreamsAchieved,
    moodCount,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "done"))),
    db
      .select({ value: count() })
      .from(habitLogs)
      .innerJoin(habits, eq(habitLogs.habitId, habits.id))
      .where(eq(habits.userId, userId)),
    db
      .select({ value: count() })
      .from(pomodoroSessions)
      .where(and(eq(pomodoroSessions.userId, userId), eq(pomodoroSessions.kind, "focus"))),
    db
      .select({ value: sum(studySessions.minutes).mapWith(Number) })
      .from(studySessions)
      .where(eq(studySessions.userId, userId)),
    db
      .select({ value: count() })
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "completed"))),
    db
      .select({ value: count() })
      .from(dreams)
      .where(and(eq(dreams.userId, userId), eq(dreams.status, "achieved"))),
    db.select({ value: count() }).from(moodEntries).where(eq(moodEntries.userId, userId)),
  ]);

  return {
    tasksDone: tasksDone[0]?.value ?? 0,
    habitChecks: habitChecks[0]?.value ?? 0,
    pomodoros: pomodoros[0]?.value ?? 0,
    studyMinutes: studyMinutes[0]?.value ?? 0,
    goalsCompleted: goalsCompleted[0]?.value ?? 0,
    dreamsAchieved: dreamsAchieved[0]?.value ?? 0,
    moodEntries: moodCount[0]?.value ?? 0,
  };
}

/** Datas (desc, únicas) com atividade nos últimos 90 dias. */
export async function getActivityDates(userId: string, today: Date): Promise<string[]> {
  const db = getDb();
  const since = format(subDays(today, 90), "yyyy-MM-dd");
  const [habitDates, taskDates, pomodoroDates] = await Promise.all([
    db
      .selectDistinct({ date: habitLogs.date })
      .from(habitLogs)
      .innerJoin(habits, eq(habitLogs.habitId, habits.id))
      .where(and(eq(habits.userId, userId), gte(habitLogs.date, since))),
    db
      .selectDistinct({ date: sql<string>`${tasks.completedAt}::date` })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), isNotNull(tasks.completedAt)))
      .orderBy(desc(sql`${tasks.completedAt}::date`))
      .limit(120),
    db
      .selectDistinct({ date: pomodoroSessions.date })
      .from(pomodoroSessions)
      .where(and(eq(pomodoroSessions.userId, userId), gte(pomodoroSessions.date, since))),
  ]);

  const unique = new Set<string>();
  for (const row of [...habitDates, ...taskDates, ...pomodoroDates]) {
    if (row.date) unique.add(String(row.date));
  }
  return [...unique].sort().reverse();
}

export function buildAchievements(
  counts: ActivityCounts,
  activityStreak: number,
  level: number,
): Achievement[] {
  const definitions: Array<Omit<Achievement, "unlocked">> = [
    {
      id: "primeira-tarefa",
      title: "Primeiro Passo",
      description: "Conclua sua primeira tarefa",
      icon: "🎯",
      target: 1,
      current: counts.tasksDone,
    },
    {
      id: "dez-tarefas",
      title: "Produtivo",
      description: "Conclua 10 tarefas",
      icon: "✅",
      target: 10,
      current: counts.tasksDone,
    },
    {
      id: "cem-tarefas",
      title: "Máquina de Tarefas",
      description: "Conclua 100 tarefas",
      icon: "🏆",
      target: 100,
      current: counts.tasksDone,
    },
    {
      id: "primeiro-habito",
      title: "Semente Plantada",
      description: "Faça o primeiro check-in de hábito",
      icon: "🌱",
      target: 1,
      current: counts.habitChecks,
    },
    {
      id: "cinquenta-habitos",
      title: "Constância",
      description: "Some 50 check-ins de hábitos",
      icon: "🔁",
      target: 50,
      current: counts.habitChecks,
    },
    {
      id: "sequencia-7",
      title: "Semana em Chamas",
      description: "7 dias seguidos de atividade",
      icon: "🔥",
      target: 7,
      current: activityStreak,
    },
    {
      id: "pomodoro-10",
      title: "Foco Total",
      description: "Complete 10 pomodoros",
      icon: "🍅",
      target: 10,
      current: counts.pomodoros,
    },
    {
      id: "estudo-10h",
      title: "Estudioso",
      description: "Estude por 10 horas",
      icon: "📚",
      target: 600,
      current: counts.studyMinutes,
    },
    {
      id: "meta-1",
      title: "Meta Batida",
      description: "Conclua uma meta",
      icon: "🥇",
      target: 1,
      current: counts.goalsCompleted,
    },
    {
      id: "sonho-1",
      title: "Sonho Realizado",
      description: "Realize um sonho do mural",
      icon: "⭐",
      target: 1,
      current: counts.dreamsAchieved,
    },
    {
      id: "humor-14",
      title: "Autoconhecimento",
      description: "Registre o humor 14 vezes",
      icon: "😊",
      target: 14,
      current: counts.moodEntries,
    },
    {
      id: "nivel-5",
      title: "Veterano",
      description: "Alcance o nível 5",
      icon: "👑",
      target: 5,
      current: level,
    },
  ];

  return definitions.map((definition) => ({
    ...definition,
    current: Math.min(definition.current, definition.target),
    unlocked: definition.current >= definition.target,
  }));
}

/** Resumo completo de gamificação (perfil e dashboard). */
export async function getGamification(userId: string, today: Date): Promise<GamificationSummary> {
  const [counts, activityDates] = await Promise.all([
    getActivityCounts(userId),
    getActivityDates(userId, today),
  ]);
  const level = levelFromXp(totalXpFromCounts(counts));
  const activityStreak = dateStreak(activityDates, today);
  const achievements = buildAchievements(counts, activityStreak, level.level);

  return {
    level,
    counts,
    activityStreak,
    achievements,
    unlockedCount: achievements.filter((achievement) => achievement.unlocked).length,
  };
}

/** Nível para o badge do shell (mesma base de XP do resumo completo). */
export async function getLevelInfo(userId: string): Promise<LevelInfo> {
  const counts = await getActivityCounts(userId);
  return levelFromXp(totalXpFromCounts(counts));
}
