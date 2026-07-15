"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/server/actions/goals";
import * as shoppingService from "@/server/services/shopping";
import { requireUser } from "@/server/session";
import {
  createShoppingItemSchema,
  createShoppingListSchema,
  updateShoppingItemSchema,
  updateShoppingListSchema,
} from "@/shared/schemas/shopping";

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

function revalidateShopping() {
  revalidatePath("/compras");
}

export async function createShoppingListAction(
  input: unknown,
): Promise<ActionResult<shoppingService.ShoppingList>> {
  try {
    const user = await requireUser();
    const data = createShoppingListSchema.parse(input);
    const list = await shoppingService.createShoppingList(user.id, data);
    revalidateShopping();
    return { ok: true, data: list };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateShoppingListAction(
  listId: string,
  input: unknown,
): Promise<ActionResult<shoppingService.ShoppingList>> {
  try {
    const user = await requireUser();
    const data = updateShoppingListSchema.parse(input);
    const list = await shoppingService.updateShoppingList(user.id, z.uuid().parse(listId), data);
    revalidateShopping();
    return { ok: true, data: list };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteShoppingListAction(listId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await shoppingService.deleteShoppingList(user.id, z.uuid().parse(listId));
    revalidateShopping();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function createShoppingItemAction(
  listId: string,
  input: unknown,
): Promise<ActionResult<shoppingService.ShoppingItem>> {
  try {
    const user = await requireUser();
    const data = createShoppingItemSchema.parse(input);
    const item = await shoppingService.createShoppingItem(user.id, z.uuid().parse(listId), data);
    revalidateShopping();
    return { ok: true, data: item };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateShoppingItemAction(
  itemId: string,
  input: unknown,
): Promise<ActionResult<shoppingService.ShoppingItem>> {
  try {
    const user = await requireUser();
    const data = updateShoppingItemSchema.parse(input);
    const item = await shoppingService.updateShoppingItem(user.id, z.uuid().parse(itemId), data);
    revalidateShopping();
    return { ok: true, data: item };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteShoppingItemAction(itemId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await shoppingService.deleteShoppingItem(user.id, z.uuid().parse(itemId));
    revalidateShopping();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
