import { z } from "zod";

export const dreamStatusValues = ["dreaming", "in_progress", "achieved"] as const;
export const dreamStatusSchema = z.enum(dreamStatusValues);

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)");

export const createDreamSchema = z.object({
  title: z.string().trim().min(2, "Dê um título ao sonho").max(200, "Título muito longo"),
  description: z.string().trim().max(2000, "Descrição muito longa").nullish(),
  imageUrl: z
    .url("URL de imagem inválida")
    .max(2000)
    .nullish()
    .or(z.literal("").transform(() => null)),
  estimatedCostCents: z.number().int().positive("Custo deve ser positivo").nullish(),
  targetDate: dateKey.nullish(),
});

export const updateDreamSchema = createDreamSchema.partial().extend({
  status: dreamStatusSchema.optional(),
});

export const reorderDreamsSchema = z.object({
  orderedIds: z.array(z.uuid()).min(1),
});

export const convertDreamSchema = z.object({
  lifeAreaId: z.uuid("Escolha uma área da vida"),
});

export type CreateDreamInput = z.infer<typeof createDreamSchema>;
export type UpdateDreamInput = z.infer<typeof updateDreamSchema>;
export type ConvertDreamInput = z.infer<typeof convertDreamSchema>;
