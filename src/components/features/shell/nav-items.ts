import {
  CalendarCheck,
  LayoutDashboard,
  Menu,
  Repeat,
  Star,
  Target,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/** Navegação completa, exibida na sidebar (desktop). */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Metas", href: "/metas", icon: Target },
  { label: "Hábitos", href: "/habitos", icon: Repeat },
  { label: "Finanças", href: "/financas", icon: Wallet },
  { label: "Sonhos", href: "/sonhos", icon: Star },
  { label: "Atividades", href: "/atividades", icon: CalendarCheck },
];

/** Abas inferiores (mobile): 4 módulos principais + "Mais". */
export const MOBILE_TABS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Metas", href: "/metas", icon: Target },
  { label: "Hábitos", href: "/habitos", icon: Repeat },
  { label: "Finanças", href: "/financas", icon: Wallet },
  { label: "Mais", href: "/mais", icon: Menu },
];

/** Itens extras acessíveis pela página "Mais" no mobile. */
export const MORE_ITEMS: NavItem[] = [
  { label: "Sonhos", href: "/sonhos", icon: Star },
  { label: "Atividades", href: "/atividades", icon: CalendarCheck },
  { label: "Perfil", href: "/perfil", icon: User },
];
