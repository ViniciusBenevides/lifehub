import { z } from "zod";

export const projectStatusValues = ["active", "completed", "archived"] as const;
export const projectStatusSchema = z.enum(projectStatusValues);

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)");

export const PROJECT_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#eab308",
  "#6366f1",
  "#06b6d4",
] as const;

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome ao projeto").max(100, "Nome muito longo"),
  description: z.string().trim().max(1000, "Descrição muito longa").nullish(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  deadline: dateKey.nullish(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: projectStatusSchema.optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
