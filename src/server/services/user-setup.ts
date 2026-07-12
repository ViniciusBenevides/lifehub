import { eq } from "drizzle-orm";

import { getDb } from "@/server/db";
import { lifeAreas, transactionCategories } from "@/server/db/schema";
import { DEFAULT_LIFE_AREAS, DEFAULT_TRANSACTION_CATEGORIES } from "@/shared/constants";

/**
 * Cria as áreas da vida e as categorias financeiras padrão para um usuário
 * recém-cadastrado. Idempotente: não duplica se o usuário já tiver dados.
 */
export async function seedUserDefaults(userId: string): Promise<void> {
  const db = getDb();

  const existingAreas = await db
    .select({ id: lifeAreas.id })
    .from(lifeAreas)
    .where(eq(lifeAreas.userId, userId))
    .limit(1);

  if (existingAreas.length === 0) {
    await db.insert(lifeAreas).values(
      DEFAULT_LIFE_AREAS.map((area, index) => ({
        userId,
        name: area.name,
        icon: area.icon,
        color: area.color,
        order: index,
      })),
    );
  }

  const existingCategories = await db
    .select({ id: transactionCategories.id })
    .from(transactionCategories)
    .where(eq(transactionCategories.userId, userId))
    .limit(1);

  if (existingCategories.length === 0) {
    await db.insert(transactionCategories).values(
      DEFAULT_TRANSACTION_CATEGORIES.map((category) => ({
        userId,
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      })),
    );
  }
}
