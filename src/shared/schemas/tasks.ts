import { z } from "zod";

export const taskPriorityValues = ["low", "medium", "high"] as const;
export const taskStatusValues = ["todo", "in_progress", "done"] as const;
export const taskRecurrenceValues = ["daily", "weekly", "monthly"] as const;

export const taskPrioritySchema = z.enum(taskPriorityValues);
export const taskStatusSchema = z.enum(taskStatusValues);
export const taskRecurrenceSchema = z.enum(taskRecurrenceValues);

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)");
const timeKey = z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida (use HH:MM)");

export const taskTagsSchema = z
  .array(z.string().trim().min(1).max(30, "Tag muito longa"))
  .max(8, "Máximo de 8 tags");

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Dê um título à tarefa").max(200, "Título muito longo"),
  notes: z.string().trim().max(2000, "Notas muito longas").nullish(),
  date: dateKey,
  scheduledTime: timeKey.nullish(),
  priority: taskPrioritySchema,
  goalId: z.uuid().nullish(),
  projectId: z.uuid().nullish(),
  categoryId: z.uuid().nullish(),
  tags: taskTagsSchema.nullish(),
  reminderEnabled: z.boolean().optional(),
  recurrenceRule: taskRecurrenceSchema.nullish(),
  subtasks: z
    .array(z.string().trim().min(1, "Subtarefa vazia").max(200, "Subtarefa muito longa"))
    .max(20, "Máximo de 20 subtarefas")
    .optional(),
});

export const updateTaskSchema = createTaskSchema.omit({ subtasks: true }).partial().extend({
  status: taskStatusSchema.optional(),
});

export const createSubtaskSchema = z.object({
  title: z.string().trim().min(1, "Dê um título à subtarefa").max(200, "Título muito longo"),
});

export const updateSubtaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  done: z.boolean().optional(),
});

export const createTaskCategorySchema = z.object({
  name: z.string().trim().min(1, "Dê um nome à categoria").max(50, "Nome muito longo"),
  icon: z.string().trim().min(1).max(8),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
export type CreateTaskCategoryInput = z.infer<typeof createTaskCategorySchema>;
