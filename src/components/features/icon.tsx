import {
  Banknote,
  BookOpen,
  Brain,
  Briefcase,
  Bike,
  Car,
  Circle,
  CircleEllipsis,
  CirclePlus,
  Coffee,
  Droplets,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  House,
  Languages,
  Laptop,
  Moon,
  Music,
  PenLine,
  PiggyBank,
  Pill,
  Repeat,
  Salad,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Registro dos ícones referenciados por nome no banco (áreas, categorias,
 * hábitos). Mantido curado para não embarcar a biblioteca lucide inteira.
 */
const ICONS: Record<string, LucideIcon> = {
  Banknote,
  BookOpen,
  Brain,
  Briefcase,
  Bike,
  Car,
  Circle,
  CircleEllipsis,
  CirclePlus,
  Coffee,
  Droplets,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  House,
  Languages,
  Laptop,
  Moon,
  Music,
  PenLine,
  PiggyBank,
  Pill,
  Repeat,
  Salad,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
};

/** Opções oferecidas ao usuário ao criar hábitos. */
export const HABIT_ICON_OPTIONS = [
  "Dumbbell",
  "Droplets",
  "BookOpen",
  "Moon",
  "Sun",
  "Pill",
  "Salad",
  "Bike",
  "PenLine",
  "Music",
  "Brain",
  "Languages",
  "Coffee",
  "Smartphone",
] as const;

export function DynamicIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon = (name && ICONS[name]) || Circle;
  return <Icon className={className} aria-hidden />;
}
