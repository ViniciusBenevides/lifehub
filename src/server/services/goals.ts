import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/server/db";
import { goalMilestones, goals, habits, lifeAreas } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type {
  CreateGoalInput,
  CreateMilestoneInput,
  GoalFilters,
  UpdateGoalInput,
  UpdateMilestoneInput,
} from "@/shared/schemas/goals";

export type Goal = typeof goals.$inferSelect;
export type GoalMilestone = typeof goalMilestones.$inferSelect;
export type LifeArea = typeof lifeAreas.$inferSelect;

export type GoalWithMeta = Goal & {
  lifeArea: LifeArea;
  progressPercent: number;
  milestonesTotal: number;
  milestonesDone: number;
  habitsCount: number;
};

export type GoalDetail = GoalWithMeta & {
  milestones: GoalMilestone[];
  linkedHabits: (typeof habits.$inferSelect)[];
};

export function computeGoalProgress(
  goal: Pick<Goal, "progressType" | "currentValue" | "targetValue">,
  milestonesDone: number,
  milestonesTotal: number,
): number {
  if (goal.progressType === "manual_percent") {
    return Math.min(100, Math.max(0, goal.currentValue));
  }
  if (goal.progressType === "numeric") {
    if (!goal.targetValue || goal.targetValue <= 0) return 0;
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  }
  if (milestonesTotal === 0) return 0;
  return Math.round((milestonesDone / milestonesTotal) * 100);
}

export async function listLifeAreas(userId: string): Promise<LifeArea[]> {
  const db = getDb();
  return db
    .select()
    .from(lifeAreas)
    .where(eq(lifeAreas.userId, userId))
    .orderBy(asc(lifeAreas.order));
}

export async function listGoals(
  userId: string,
  filters: GoalFilters = {},
): Promise<GoalWithMeta[]> {
  const db = getDb();
  const conditions = [eq(goals.userId, userId)];
  if (filters.status) conditions.push(eq(goals.status, filters.status));
  if (filters.lifeAreaId) conditions.push(eq(goals.lifeAreaId, filters.lifeAreaId));

  const rows = await db
    .select({ goal: goals, lifeArea: lifeAreas })
    .from(goals)
    .innerJoin(lifeAreas, eq(goals.lifeAreaId, lifeAreas.id))
    .where(and(...conditions))
    .orderBy(desc(goals.createdAt));

  const goalIds = rows.map((row) => row.goal.id);
  const milestoneRows =
    goalIds.length > 0
      ? await getDb().select().from(goalMilestones).where(inArray(goalMilestones.goalId, goalIds))
      : [];
  const habitRows =
    goalIds.length > 0
      ? await getDb()
          .select({ id: habits.id, goalId: habits.goalId })
          .from(habits)
          .where(and(eq(habits.userId, userId), inArray(habits.goalId, goalIds)))
      : [];

  return rows.map(({ goal, lifeArea }) => {
    const milestonesOfGoal = milestoneRows.filter((m) => m.goalId === goal.id);
    const milestonesDone = milestonesOfGoal.filter((m) => m.done).length;
    return {
      ...goal,
      lifeArea,
      milestonesTotal: milestonesOfGoal.length,
      milestonesDone,
      habitsCount: habitRows.filter((h) => h.goalId === goal.id).length,
      progressPercent: computeGoalProgress(goal, milestonesDone, milestonesOfGoal.length),
    };
  });
}

async function findOwnedGoal(userId: string, goalId: string): Promise<Goal> {
  const db = getDb();
  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);
  if (!goal) throw new NotFoundError("Meta não encontrada");
  return goal;
}

export async function getGoalDetail(userId: string, goalId: string): Promise<GoalDetail> {
  const db = getDb();
  const goal = await findOwnedGoal(userId, goalId);

  const [lifeArea] = await db
    .select()
    .from(lifeAreas)
    .where(eq(lifeAreas.id, goal.lifeAreaId))
    .limit(1);
  const milestones = await db
    .select()
    .from(goalMilestones)
    .where(eq(goalMilestones.goalId, goal.id))
    .orderBy(asc(goalMilestones.order));
  const linkedHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.goalId, goal.id)));

  const milestonesDone = milestones.filter((m) => m.done).length;
  return {
    ...goal,
    lifeArea,
    milestones,
    linkedHabits,
    milestonesTotal: milestones.length,
    milestonesDone,
    habitsCount: linkedHabits.length,
    progressPercent: computeGoalProgress(goal, milestonesDone, milestones.length),
  };
}

