import { DEFAULT_THEME, isThemeId, type ThemeId } from "@/shared/constants/themes";

export const COLOR_THEME_STORAGE_KEY = "lifehub-color-theme";

/** Base themes map straight to light/dark and need no `data-theme` override. */
const BASE_THEMES: readonly ThemeId[] = ["claro", "escuro"];

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function subscribeColorTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readStoredColorTheme(): ThemeId | null {
  try {
    const value = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    return isThemeId(value) ? value : null;
  } catch {
    return null;
  }
}

/** Current theme, falling back to the base theme implied by the `.dark` class. */
export function getColorThemeSnapshot(): ThemeId {
  const stored = readStoredColorTheme();
  if (stored) return stored;
  return document.documentElement.classList.contains("dark") ? "escuro" : "claro";
}

export function getServerColorThemeSnapshot(): ThemeId {
  return DEFAULT_THEME;
}

/** Applies a theme: swaps the `data-theme` attribute and persists the choice. */
export function applyColorTheme(id: ThemeId) {
  const root = document.documentElement;
  if (BASE_THEMES.includes(id)) {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", id);
  }
  try {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, id);
  } catch {
    // Storage may be unavailable (private mode) — theme still applies for the session.
  }
  notify();
}

/** Drops any color theme, falling back to plain light/dark (used by "system"). */
export function clearColorTheme() {
  document.documentElement.removeAttribute("data-theme");
  try {
    localStorage.removeItem(COLOR_THEME_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
  notify();
}

/**
 * Inline bootstrap executed before hydration so a stored color theme is
 * restored without a flash of the default palette.
 */
export const COLOR_THEME_INIT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(
  COLOR_THEME_STORAGE_KEY,
)});if(t&&t!=="claro"&&t!=="escuro")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
