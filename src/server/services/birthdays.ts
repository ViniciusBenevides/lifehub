import { and, asc, eq } from "drizzle-orm";
import { addYears, differenceInCalendarDays, format } from "date-fns";

import { getDb } from "@/server/db";
import { birthdays } from "@/server/db/schema";
import { NotFoundError } from "@/server/services/errors";
import type { CreateBirthdayInput, UpdateBirthdayInput } from "@/shared/schemas/personal";

export type Birthday = typeof birthdays.$inferSelect;

export type BirthdayWithNext = Birthday & {
  /** Próxima ocorrência (AAAA-MM-DD). */
  nextDate: string;
  /** Dias até a próxima ocorrência (0 = hoje). */
  daysUntil: number;
  /** Idade que a pessoa completa na próxima ocorrência. */
  turnsAge: number;
};

/** Calcula a próxima ocorrência do aniversário a partir de `today` (função pura). */
export function nextOccurrence(
  birthDate: string,
  today: Date,
): Pick<BirthdayWithNext, "nextDate" | "daysUntil" | "turnsAge"> {
  const [birthYear, month, day] = birthDate.split("-").map(Number);
  const todayYear = today.getFullYear();
  // 29/02 vira 01/03 em anos não bissextos (Date normaliza sozinho).
  let next = new Date(todayYear, month - 1, day);
  const startOfToday = new Date(todayYear, today.getMonth(), today.getDate());
  if (next < startOfToday) next = addYears(next, 1);
  return {
    nextDate: format(next, "yyyy-MM-dd"),
    daysUntil: differenceInCalendarDays(next, startOfToday),
    turnsAge: next.getFullYear() - birthYear,
  };
}

export async function listBirthdays(userId: string, today: Date): Promise<BirthdayWithNext[]> {
  const rows = await getDb()
    .select()
    .from(birthdays)
    .where(eq(birthdays.userId, userId))
    .orderBy(asc(birthdays.name));
  return rows
    .map((row) => ({ ...row, ...nextOccurrence(row.birthDate, today) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

async function findOwned(userId: string, birthdayId: string): Promise<Birthday> {
  const [row] = await getDb()
    .select()
    .from(birthdays)
    .where(and(eq(birthdays.id, birthdayId), eq(birthdays.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Aniversário não encontrado");
  return row;
}

export async function createBirthday(
  userId: string,
  input: CreateBirthdayInput,
): Promise<Birthday> {
  const [row] = await getDb()
    .insert(birthdays)
    .values({
      userId,
      name: input.name,
      birthDate: input.birthDate,
      relationship: input.relationship,
      notes: input.notes ?? null,
    })
    .returning();
  return row;
}

export async function updateBirthday(
  userId: string,
  birthdayId: string,
  input: UpdateBirthdayInput,
): Promise<Birthday> {
  await findOwned(userId, birthdayId);
  const [row] = await getDb()
    .update(birthdays)
    .set(input)
    .where(and(eq(birthdays.id, birthdayId), eq(birthdays.userId, userId)))
    .returning();
  return row;
}

export async function deleteBirthday(userId: string, birthdayId: string): Promise<void> {
  await findOwned(userId, birthdayId);
  await getDb()
    .delete(birthdays)
    .where(and(eq(birthdays.id, birthdayId), eq(birthdays.userId, userId)));
}