export async function createGoal(userId: string, input: CreateGoalInput): Promise<Goal> {
  const db = getDb();
  // Garante que a área pertence ao usuário.
  const [area] = await db
    .select({ id: lifeAreas.id })
    .from(lifeAreas)
    .where(and(eq(lifeAreas.id, input.lifeAreaId), eq(lifeAreas.userId, userId)))
    .limit(1);
  if (!area) throw new NotFoundError("Área da vida não encontrada");

  const [goal] = await db
    .insert(goals)
    .values({
      userId,
      lifeAreaId: input.lifeAreaId,
      title: input.title,
      description: input.description ?? null,
      targetDate: input.targetDate ?? null,
      progressType: input.progressType,
      targetValue: input.targetValue ?? null,
      unit: input.unit ?? null,
    })
    .returning();
  return goal;
}

export async function updateGoal(
  userId: string,
  goalId: string,
  input: UpdateGoalInput,
): Promise<Goal> {
  const db = getDb();
  await findOwnedGoal(userId, goalId);

  if (input.lifeAreaId) {
    const [area] = await db
      .select({ id: lifeAreas.id })
      .from(lifeAreas)
      .where(and(eq(lifeAreas.id, input.lifeAreaId), eq(lifeAreas.userId, userId)))
      .limit(1);
    if (!area) throw new NotFoundError("Área da vida não encontrada");
  }

  const [updated] = await db
    .update(goals)
    .set({
      ...input,
      completedAt: input.status === "completed" ? new Date() : input.status ? null : undefined,
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();
  return updated;
}

export async function updateGoalProgress(
  userId: string,
  goalId: string,
  currentValue: number,
): Promise<Goal> {
  const db = getDb();
  const goal = await findOwnedGoal(userId, goalId);
  const clamped =
    goal.progressType === "manual_percent"
      ? Math.min(100, Math.max(0, currentValue))
      : currentValue;

  const [updated] = await db
    .update(goals)
    .set({ currentValue: clamped })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();
  return updated;
}

export async function completeGoal(userId: string, goalId: string): Promise<Goal> {
  const db = getDb();
  const goal = await findOwnedGoal(userId, goalId);
  const [updated] = await db
    .update(goals)
    .set({
      status: "completed",
      completedAt: new Date(),
      currentValue: goal.progressType === "manual_percent" ? 100 : goal.currentValue,
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();
  return updated;
}

export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  await findOwnedGoal(userId, goalId);
  await getDb()
    .delete(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
}

export async function addMilestone(
  userId: string,
  goalId: string,
  input: CreateMilestoneInput,
): Promise<GoalMilestone> {
  const db = getDb();
  await findOwnedGoal(userId, goalId);
  const existing = await db
    .select({ order: goalMilestones.order })
    .from(goalMilestones)
    .where(eq(goalMilestones.goalId, goalId))
    .orderBy(desc(goalMilestones.order))
    .limit(1);
  const nextOrder = existing.length > 0 ? existing[0].order + 1 : 0;

  const [milestone] = await db
    .insert(goalMilestones)
    .values({ goalId, title: input.title, dueDate: input.dueDate ?? null, order: nextOrder })
    .returning();
  return milestone;
}

async function findOwnedMilestone(userId: string, milestoneId: string): Promise<GoalMilestone> {
  const db = getDb();
  const [row] = await db
    .select({ milestone: goalMilestones })
    .from(goalMilestones)
    .innerJoin(goals, eq(goalMilestones.goalId, goals.id))
    .where(and(eq(goalMilestones.id, milestoneId), eq(goals.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Marco não encontrado");
  return row.milestone;
}

export async function updateMilestone(
  userId: string,
  milestoneId: string,
  input: UpdateMilestoneInput,
): Promise<GoalMilestone> {
  const db = getDb();
  await findOwnedMilestone(userId, milestoneId);
  const [updated] = await db
    .update(goalMilestones)
    .set(input)
    .where(eq(goalMilestones.id, milestoneId))
    .returning();
  return updated;
}

export async function deleteMilestone(userId: string, milestoneId: string): Promise<void> {
  await findOwnedMilestone(userId, milestoneId);
  await getDb().delete(goalMilestones).where(eq(goalMilestones.id, milestoneId));
}

export async function reorderMilestones(
  userId: string,
  goalId: string,
  orderedIds: string[],
): Promise<void> {
  const db = getDb();
  await findOwnedGoal(userId, goalId);
  const existing = await db
    .select({ id: goalMilestones.id })
    .from(goalMilestones)
    .where(eq(goalMilestones.goalId, goalId));
  const validIds = new Set(existing.map((m) => m.id));

  await Promise.all(
    orderedIds
      .filter((id) => validIds.has(id))
      .map((id, index) =>
        db.update(goalMilestones).set({ order: index }).where(eq(goalMilestones.id, id)),
      ),
  );
}
