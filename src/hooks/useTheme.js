import { useCallback, useEffect, useState } from 'react';
import {
  THEMES,
  resolveInitialTheme,
  persistTheme,
  toggleThemeValue,
} from '@/utils/themeStorage';

const getEnv = () => ({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  matchMedia: typeof window !== 'undefined' ? window.matchMedia?.bind(window) : undefined,
});

/** Aplica/remove a classe .dark no <html> para ativar os tokens dark do CSS. */
function applyThemeClass(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === THEMES.DARK);
}

/**
 * Hook central de tema: leitura, alteração e persistência.
 * A preferência é resolvida a partir do localStorage (fallback: sistema).
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => resolveInitialTheme(getEnv()));

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    persistTheme(next, getEnv());
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = toggleThemeValue(prev);
      persistTheme(next, getEnv());
      return next;
    });
  }, []);

  return {
    theme,
    isDark: theme === THEMES.DARK,
    setTheme,
    toggleTheme,
  };
}