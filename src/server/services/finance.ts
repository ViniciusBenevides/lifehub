import { and, asc, desc, eq, gte, ilike, inArray, lte, sql } from "drizzle-orm";
import { addMonths, format, lastDayOfMonth, subMonths } from "date-fns";

import { getDb } from "@/server/db";
import { budgets, transactionCategories, transactions } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type {
  CreateCategoryInput,
  CreateTransactionInput,
  TransactionFilters,
  UpdateCategoryInput,
  UpdateTransactionInput,
  UpsertBudgetInput,
} from "@/shared/schemas/finance";

export type TransactionCategory = typeof transactionCategories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;

export type TransactionWithCategory = Transaction & { category: TransactionCategory };

export type CategoryTotal = {
  category: TransactionCategory;
  totalCents: number;
};

export type BudgetWithSpent = Budget & {
  category: TransactionCategory;
  spentCents: number;
};

export type MonthFlowPoint = {
  month: string;
  incomeCents: number;
  expenseCents: number;
};

export type MonthOverview = {
  month: string;
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
  transactions: TransactionWithCategory[];
  expensesByCategory: CategoryTotal[];
  budgets: BudgetWithSpent[];
};

/** Intervalo [primeiro dia, último dia] de um mês "YYYY-MM". */
export function monthRange(month: string): { start: string; end: string } {
  const first = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1);
  return { start: `${month}-01`, end: format(lastDayOfMonth(first), "yyyy-MM-dd") };
}

