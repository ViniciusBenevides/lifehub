import { and, asc, desc, eq, gte, lte, sum } from "drizzle-orm";
import { addDays, differenceInCalendarDays, format, startOfWeek } from "date-fns";

import { getDb } from "@/server/db";
import { studyPlans, studySessions, studySubjects } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type { CreateStudyPlanInput, LogStudySessionInput } from "@/shared/schemas/study";

export type StudyPlan = typeof studyPlans.$inferSelect;
export type StudySubject = typeof studySubjects.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;

export type SubjectWithProgress = StudySubject & {
  /** Minutos estudados na semana corrente. */
  weekMinutes: number;
  weekPercent: number;
};

export type StudyPlanOverview = StudyPlan & {
  subjects: SubjectWithProgress[];
  todayMinutes: number;
  totalMinutes: number;
  /** Dia corrente do plano (1-based) limitado à duração. */
  dayNumber: number;
  planPercent: number;
};

const DATE = "yyyy-MM-dd";

export async function listStudyPlanOverviews(
  userId: string,
  today: Date,
): Promise<StudyPlanOverview[]> {
  const db = getDb();
  const plans = await db
    .select()
    .from(studyPlans)
    .where(and(eq(studyPlans.userId, userId), eq(studyPlans.active, true)))
    .orderBy(desc(studyPlans.createdAt));
  if (plans.length === 0) return [];

  const todayKey = format(today, DATE);
  const weekStart = format(startOfWeek(today, { weekStartsOn: 0 }), DATE);
  const weekEnd = format(addDays(startOfWeek(today, { weekStartsOn: 0 }), 6), DATE);

  return Promise.all(
    plans.map(async (plan) => {
      const [subjects, weekRows, todayRow, totalRow] = await Promise.all([
        db
          .select()
          .from(studySubjects)
          .where(eq(studySubjects.planId, plan.id))
          .orderBy(asc(studySubjects.order)),
        db
          .select({
            subjectId: studySessions.subjectId,
            minutes: sum(studySessions.minutes).mapWith(Number),
          })
          .from(studySessions)
          .where(
            and(
              eq(studySessions.planId, plan.id),
              gte(studySessions.date, weekStart),
              lte(studySessions.date, weekEnd),
            ),
          )
          .groupBy(studySessions.subjectId),
        db
          .select({ minutes: sum(studySessions.minutes).mapWith(Number) })
          .from(studySessions)
          .where(and(eq(studySessions.planId, plan.id), eq(studySessions.date, todayKey))),
        db
          .select({ minutes: sum(studySessions.minutes).mapWith(Number) })
          .from(studySessions)
          .where(eq(studySessions.planId, plan.id)),
      ]);

      const weekBySubject = new Map(weekRows.map((row) => [row.subjectId, row.minutes ?? 0]));
      const dayNumber = Math.min(
        Math.max(differenceInCalendarDays(today, new Date(`${plan.startDate}T00:00:00`)) + 1, 1),
        plan.durationDays,
      );

      return {
        ...plan,
        subjects: subjects.map((subject) => {
          const weekMinutes = weekBySubject.get(subject.id) ?? 0;
          return {
            ...subject,
            weekMinutes,
            weekPercent: Math.min(Math.round((weekMinutes / subject.minutesPerWeek) * 100), 100),
          };
        }),
        todayMinutes: todayRow[0]?.minutes ?? 0,
        totalMinutes: totalRow[0]?.minutes ?? 0,
        dayNumber,
        planPercent: Math.min(Math.round((dayNumber / plan.durationDays) * 100), 100),
      };
    }),
  );
}

export async function createStudyPlan(
  userId: string,
  input: CreateStudyPlanInput,
): Promise<StudyPlan> {
  const db = getDb();
  const [plan] = await db
    .insert(studyPlans)
    .values({
      userId,
      name: input.name,
      description: input.description ?? null,
      icon: input.icon,
      durationDays: input.durationDays,
      dailyGoalMinutes: input.dailyGoalMinutes,
      startDate: input.startDate,
    })
    .returning();

  await db.insert(studySubjects).values(
    input.subjects.map((subject, order) => ({
      planId: plan.id,
      name: subject.name,
      minutesPerWeek: subject.minutesPerWeek,
      color: subject.color,
      order,
    })),
  );
  return plan;
}

async function findOwnedPlan(userId: string, planId: string): Promise<StudyPlan> {
  const [plan] = await getDb()
    .select()
    .from(studyPlans)
    .where(and(eq(studyPlans.id, planId), eq(studyPlans.userId, userId)))
    .limit(1);
  if (!plan) throw new NotFoundError("Plano de estudos não encontrado");
  return plan;
}

export async function logStudySession(
  userId: string,
  input: LogStudySessionInput,
): Promise<StudySession> {
  await findOwnedPlan(userId, input.planId);
  if (input.subjectId) {
    const [subject] = await getDb()
      .select({ id: studySubjects.id })
      .from(studySubjects)
      .where(and(eq(studySubjects.id, input.subjectId), eq(studySubjects.planId, input.planId)))
      .limit(1);
    if (!subject) throw new NotFoundError("Matéria não encontrada");
  }
  const [session] = await getDb()
    .insert(studySessions)
    .values({
      userId,
      planId: input.planId,
      subjectId: input.subjectId ?? null,
      date: input.date,
      minutes: input.minutes,
    })
    .returning();
  return session;
}

export async function deleteStudyPlan(userId: string, planId: string): Promise<void> {
  await findOwnedPlan(userId, planId);
  await getDb()
    .delete(studyPlans)
    .where(and(eq(studyPlans.id, planId), eq(studyPlans.userId, userId)));
}

/** Total de minutos estudados em [from, to] (usado pelo dashboard/gamificação). */
export async function sumStudyMinutes(userId: string, from: string, to: string): Promise<number> {
  const [row] = await getDb()
    .select({ minutes: sum(studySessions.minutes).mapWith(Number) })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        gte(studySessions.date, from),
        lte(studySessions.date, to),
      ),
    );
  return row?.minutes ?? 0;
}
