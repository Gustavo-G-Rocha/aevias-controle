// Regras puras de resolução/persistência do tema (light | dark).
// Isolado da UI para ser testável e reutilizável.

export const THEME_STORAGE_KEY = 'app-theme';
export const THEMES = { LIGHT: 'light', DARK: 'dark' };

/** Um valor é um tema válido? */
export function isValidTheme(value) {
  return value === THEMES.LIGHT || value === THEMES.DARK;
}

/**
 * Resolve o tema inicial:
 * 1. Preferência salva (localStorage), se válida.
 * 2. Preferência do sistema (prefers-color-scheme: dark).
 * 3. Fallback: light.
 */
export function resolveInitialTheme({ storage, matchMedia } = {}) {
  try {
    const saved = storage?.getItem?.(THEME_STORAGE_KEY);
    if (isValidTheme(saved)) return saved;
  } catch {
    // storage indisponível — segue para fallback
  }

  try {
    if (matchMedia?.('(prefers-color-scheme: dark)')?.matches) {
      return THEMES.DARK;
    }
  } catch {
    // matchMedia indisponível — segue para fallback
  }

  return THEMES.LIGHT;
}

/** Persiste o tema; ignora falhas de storage silenciosamente. */
export function persistTheme(theme, { storage } = {}) {
  if (!isValidTheme(theme)) return;
  try {
    storage?.setItem?.(THEME_STORAGE_KEY, theme);
  } catch {
    // storage indisponível — persistência é best-effort
  }
}

/** Retorna o tema oposto. */
export function toggleThemeValue(theme) {
  return theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
}