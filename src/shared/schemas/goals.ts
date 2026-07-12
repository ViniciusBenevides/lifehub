import { z } from "zod";

export const goalStatusValues = ["active", "completed", "paused", "archived"] as const;
export const goalProgressTypeValues = ["manual_percent", "milestones", "numeric"] as const;

export const goalStatusSchema = z.enum(goalStatusValues);
export const goalProgressTypeSchema = z.enum(goalProgressTypeValues);

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)");

export const createGoalSchema = z
  .object({
    title: z.string().trim().min(2, "Dê um título à meta").max(200, "Título muito longo"),
    description: z.string().trim().max(2000, "Descrição muito longa").optional(),
    lifeAreaId: z.uuid("Escolha uma área da vida"),
    progressType: goalProgressTypeSchema,
    targetDate: dateKey.nullish(),
    targetValue: z.number().int().positive("Alvo deve ser positivo").nullish(),
    unit: z.string().trim().max(30, "Unidade muito longa").nullish(),
  })
  .refine((goal) => goal.progressType !== "numeric" || goal.targetValue != null, {
    message: "Metas numéricas precisam de um valor alvo",
    path: ["targetValue"],
  });

export const updateGoalSchema = z.object({
  title: z.string().trim().min(2, "Dê um título à meta").max(200).optional(),
  description: z.string().trim().max(2000).nullish(),
  lifeAreaId: z.uuid().optional(),
  targetDate: dateKey.nullish(),
  status: goalStatusSchema.optional(),
  targetValue: z.number().int().positive().nullish(),
  unit: z.string().trim().max(30).nullish(),
});

/** Atualização de progresso: percentual manual (0–100) ou valor numérico atual. */
export const updateGoalProgressSchema = z.object({
  currentValue: z.number().int().min(0, "Valor não pode ser negativo"),
});

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1, "Dê um título ao marco").max(200, "Título muito longo"),
  dueDate: dateKey.nullish(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  done: z.boolean().optional(),
  dueDate: dateKey.nullish(),
});

export const reorderMilestonesSchema = z.object({
  orderedIds: z.array(z.uuid()).min(1),
});

export const goalFiltersSchema = z.object({
  status: goalStatusSchema.optional(),
  lifeAreaId: z.uuid().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type UpdateGoalProgressInput = z.infer<typeof updateGoalProgressSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type GoalFilters = z.infer<typeof goalFiltersSchema>;
