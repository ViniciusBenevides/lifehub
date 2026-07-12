import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { differenceInCalendarMonths } from "date-fns";

import { getDb } from "@/server/db";
import { dreams, goals, lifeAreas } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import { computeGoalProgress } from "@/server/services/goals";
import type { CreateDreamInput, UpdateDreamInput } from "@/shared/schemas/dreams";

export type Dream = typeof dreams.$inferSelect;

export type DreamWithGoal = Dream & {
  /** Progresso (0–100) da meta vinculada, se houver. */
  goalProgress: number | null;
  goalTitle: string | null;
};

export async function listDreams(userId: string): Promise<DreamWithGoal[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dreams)
    .where(eq(dreams.userId, userId))
    .orderBy(asc(dreams.order), desc(dreams.id));

  const goalIds = rows.map((dream) => dream.linkedGoalId).filter((id): id is string => id != null);
  const goalRows =
    goalIds.length > 0 ? await db.select().from(goals).where(inArray(goals.id, goalIds)) : [];
  const goalById = new Map(goalRows.map((goal) => [goal.id, goal]));

  return rows.map((dream) => {
    const goal = dream.linkedGoalId ? goalById.get(dream.linkedGoalId) : undefined;
    return {
      ...dream,
      goalProgress: goal ? computeGoalProgress(goal, 0, 0) : null,
      goalTitle: goal?.title ?? null,
    };
  });
}

async function findOwnedDream(userId: string, dreamId: string): Promise<Dream> {
  const [dream] = await getDb()
    .select()
    .from(dreams)
    .where(and(eq(dreams.id, dreamId), eq(dreams.userId, userId)))
    .limit(1);
  if (!dream) throw new NotFoundError("Sonho não encontrado");
  return dream;
}

export async function createDream(userId: string, input: CreateDreamInput): Promise<Dream> {
  const db = getDb();
  const [last] = await db
    .select({ order: dreams.order })
    .from(dreams)
    .where(eq(dreams.userId, userId))
    .orderBy(desc(dreams.order))
    .limit(1);

  const [dream] = await db
    .insert(dreams)
    .values({
      userId,
      title: input.title,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      estimatedCostCents: input.estimatedCostCents ?? null,
      targetDate: input.targetDate ?? null,
      order: last ? last.order + 1 : 0,
    })
    .returning();
  return dream;
}

export async function updateDream(
  userId: string,
  dreamId: string,
  input: UpdateDreamInput,
): Promise<Dream> {
  await findOwnedDream(userId, dreamId);
  const [updated] = await getDb()
    .update(dreams)
    .set(input)
    .where(and(eq(dreams.id, dreamId), eq(dreams.userId, userId)))
    .returning();
  return updated;
}

export async function deleteDream(userId: string, dreamId: string): Promise<void> {
  await findOwnedDream(userId, dreamId);
  await getDb()
    .delete(dreams)
    .where(and(eq(dreams.id, dreamId), eq(dreams.userId, userId)));
}

export async function reorderDreams(userId: string, orderedIds: string[]): Promise<void> {
  const db = getDb();
  const owned = await db.select({ id: dreams.id }).from(dreams).where(eq(dreams.userId, userId));
  const validIds = new Set(owned.map((dream) => dream.id));

  await Promise.all(
    orderedIds
      .filter((id) => validIds.has(id))
      .map((id, index) => db.update(dreams).set({ order: index }).where(eq(dreams.id, id))),
  );
}

export type ConvertResult = {
  dream: Dream;
  goalId: string;
  /** Sugestão de economia mensal (centavos) = custo ÷ meses até o prazo. */
  monthlySavingCents: number | null;
};

/**
 * Transforma o sonho em uma meta numérica de economia (alvo em reais),
 * vincula as duas e devolve a sugestão de aporte mensal.
 */
export async function convertDreamToGoal(
  userId: string,
  dreamId: string,
  lifeAreaId: string,
): Promise<ConvertResult> {
  const db = getDb();
  const dream = await findOwnedDream(userId, dreamId);

  const [area] = await db
    .select({ id: lifeAreas.id })
    .from(lifeAreas)
    .where(and(eq(lifeAreas.id, lifeAreaId), eq(lifeAreas.userId, userId)))
    .limit(1);
  if (!area) throw new NotFoundError("Área da vida não encontrada");
  if (dream.linkedGoalId) throw new Error("Este sonho já foi transformado em meta.");

  const hasCost = dream.estimatedCostCents != null && dream.estimatedCostCents > 0;
  const [goal] = await db
    .insert(goals)
    .values({
      userId,
      lifeAreaId,
      title: dream.title,
      description: dream.description,
      targetDate: dream.targetDate,
      // Com custo: meta numérica de economia em R$; sem custo: percentual manual.
      progressType: hasCost ? "numeric" : "manual_percent",
      targetValue: hasCost ? Math.round(dream.estimatedCostCents! / 100) : null,
      unit: hasCost ? "R$" : null,
    })
    .returning();

  const [updatedDream] = await db
    .update(dreams)
    .set({ linkedGoalId: goal.id, status: "in_progress" })
    .where(eq(dreams.id, dream.id))
    .returning();

  let monthlySavingCents: number | null = null;
  if (hasCost && dream.targetDate) {
    const months = Math.max(1, differenceInCalendarMonths(new Date(dream.targetDate), new Date()));
    monthlySavingCents = Math.ceil(dream.estimatedCostCents! / months);
  }

  return { dream: updatedDream, goalId: goal.id, monthlySavingCents };
}
