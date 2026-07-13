import {
  Cake,
  ChartNoAxesColumn,
  ChartSpline,
  ClipboardPen,
  CloudUpload,
  FolderKanban,
  GraduationCap,
  House,
  ListTodo,
  Menu,
  MoonStar,
  NotebookPen,
  Palette,
  Repeat,
  Search,
  ShoppingCart,
  Smile,
  Star,
  Target,
  Timer,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

/** Grouped navigation, mirrored by the sidebar (desktop) and the "Mais" page. */
export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ label: "Início", href: "/inicio", icon: House }],
  },
  {
    label: "Produtividade",
    items: [
      { label: "Tarefas", href: "/atividades", icon: ListTodo },
      { label: "Projetos", href: "/projetos", icon: FolderKanban },
      { label: "Hábitos", href: "/habitos", icon: Repeat },
      { label: "Metas", href: "/metas", icon: Target },
      { label: "Estudos", href: "/estudos", icon: GraduationCap },
      { label: "Notas", href: "/notas", icon: ClipboardPen },
      { label: "Pomodoro", href: "/pomodoro", icon: Timer },
    ],
  },
  {
    label: "Finanças",
    items: [
      { label: "Gestão", href: "/financas", icon: Wallet },
      { label: "Estatísticas", href: "/financas/estatisticas", icon: ChartSpline },
      { label: "Compras", href: "/compras", icon: ShoppingCart },
    ],
  },
  {
    label: "Vida Pessoal",
    items: [
      { label: "Aniversários", href: "/aniversarios", icon: Cake },
      { label: "Diário de Sonhos", href: "/diario-sonhos", icon: MoonStar },
      { label: "Diário", href: "/diario", icon: NotebookPen },
      { label: "Humor", href: "/humor", icon: Smile },
      { label: "Mural dos Sonhos", href: "/sonhos", icon: Star },
    ],
  },
  {
    label: "Análise",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: ChartNoAxesColumn },
      { label: "Perfil", href: "/perfil", icon: Trophy },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { label: "Pesquisar", href: "/pesquisar", icon: Search },
      { label: "Backup", href: "/backup", icon: CloudUpload },
      { label: "Temas", href: "/temas", icon: Palette },
    ],
  },
];

/** Bottom tabs (mobile): 4 main modules + "Mais". */
export const MOBILE_TABS: NavItem[] = [
  { label: "Início", href: "/inicio", icon: House },
  { label: "Tarefas", href: "/atividades", icon: ListTodo },
  { label: "Hábitos", href: "/habitos", icon: Repeat },
  { label: "Finanças", href: "/financas", icon: Wallet },
  { label: "Mais", href: "/mais", icon: Menu },
];

const TAB_HREFS = new Set(MOBILE_TABS.map((tab) => tab.href));

/** Everything not reachable from the bottom tabs, grouped for the "Mais" page. */
export const MORE_GROUPS: NavGroup[] = NAV_GROUPS.map((group) => ({
  label: group.label,
  items: group.items.filter((item) => !TAB_HREFS.has(item.href)),
})).filter((group) => group.items.length > 0);

// Kept for compatibility with existing imports (flat list of all destinations).
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export const MORE_ITEMS: NavItem[] = MORE_GROUPS.flatMap((group) => group.items);

/** Active-state helper: exact match or a nested route of `href`. */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
