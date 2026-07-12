import { z } from "zod";

export const transactionTypeValues = ["income", "expense"] as const;
export const transactionTypeSchema = z.enum(transactionTypeValues);

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)");
export const monthKeySchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mês inválido (use AAAA-MM)");

export const createTransactionSchema = z.object({
  description: z.string().trim().min(1, "Descreva a transação").max(200, "Descrição muito longa"),
  amountCents: z
    .number()
    .int()
    .positive("Informe um valor maior que zero")
    .max(1_000_000_000_00, "Valor muito alto"),
  type: transactionTypeSchema,
  categoryId: z.uuid("Escolha uma categoria"),
  date: dateKey,
  isRecurring: z.boolean().optional(),
  // Por ora apenas recorrência mensal (salário, assinaturas, aluguel…).
  recurrenceRule: z.literal("monthly").nullish(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFiltersSchema = z.object({
  month: monthKeySchema.optional(),
  categoryId: z.uuid().optional(),
  type: transactionTypeSchema.optional(),
  search: z.string().trim().max(100).optional(),
});

export const upsertBudgetSchema = z.object({
  categoryId: z.uuid("Escolha uma categoria"),
  month: monthKeySchema,
  limitCents: z.number().int().positive("Informe um limite maior que zero"),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Dê um nome à categoria").max(60, "Nome muito longo"),
  icon: z.string().trim().max(60).nullish(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida")
    .nullish(),
  type: transactionTypeSchema,
});

export const updateCategorySchema = createCategorySchema.partial().omit({ type: true });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
