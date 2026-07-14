/** Ready-made study plan templates, mirroring the reference app. */
export type StudyTemplate = {
  id: string;
  icon: string;
  name: string;
  /** Short summary line, e.g. "6 meses • 7 matérias • 4h/dia". */
  summary: string;
  description: string;
  /** Accent classes for the template card. */
  accent: string;
  durationDays: number;
  dailyGoalMinutes: number;
  subjects: Array<{ name: string; minutesPerWeek: number; color: string }>;
};

export const STUDY_TEMPLATES: StudyTemplate[] = [
  {
    id: "vestibular",
    icon: "📚",
    name: "Vestibular Intensivo",
    summary: "6 meses • 7 matérias • 4h/dia",
    description: "Preparação completa para vestibulares competitivos",
    accent: "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10",
    durationDays: 180,
    dailyGoalMinutes: 240,
    subjects: [
      { name: "Matemática", minutesPerWeek: 300, color: "#3b82f6" },
      { name: "Português", minutesPerWeek: 240, color: "#ef4444" },
      { name: "Física", minutesPerWeek: 240, color: "#f59e0b" },
      { name: "Química", minutesPerWeek: 240, color: "#22c55e" },
      { name: "Biologia", minutesPerWeek: 180, color: "#10b981" },
      { name: "História", minutesPerWeek: 180, color: "#a855f7" },
      { name: "Geografia", minutesPerWeek: 180, color: "#06b6d4" },
    ],
  },
  {
    id: "enem",
    icon: "🎓",
    name: "ENEM",
    summary: "8 meses • 5 áreas • 3h/dia",
    description: "Foco em todas as competências do ENEM",
    accent: "border-green-500/40 text-green-600 dark:text-green-400 bg-green-500/10",
    durationDays: 240,
    dailyGoalMinutes: 180,
    subjects: [
      { name: "Linguagens", minutesPerWeek: 240, color: "#ef4444" },
      { name: "Matemática", minutesPerWeek: 300, color: "#3b82f6" },
      { name: "Ciências Humanas", minutesPerWeek: 240, color: "#a855f7" },
      { name: "Ciências da Natureza", minutesPerWeek: 240, color: "#22c55e" },
      { name: "Redação", minutesPerWeek: 180, color: "#f59e0b" },
    ],
  },
  {
    id: "concurso",
    icon: "📜",
    name: "Concurso Público",
    summary: "1 ano • Matérias básicas • 5h/dia",
    description: "Preparação para concursos federais e estaduais",
    accent: "border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10",
    durationDays: 365,
    dailyGoalMinutes: 300,
    subjects: [
      { name: "Português", minutesPerWeek: 360, color: "#ef4444" },
      { name: "Raciocínio Lógico", minutesPerWeek: 300, color: "#3b82f6" },
      { name: "Direito Constitucional", minutesPerWeek: 300, color: "#f59e0b" },
      { name: "Direito Administrativo", minutesPerWeek: 300, color: "#a855f7" },
      { name: "Informática", minutesPerWeek: 240, color: "#06b6d4" },
    ],
  },
  {
    id: "certificacao-ti",
    icon: "💻",
    name: "Certificação em TI",
    summary: "3 meses • Cloud & DevOps • 2h/dia",
    description: "AWS, Azure, Kubernetes e mais",
    accent: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    durationDays: 90,
    dailyGoalMinutes: 120,
    subjects: [
      { name: "Cloud Computing", minutesPerWeek: 360, color: "#f59e0b" },
      { name: "Segurança", minutesPerWeek: 240, color: "#ef4444" },
      { name: "DevOps", minutesPerWeek: 240, color: "#3b82f6" },
    ],
  },
  {
    id: "ingles",
    icon: "🌍",
    name: "Inglês Avançado",
    summary: "6 meses • 4 skills • 1.5h/dia",
    description: "Grammar, Speaking, Listening e Writing",
    accent: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    durationDays: 180,
    dailyGoalMinutes: 90,
    subjects: [
      { name: "Grammar", minutesPerWeek: 180, color: "#22c55e" },
      { name: "Speaking", minutesPerWeek: 180, color: "#3b82f6" },
      { name: "Listening", minutesPerWeek: 120, color: "#a855f7" },
      { name: "Writing", minutesPerWeek: 120, color: "#f59e0b" },
    ],
  },
];
