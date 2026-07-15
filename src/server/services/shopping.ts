import { and, asc, count, desc, eq } from "drizzle-orm";

import { getDb } from "@/server/db";
import { shoppingItems, shoppingLists } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type {
  CreateShoppingItemInput,
  CreateShoppingListInput,
  UpdateShoppingItemInput,
  UpdateShoppingListInput,
} from "@/shared/schemas/shopping";

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type ShoppingItem = typeof shoppingItems.$inferSelect;

export type ShoppingListWithItems = ShoppingList & {
  items: ShoppingItem[];
  purchasedCount: number;
  totalCents: number;
  purchasedCents: number;
};

export async function listShoppingLists(userId: string): Promise<ShoppingListWithItems[]> {
  const db = getDb();
  const lists = await db
    .select()
    .from(shoppingLists)
    .where(eq(shoppingLists.userId, userId))
    .orderBy(asc(shoppingLists.done), desc(shoppingLists.createdAt));
  if (lists.length === 0) return [];

  const items = await db
    .select({ item: shoppingItems })
    .from(shoppingItems)
    .innerJoin(shoppingLists, eq(shoppingItems.listId, shoppingLists.id))
    .where(eq(shoppingLists.userId, userId))
    .orderBy(asc(shoppingItems.order), asc(shoppingItems.id));

  const byList = new Map<string, ShoppingItem[]>();
  for (const { item } of items) {
    const list = byList.get(item.listId) ?? [];
    list.push(item);
    byList.set(item.listId, list);
  }

  return lists.map((list) => {
    const listItems = byList.get(list.id) ?? [];
    return {
      ...list,
      items: listItems,
      purchasedCount: listItems.filter((item) => item.purchased).length,
      totalCents: listItems.reduce((sum, item) => sum + (item.priceCents ?? 0) * item.quantity, 0),
      purchasedCents: listItems
        .filter((item) => item.purchased)
        .reduce((sum, item) => sum + (item.priceCents ?? 0) * item.quantity, 0),
    };
  });
}

async function findOwnedList(userId: string, listId: string): Promise<ShoppingList> {
  const [list] = await getDb()
    .select()
    .from(shoppingLists)
    .where(and(eq(shoppingLists.id, listId), eq(shoppingLists.userId, userId)))
    .limit(1);
  if (!list) throw new NotFoundError("Lista não encontrada");
  return list;
}

export async function createShoppingList(
  userId: string,
  input: CreateShoppingListInput,
): Promise<ShoppingList> {
  const [list] = await getDb()
    .insert(shoppingLists)
    .values({ userId, name: input.name })
    .returning();
  return list;
}

export async function updateShoppingList(
  userId: string,
  listId: string,
  input: UpdateShoppingListInput,
): Promise<ShoppingList> {
  await findOwnedList(userId, listId);
  const [list] = await getDb()
    .update(shoppingLists)
    .set(input)
    .where(and(eq(shoppingLists.id, listId), eq(shoppingLists.userId, userId)))
    .returning();
  return list;
}

export async function deleteShoppingList(userId: string, listId: string): Promise<void> {
  await findOwnedList(userId, listId);
  await getDb()
    .delete(shoppingLists)
    .where(and(eq(shoppingLists.id, listId), eq(shoppingLists.userId, userId)));
}

export async function createShoppingItem(
  userId: string,
  listId: string,
  input: CreateShoppingItemInput,
): Promise<ShoppingItem> {
  await findOwnedList(userId, listId);
  const [{ value: total }] = await getDb()
    .select({ value: count() })
    .from(shoppingItems)
    .where(eq(shoppingItems.listId, listId));
  const [item] = await getDb()
    .insert(shoppingItems)
    .values({
      listId,
      name: input.name,
      quantity: input.quantity ?? 1,
      priceCents: input.priceCents ?? null,
      order: total,
    })
    .returning();
  return item;
}

async function findOwnedItem(userId: string, itemId: string): Promise<ShoppingItem> {
  const [row] = await getDb()
    .select({ item: shoppingItems })
    .from(shoppingItems)
    .innerJoin(shoppingLists, eq(shoppingItems.listId, shoppingLists.id))
    .where(and(eq(shoppingItems.id, itemId), eq(shoppingLists.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Item não encontrado");
  return row.item;
}

export async function updateShoppingItem(
  userId: string,
  itemId: string,
  input: UpdateShoppingItemInput,
): Promise<ShoppingItem> {
  await findOwnedItem(userId, itemId);
  const [item] = await getDb()
    .update(shoppingItems)
    .set(input)
    .where(eq(shoppingItems.id, itemId))
    .returning();
  return item;
}

export async function deleteShoppingItem(userId: string, itemId: string): Promise<void> {
  await findOwnedItem(userId, itemId);
  await getDb().delete(shoppingItems).where(eq(shoppingItems.id, itemId));
}
