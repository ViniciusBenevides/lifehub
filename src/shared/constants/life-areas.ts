/**
 * Áreas da vida padrão, criadas automaticamente no cadastro do usuário.
 * `icon` é o nome de um ícone do lucide-react, resolvido em runtime pela UI.
 */
export const DEFAULT_LIFE_AREAS = [
  { name: "Saúde", icon: "HeartPulse", color: "#10b981" },
  { name: "Carreira", icon: "Briefcase", color: "#0ea5e9" },
  { name: "Finanças", icon: "Wallet", color: "#f59e0b" },
  { name: "Relacionamentos", icon: "Users", color: "#f43f5e" },
  { name: "Pessoal", icon: "Sparkles", color: "#8b5cf6" },
  { name: "Estudos", icon: "GraduationCap", color: "#6366f1" },
] as const;
