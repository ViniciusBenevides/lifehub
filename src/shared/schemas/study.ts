import { z } from "zod";

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)");

export const studySubjectInputSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome à matéria").max(100, "Nome muito longo"),
  minutesPerWeek: z
    .number()
    .int()
    .min(15, "Mínimo de 15 min/semana")
    .max(7 * 24 * 60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
});

export const createStudyPlanSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome ao plano").max(100, "Nome muito longo"),
  description: z.string().trim().max(500, "Descrição muito longa").nullish(),
  icon: z.string().trim().min(1).max(8),
  durationDays: z.number().int().min(7, "Duração mínima de 7 dias").max(730),
  dailyGoalMinutes: z
    .number()
    .int()
    .min(15, "Meta mínima de 15 min")
    .max(16 * 60),
  startDate: dateKey,
  subjects: z.array(studySubjectInputSchema).min(1, "Adicione ao menos uma matéria").max(15),
});

export const logStudySessionSchema = z.object({
  planId: z.uuid(),
  subjectId: z.uuid().nullish(),
  date: dateKey,
  minutes: z
    .number()
    .int()
    .min(1, "Registre ao menos 1 minuto")
    .max(16 * 60),
});

export type CreateStudyPlanInput = z.infer<typeof createStudyPlanSchema>;
export type LogStudySessionInput = z.infer<typeof logStudySessionSchema>;
