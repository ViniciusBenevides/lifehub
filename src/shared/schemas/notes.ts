import { z } from "zod";

export const noteCategoryValues = [
  "estudo",
  "trabalho",
  "pessoal",
  "ideias",
  "tarefas",
  "reunioes",
] as const;

export const noteCategorySchema = z.enum(noteCategoryValues);

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "Dê um título à anotação").max(200, "Título muito longo"),
  category: noteCategorySchema,
  content: z.string().max(20000, "Conteúdo muito longo"),
  pinned: z.boolean().optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