/** Data da ocorrência de um template no mês alvo (dia clampado ao fim do mês). */
export function occurrenceDateForMonth(templateDate: string, month: string): string {
  const day = Number(templateDate.slice(8, 10));
  const { end } = monthRange(month);
  const lastDay = Number(end.slice(8, 10));
  return `${month}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
}

// ─── Categorias ──────────────────────────────────────────────────────────────

export async function listCategories(userId: string): Promise<TransactionCategory[]> {
  return getDb()
    .select()
    .from(transactionCategories)
    .where(eq(transactionCategories.userId, userId))
    .orderBy(asc(transactionCategories.type), asc(transactionCategories.name));
}

async function findOwnedCategory(userId: string, categoryId: string): Promise<TransactionCategory> {
  const [category] = await getDb()
    .select()
    .from(transactionCategories)
    .where(and(eq(transactionCategories.id, categoryId), eq(transactionCategories.userId, userId)))
    .limit(1);
  if (!category) throw new NotFoundError("Categoria não encontrada");
  return category;
}

export async function createCategory(
  userId: string,
  input: CreateCategoryInput,
): Promise<TransactionCategory> {
  const [category] = await getDb()
    .insert(transactionCategories)
    .values({
      userId,
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
      type: input.type,
    })
    .returning();
  return category;
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<TransactionCategory> {
  await findOwnedCategory(userId, categoryId);
  const [updated] = await getDb()
    .update(transactionCategories)
    .set(input)
    .where(eq(transactionCategories.id, categoryId))
    .returning();
  return updated;
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  await findOwnedCategory(userId, categoryId);
  const [{ count }] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions)
    .where(eq(transactions.categoryId, categoryId));
  if (count > 0) {
    throw new Error("Esta categoria tem transações. Reclassifique-as antes de excluir.");
  }
  await getDb().delete(transactionCategories).where(eq(transactionCategories.id, categoryId));
}

// ─── Transações ──────────────────────────────────────────────────────────────

async function findOwnedTransaction(userId: string, transactionId: string): Promise<Transaction> {
  const [row] = await getDb()
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Transação não encontrada");
  return row;
}

export async function createTransaction(
  userId: string,
  input: CreateTransactionInput,
): Promise<Transaction> {
  await findOwnedCategory(userId, input.categoryId);
  const isRecurring = Boolean(input.isRecurring && input.recurrenceRule);
  const [transaction] = await getDb()
    .insert(transactions)
    .values({
      userId,
      categoryId: input.categoryId,
      description: input.description,
      amountCents: input.amountCents,
      type: input.type,
      date: input.date,
      isRecurring,
      recurrenceRule: isRecurring ? (input.recurrenceRule ?? null) : null,
    })
    .returning();
  return transaction;
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  await findOwnedTransaction(userId, transactionId);
  if (input.categoryId) await findOwnedCategory(userId, input.categoryId);
  const [updated] = await getDb()
    .update(transactions)
    .set(input)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
    .returning();
  return updated;
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  await findOwnedTransaction(userId, transactionId);
  await getDb()
    .delete(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));
}

export async function listTransactions(
  userId: string,
  filters: TransactionFilters = {},
): Promise<TransactionWithCategory[]> {
  const conditions = [eq(transactions.userId, userId)];
  if (filters.month) {
    const { start, end } = monthRange(filters.month);
    conditions.push(gte(transactions.date, start), lte(transactions.date, end));
  }
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters.type) conditions.push(eq(transactions.type, filters.type));
  if (filters.search) conditions.push(ilike(transactions.description, `%${filters.search}%`));

  const rows = await getDb()
    .select({ transaction: transactions, category: transactionCategories })
    .from(transactions)
    .innerJoin(transactionCategories, eq(transactions.categoryId, transactionCategories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  return rows.map(({ transaction, category }) => ({ ...transaction, category }));
}

// ─── Recorrência ─────────────────────────────────────────────────────────────

/**
 * Gera no mês alvo as ocorrências das transações recorrentes mensais que
 * ainda não existem. Idempotente: roda a cada carregamento do mês.
 */
export async function ensureRecurringForMonth(userId: string, month: string): Promise<number> {
  const db = getDb();
  const templates = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.isRecurring, true),
        eq(transactions.recurrenceRule, "monthly"),
      ),
    );
  // Só gera para meses posteriores ao mês de origem do template.
  const applicable = templates.filter((template) => template.date.slice(0, 7) < month);
  if (applicable.length === 0) return 0;

  const { start, end } = monthRange(month);
  const existing = await db
    .select({ sourceId: transactions.recurringSourceId })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        inArray(
          transactions.recurringSourceId,
          applicable.map((template) => template.id),
        ),
        gte(transactions.date, start),
        lte(transactions.date, end),
      ),
    );
  const alreadyGenerated = new Set(existing.map((row) => row.sourceId));

  const missing = applicable.filter((template) => !alreadyGenerated.has(template.id));
  if (missing.length === 0) return 0;

  await db.insert(transactions).values(
    missing.map((template) => ({
      userId,
      categoryId: template.categoryId,
      description: template.description,
      amountCents: template.amountCents,
      type: template.type,
      date: occurrenceDateForMonth(template.date, month),
      isRecurring: false,
      recurrenceRule: null,
      recurringSourceId: template.id,
    })),
  );
  return missing.length;
}

// ─── Orçamentos ──────────────────────────────────────────────────────────────

export async function upsertBudget(userId: string, input: UpsertBudgetInput): Promise<Budget> {
  await findOwnedCategory(userId, input.categoryId);
  const [budget] = await getDb()
    .insert(budgets)
    .values({
      userId,
      categoryId: input.categoryId,
      month: input.month,
      limitCents: input.limitCents,
    })
    .onConflictDoUpdate({
      target: [budgets.userId, budgets.categoryId, budgets.month],
      set: { limitCents: input.limitCents },
    })
    .returning();
  return budget;
}

export async function deleteBudget(userId: string, budgetId: string): Promise<void> {
  const [row] = await getDb()
    .select({ id: budgets.id })
    .from(budgets)
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Orçamento não encontrado");
  await getDb().delete(budgets).where(eq(budgets.id, budgetId));
}

export async function budgetsForMonth(userId: string, month: string): Promise<BudgetWithSpent[]> {
  const db = getDb();
  const { start, end } = monthRange(month);
  const rows = await db
    .select({ budget: budgets, category: transactionCategories })
    .from(budgets)
    .innerJoin(transactionCategories, eq(budgets.categoryId, transactionCategories.id))
    .where(and(eq(budgets.userId, userId), eq(budgets.month, month)))
    .orderBy(asc(transactionCategories.name));
  if (rows.length === 0) return [];

  const spentRows = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`sum(${transactions.amountCents})::int`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        gte(transactions.date, start),
        lte(transactions.date, end),
        inArray(
          transactions.categoryId,
          rows.map((row) => row.budget.categoryId),
        ),
      ),
    )
    .groupBy(transactions.categoryId);
  const spentByCategory = new Map(spentRows.map((row) => [row.categoryId, row.total]));

  return rows.map(({ budget, category }) => ({
    ...budget,
    category,
    spentCents: spentByCategory.get(budget.categoryId) ?? 0,
  }));
}

// ─── Visões agregadas ────────────────────────────────────────────────────────

export async function getMonthOverview(userId: string, month: string): Promise<MonthOverview> {
  await ensureRecurringForMonth(userId, month);

  const [monthTransactions, monthBudgets] = await Promise.all([
    listTransactions(userId, { month }),
    budgetsForMonth(userId, month),
  ]);

  let incomeCents = 0;
  let expenseCents = 0;
  const byCategory = new Map<string, CategoryTotal>();
  for (const transaction of monthTransactions) {
    if (transaction.type === "income") {
      incomeCents += transaction.amountCents;
    } else {
      expenseCents += transaction.amountCents;
      const entry = byCategory.get(transaction.categoryId);
      if (entry) {
        entry.totalCents += transaction.amountCents;
      } else {
        byCategory.set(transaction.categoryId, {
          category: transaction.category,
          totalCents: transaction.amountCents,
        });
      }
    }
  }

  return {
    month,
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
    transactions: monthTransactions,
    expensesByCategory: [...byCategory.values()].sort((a, b) => b.totalCents - a.totalCents),
    budgets: monthBudgets,
  };
}

/** Fluxo mensal (receitas x despesas) dos últimos `monthsBack` meses. */
export async function getMonthlyFlow(
  userId: string,
  referenceMonth: string,
  monthsBack = 6,
): Promise<MonthFlowPoint[]> {
  const reference = new Date(
    Number(referenceMonth.slice(0, 4)),
    Number(referenceMonth.slice(5, 7)) - 1,
    1,
  );
  const from = subMonths(reference, monthsBack - 1);

  const rows = await getDb()
    .select({
      month: sql<string>`to_char(${transactions.date}::date, 'YYYY-MM')`,
      type: transactions.type,
      total: sql<number>`sum(${transactions.amountCents})::int`,
    })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), gte(transactions.date, format(from, "yyyy-MM-dd"))))
    .groupBy(sql`1`, transactions.type);

  const points: MonthFlowPoint[] = [];
  for (let index = 0; index < monthsBack; index++) {
    const key = format(addMonths(from, index), "yyyy-MM");
    if (key > referenceMonth) break;
    const income = rows.find((row) => row.month === key && row.type === "income");
    const expense = rows.find((row) => row.month === key && row.type === "expense");
    points.push({
      month: key,
      incomeCents: income?.total ?? 0,
      expenseCents: expense?.total ?? 0,
    });
  }
  return points;
}
