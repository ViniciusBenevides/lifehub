export type ThemeId = "claro" | "escuro" | "azul" | "rosa" | "vermelho" | "roxo";

export type ThemeDefinition = {
  id: ThemeId;
  label: string;
  description: string;
  /** Base mode handed to next-themes (controls the `.dark` class). */
  mode: "light" | "dark";
  /** Hex swatches used only by the theme picker preview card. */
  preview: {
    background: string;
    card: string;
    border: string;
    primary: string;
    primaryForeground: string;
    foreground: string;
    muted: string;
  };
};

export const DEFAULT_THEME: ThemeId = "escuro";

export const THEMES: ThemeDefinition[] = [
  {
    id: "claro",
    label: "Claro",
    description: "Tema claro e moderno",
    mode: "light",
    preview: {
      background: "#f4f4f5",
      card: "#ffffff",
      border: "#e4e4e7",
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      foreground: "#18181b",
      muted: "#71717a",
    },
  },
  {
    id: "escuro",
    label: "Escuro",
    description: "Tema escuro para uso noturno",
    mode: "dark",
    preview: {
      background: "#111113",
      card: "#1c1c1f",
      border: "#2e2e33",
      primary: "#818cf8",
      primaryForeground: "#ffffff",
      foreground: "#fafafa",
      muted: "#a1a1aa",
    },
  },
  {
    id: "azul",
    label: "Azul",
    description: "Tema azul elegante",
    mode: "dark",
    preview: {
      background: "#0b1220",
      card: "#152036",
      border: "#26344f",
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      foreground: "#f1f5f9",
      muted: "#94a3b8",
    },
  },
  {
    id: "rosa",
    label: "Rosa",
    description: "Tema rosa suave e delicado",
    mode: "light",
    preview: {
      background: "#fdf2f4",
      card: "#fffbfc",
      border: "#f3d8de",
      primary: "#dc8a96",
      primaryForeground: "#ffffff",
      foreground: "#42292e",
      muted: "#9d7d84",
    },
  },
  {
    id: "vermelho",
    label: "Vermelho",
    description: "Tema vermelho intenso e vibrante",
    mode: "dark",
    preview: {
      background: "#180d0d",
      card: "#241213",
      border: "#3d2022",
      primary: "#ef4444",
      primaryForeground: "#ffffff",
      foreground: "#fdf2f2",
      muted: "#b39a9a",
    },
  },
  {
    id: "roxo",
    label: "Roxo",
    description: "Tema roxo elegante e sofisticado",
    mode: "dark",
    preview: {
      background: "#140d1d",
      card: "#201329",
      border: "#352242",
      primary: "#a78bfa",
      primaryForeground: "#ffffff",
      foreground: "#f7f2fd",
      muted: "#a795bb",
    },
  },
];

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

export function getThemeDefinition(id: ThemeId): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[1];
}
