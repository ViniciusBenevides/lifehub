import { z } from "zod";

export const pomodoroKindValues = ["focus", "short_break", "long_break"] as const;
export const pomodoroKindSchema = z.enum(pomodoroKindValues);

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)");

export const recordPomodoroSchema = z.object({
  kind: pomodoroKindSchema,
  durationMinutes: z.number().int().min(1).max(240),
  date: dateKey,
  taskId: z.uuid().nullish(),
});

export type RecordPomodoroInput = z.infer<typeof recordPomodoroSchema>;
