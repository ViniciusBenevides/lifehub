import type { birthdayRelationshipValues, moodValues } from "@/shared/schemas/personal";

export type Mood = (typeof moodValues)[number];
export type BirthdayRelationship = (typeof birthdayRelationshipValues)[number];

export const MOOD_META: Record<Mood, { emoji: string; label: string; color: string }> = {
  feliz: { emoji: "😄", label: "Feliz", color: "#22c55e" },
  calmo: { emoji: "😌", label: "Calmo", color: "#10b981" },
  neutro: { emoji: "😐", label: "Neutro", color: "#a1a1aa" },
  triste: { emoji: "😢", label: "Triste", color: "#3b82f6" },
  ansioso: { emoji: "😰", label: "Ansioso", color: "#f59e0b" },
  irritado: { emoji: "😠", label: "Irritado", color: "#ef4444" },
};

export const RELATIONSHIP_META: Record<BirthdayRelationship, string> = {
  familia: "Família",
  amigo: "Amigo(a)",
  trabalho: "Trabalho",
  relacionamento: "Relacionamento",
  outro: "Outro",
};
