import {
  Cake,
  ChartColumnBig,
  ChartNoAxesColumn,
  ChartSpline,
  ClipboardPen,
  CloudUpload,
  FolderKanban,
  GraduationCap,
  ListTodo,
  MoonStar,
  NotebookPen,
  Palette,
  Search,
  ShoppingCart,
  Smile,
  SquareCheckBig,
  Star,
  Target,
  Timer,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** Keys resolved at render time against `HubData` counters. */
export type HubStatKey = "tasks" | "habits" | "goals" | "balance" | "level";

export type HubItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Static Tailwind classes for the colored icon tile. */
  tile: string;
  /** Static description shown when there is no dynamic stat. */
  sublabel?: string;
  statKey?: HubStatKey;
  /** Wide cards span the full row (hero card of a section). */
  wide?: boolean;
};

export type HubSection = {
  title: string;
  layout: "grid" | "list";
  items: HubItem[];
};

export const HUB_PRIMARY_SECTIONS: HubSection[] = [
  {
    title: "Produtividade",
    layout: "grid",
    items: [
      {
        label: "Tarefas",
        href: "/atividades",
        icon: ListTodo,
        tile: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        statKey: "tasks",
        wide: true,
      },
      {
        label: "Projetos",
        href: "/projetos",
        icon: FolderKanban,
        tile: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
        sublabel: "Organize iniciativas",
      },
      {
        label: "Hábitos",
        href: "/habitos",
        icon: SquareCheckBig,
        tile: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        statKey: "habits",
      },
      {
        label: "Estudos",
        href: "/estudos",
        icon: GraduationCap,
        tile: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
        sublabel: "Planos e agenda",
      },
      {
        label: "Notas",
        href: "/notas",
        icon: ClipboardPen,
        tile: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
        sublabel: "Suas anotações",
      },
      {
        label: "Pomodoro",
        href: "/pomodoro",
        icon: Timer,
        tile: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        sublabel: "Sessões de foco",
      },
    ],
  },
  {
    title: "Finanças",
    layout: "grid",
    items: [
      {
        label: "Gestão",
        href: "/financas",
        icon: Wallet,
        tile: "bg-green-500/15 text-green-600 dark:text-green-400",
        statKey: "balance",
        wide: true,
      },
      {
        label: "Estatísticas",
        href: "/financas/estatisticas",
        icon: ChartSpline,
        tile: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
        sublabel: "Análises",
      },
      {
        label: "Compras",
        href: "/compras",
        icon: ShoppingCart,
        tile: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-500",
        sublabel: "Listas",
      },
    ],
  },
];

export const HUB_SECONDARY_SECTIONS: HubSection[] = [
  {
    title: "Vida Pessoal",
    layout: "list",
    items: [
      {
        label: "Aniversários",
        href: "/aniversarios",
        icon: Cake,
        tile: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
      },
      {
        label: "Diário de Sonhos",
        href: "/diario-sonhos",
        icon: MoonStar,
        tile: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
      },
      {
        label: "Análise de Sonhos",
        href: "/diario-sonhos/analise",
        icon: ChartColumnBig,
        tile: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
      },
      {
        label: "Diário",
        href: "/diario",
        icon: NotebookPen,
        tile: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      },
      {
        label: "Humor",
        href: "/humor",
        icon: Smile,
        tile: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
      },
    ],
  },
  {
    title: "Análise & Progresso",
    layout: "grid",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: ChartNoAxesColumn,
        tile: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        sublabel: "Estatísticas",
      },
      {
        label: "Perfil",
        href: "/perfil",
        icon: Trophy,
        tile: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        statKey: "level",
      },
      {
        label: "Metas",
        href: "/metas",
        icon: Target,
        tile: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
        statKey: "goals",
      },
      {
        label: "Mural dos Sonhos",
        href: "/sonhos",
        icon: Star,
        tile: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
        sublabel: "Vision board",
      },
    ],
  },
  {
    title: "Ferramentas",
    layout: "list",
    items: [
      {
        label: "Pesquisar Tarefas",
        href: "/pesquisar",
        icon: Search,
        tile: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        sublabel: "Encontre tarefas rapidamente",
      },
      {
        label: "Backup & Restauração",
        href: "/backup",
        icon: CloudUpload,
        tile: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
        sublabel: "Proteja seus dados",
      },
      {
        label: "Temas",
        href: "/temas",
        icon: Palette,
        tile: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
        sublabel: "6 estilos para o app",
      },
    ],
  },
];
