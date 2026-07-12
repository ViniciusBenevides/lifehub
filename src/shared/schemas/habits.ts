import { z } from "zod";

export const habitFrequencyTypeValues = ["daily", "weekly_days", "times_per_week"] as const;
export const timeOfDayValues = ["morning", "afternoon", "evening", "anytime"] as const;

export const habitFrequencyTypeSchema = z.enum(habitFrequencyTypeValues);
export const timeOfDaySchema = z.enum(timeOfDayValues);

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)");

const habitBase = z.object({
  name: z.string().trim().min(2, "Dê um nome ao hábito").max(120, "Nome muito longo"),
  icon: z.string().trim().max(60).nullish(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida")
    .nullish(),
  frequencyType: habitFrequencyTypeSchema,
  // 0 = domingo … 6 = sábado
  weeklyDays: z.array(z.number().int().min(0).max(6)).max(7).nullish(),
  timesPerWeek: z.number().int().min(1).max(7).nullish(),
  timeOfDay: timeOfDaySchema,
  goalId: z.uuid().nullish(),
});

function validateFrequency(
  habit: { frequencyType?: string; weeklyDays?: number[] | null; timesPerWeek?: number | null },
  ctx: z.RefinementCtx,
) {
  if (habit.frequencyType === "weekly_days" && (habit.weeklyDays?.length ?? 0) === 0) {
    ctx.addIssue({
      code: "custom",
      message: "Escolha pelo menos um dia da semana",
      path: ["weeklyDays"],
    });
  }
  if (habit.frequencyType === "times_per_week" && habit.timesPerWeek == null) {
    ctx.addIssue({
      code: "custom",
      message: "Informe quantas vezes por semana",
      path: ["timesPerWeek"],
    });
  }
}

export const createHabitSchema = habitBase.superRefine(validateFrequency);

export const updateHabitSchema = habitBase
  .partial()
  .extend({ active: z.boolean().optional() })
  .superRefine((habit, ctx) => {
    if (habit.frequencyType) {
      validateFrequency(habit, ctx);
    }
  });

/** Marca/desmarca o hábito em uma data. */
export const toggleHabitLogSchema = z.object({
  date: dateKey,
  done: z.boolean(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type ToggleHabitLogInput = z.infer<typeof toggleHabitLogSchema>;
