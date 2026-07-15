import { z } from "zod";

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)");

export const moodValues = ["feliz", "calmo", "neutro", "triste", "ansioso", "irritado"] as const;
export const moodSchema = z.enum(moodValues);

export const birthdayRelationshipValues = [
  "familia",
  "amigo",
  "trabalho",
  "relacionamento",
  "outro",
] as const;
export const birthdayRelationshipSchema = z.enum(birthdayRelationshipValues);

export const createBirthdaySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(120, "Nome muito longo"),
  birthDate: dateKey,
  relationship: birthdayRelationshipSchema,
  notes: z.string().trim().max(1000, "Notas muito longas").nullish(),
});
export const updateBirthdaySchema = createBirthdaySchema.partial();

export const upsertMoodSchema = z.object({
  date: dateKey,
  mood: moodSchema,
  note: z.string().trim().max(500, "Nota muito longa").nullish(),
});

export const createDiaryEntrySchema = z.object({
  date: dateKey,
  title: z.string().trim().max(200, "Título muito longo").nullish(),
  content: z.string().trim().min(1, "Escreva algo no diário").max(20000, "Texto muito longo"),
  mood: moodSchema.nullish(),
});
export const updateDiaryEntrySchema = createDiaryEntrySchema.partial();

export const createDreamEntrySchema = z.object({
  date: dateKey,
  title: z.string().trim().min(1, "Dê um título ao sonho").max(200, "Título muito longo"),
  description: z.string().trim().max(10000, "Descrição muito longa").nullish(),
  lucid: z.boolean().optional(),
  nightmare: z.boolean().optional(),
  clarity: z.number().int().min(0).max(5),
  mood: moodSchema.nullish(),
});
export const updateDreamEntrySchema = createDreamEntrySchema.partial();

export type CreateBirthdayInput = z.infer<typeof createBirthdaySchema>;
export type UpdateBirthdayInput = z.infer<typeof updateBirthdaySchema>;
export type UpsertMoodInput = z.infer<typeof upsertMoodSchema>;
export type CreateDiaryEntryInput = z.infer<typeof createDiaryEntrySchema>;
export type UpdateDiaryEntryInput = z.infer<typeof updateDiaryEntrySchema>;
export type CreateDreamEntryInput = z.infer<typeof createDreamEntrySchema>;
export type UpdateDreamEntryInput = z.infer<typeof updateDreamEntrySchema>;
