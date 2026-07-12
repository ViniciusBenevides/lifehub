import { z } from "zod";

export const taskPriorityValues = ["low", "medium", "high"] as const;
export const taskRecurrenceValues = ["daily", "weekly", "monthly"] as const;

export const taskPrioritySchema = z.enum(taskPriorityValues);
export const taskRecurrenceSchema = z.enum(taskRecurrenceValues);

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)");

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Dê um título à tarefa").max(200, "Título muito longo"),
  notes: z.string().trim().max(2000, "Notas muito longas").nullish(),
  date: dateKey,
  priority: taskPrioritySchema,
  goalId: z.uuid().nullish(),
  recurrenceRule: taskRecurrenceSchema.nullish(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(["todo", "done"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
