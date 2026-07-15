import { z } from "zod";

export const createShoppingListSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome à lista").max(100, "Nome muito longo"),
});

export const updateShoppingListSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  done: z.boolean().optional(),
});

export const createShoppingItemSchema = z.object({
  name: z.string().trim().min(1, "Informe o item").max(120, "Nome muito longo"),
  quantity: z.number().int().min(1).max(999).optional(),
  priceCents: z.number().int().min(0).max(100_000_000).nullish(),
});

export const updateShoppingItemSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  quantity: z.number().int().min(1).max(999).optional(),
  priceCents: z.number().int().min(0).max(100_000_000).nullish().optional(),
  purchased: z.boolean().optional(),
});

export type CreateShoppingListInput = z.infer<typeof createShoppingListSchema>;
export type UpdateShoppingListInput = z.infer<typeof updateShoppingListSchema>;
export type CreateShoppingItemInput = z.infer<typeof createShoppingItemSchema>;
export type UpdateShoppingItemInput = z.infer<typeof updateShoppingItemSchema>;
