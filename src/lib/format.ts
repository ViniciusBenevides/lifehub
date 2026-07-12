import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata um valor em centavos como moeda BRL (ex.: 123456 → "R$ 1.234,56"). */
export function formatBRL(amountCents: number): string {
  return brlFormatter.format(amountCents / 100);
}

/** Data por extenso em pt-BR (ex.: "sábado, 12 de julho"). */
export function formatDateLong(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

/** Data curta em pt-BR (ex.: "12/07/2026"). */
export function formatDateShort(date: Date): string {
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

/** Converte um Date para a string "yyyy-MM-dd" usada nas colunas de data do banco. */
export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
