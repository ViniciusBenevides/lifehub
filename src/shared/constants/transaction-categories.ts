/**
 * Categorias financeiras padrão (contexto brasileiro), criadas no cadastro.
 * `icon` é o nome de um ícone do lucide-react, resolvido em runtime pela UI.
 */
export const DEFAULT_TRANSACTION_CATEGORIES = [
  // Receitas
  { name: "Salário", icon: "Banknote", color: "#22c55e", type: "income" },
  { name: "Freelance", icon: "Laptop", color: "#14b8a6", type: "income" },
  { name: "Rendimentos", icon: "TrendingUp", color: "#8b5cf6", type: "income" },
  { name: "Outras receitas", icon: "CirclePlus", color: "#64748b", type: "income" },
  // Despesas
  { name: "Alimentação", icon: "UtensilsCrossed", color: "#f97316", type: "expense" },
  { name: "Transporte", icon: "Car", color: "#0ea5e9", type: "expense" },
  { name: "Moradia", icon: "House", color: "#f59e0b", type: "expense" },
  { name: "Lazer", icon: "Gamepad2", color: "#ec4899", type: "expense" },
  { name: "Saúde", icon: "HeartPulse", color: "#10b981", type: "expense" },
  { name: "Assinaturas", icon: "Repeat", color: "#6366f1", type: "expense" },
  { name: "Educação", icon: "BookOpen", color: "#3b82f6", type: "expense" },
  { name: "Compras", icon: "ShoppingBag", color: "#eab308", type: "expense" },
  { name: "Investimentos", icon: "PiggyBank", color: "#8b5cf6", type: "expense" },
  { name: "Outras despesas", icon: "CircleEllipsis", color: "#64748b", type: "expense" },
] as const;
