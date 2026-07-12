"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/server/actions/goals";
import * as financeService from "@/server/services/finance";
import { requireUser } from "@/server/session";
import {
  createCategorySchema,
  createTransactionSchema,
  updateCategorySchema,
  updateTransactionSchema,
  upsertBudgetSchema,
} from "@/shared/schemas/finance";

function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos";
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

function revalidateFinance() {
  revalidatePath("/financas");
  revalidatePath("/dashboard");
}

export async function createTransactionAction(
  input: unknown,
): Promise<ActionResult<financeService.Transaction>> {
  try {
    const user = await requireUser();
    const data = createTransactionSchema.parse(input);
    const transaction = await financeService.createTransaction(user.id, data);
    revalidateFinance();
    return { ok: true, data: transaction };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateTransactionAction(
  transactionId: string,
  input: unknown,
): Promise<ActionResult<financeService.Transaction>> {
  try {
    const user = await requireUser();
    const data = updateTransactionSchema.parse(input);
    const transaction = await financeService.updateTransaction(
      user.id,
      z.uuid().parse(transactionId),
      data,
    );
    revalidateFinance();
    return { ok: true, data: transaction };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteTransactionAction(transactionId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await financeService.deleteTransaction(user.id, z.uuid().parse(transactionId));
    revalidateFinance();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function upsertBudgetAction(
  input: unknown,
): Promise<ActionResult<financeService.Budget>> {
  try {
    const user = await requireUser();
    const data = upsertBudgetSchema.parse(input);
    const budget = await financeService.upsertBudget(user.id, data);
    revalidateFinance();
    return { ok: true, data: budget };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteBudgetAction(budgetId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await financeService.deleteBudget(user.id, z.uuid().parse(budgetId));
    revalidateFinance();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function createCategoryAction(
  input: unknown,
): Promise<ActionResult<financeService.TransactionCategory>> {
  try {
    const user = await requireUser();
    const data = createCategorySchema.parse(input);
    const category = await financeService.createCategory(user.id, data);
    revalidateFinance();
    return { ok: true, data: category };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  input: unknown,
): Promise<ActionResult<financeService.TransactionCategory>> {
  try {
    const user = await requireUser();
    const data = updateCategorySchema.parse(input);
    const category = await financeService.updateCategory(user.id, z.uuid().parse(categoryId), data);
    revalidateFinance();
    return { ok: true, data: category };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await financeService.deleteCategory(user.id, z.uuid().parse(categoryId));
    revalidateFinance();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
