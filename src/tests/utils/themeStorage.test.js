import { describe, it, expect, vi } from 'vitest';
import {
  THEMES,
  THEME_STORAGE_KEY,
  isValidTheme,
  resolveInitialTheme,
  persistTheme,
  toggleThemeValue,
} from '@/utils/themeStorage';

function makeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: vi.fn((k) => (k in data ? data[k] : null)),
    setItem: vi.fn((k, v) => { data[k] = String(v); }),
    _data: data,
  };
}

const matchDark = () => ({ matches: true });
const matchLight = () => ({ matches: false });

describe('themeStorage', () => {
  describe('isValidTheme', () => {
    it('aceita apenas light e dark', () => {
      expect(isValidTheme('light')).toBe(true);
      expect(isValidTheme('dark')).toBe(true);
      expect(isValidTheme('blue')).toBe(false);
      expect(isValidTheme(null)).toBe(false);
      expect(isValidTheme(undefined)).toBe(false);
    });
  });

  describe('toggleThemeValue', () => {
    it('alterna entre light e dark', () => {
      expect(toggleThemeValue(THEMES.LIGHT)).toBe(THEMES.DARK);
      expect(toggleThemeValue(THEMES.DARK)).toBe(THEMES.LIGHT);
    });
  });

  describe('resolveInitialTheme', () => {
    it('valor padrão é light quando não há preferência nem sistema dark', () => {
      const storage = makeStorage();
      expect(resolveInitialTheme({ storage, matchMedia: matchLight })).toBe(THEMES.LIGHT);
    });

    it('usa a preferência salva quando válida', () => {
      const storage = makeStorage({ [THEME_STORAGE_KEY]: 'dark' });
      // Mesmo com sistema claro, a preferência salva vence
      expect(resolveInitialTheme({ storage, matchMedia: matchLight })).toBe(THEMES.DARK);
    });

    it('ignora preferência salva inválida e cai no sistema', () => {
      const storage = makeStorage({ [THEME_STORAGE_KEY]: 'roxo' });
      expect(resolveInitialTheme({ storage, matchMedia: matchDark })).toBe(THEMES.DARK);
    });

    it('usa a preferência do sistema (dark) como fallback', () => {
      const storage = makeStorage();
      expect(resolveInitialTheme({ storage, matchMedia: matchDark })).toBe(THEMES.DARK);
    });

    it('não quebra quando storage/matchMedia estão ausentes', () => {
      expect(resolveInitialTheme({})).toBe(THEMES.LIGHT);
      expect(resolveInitialTheme()).toBe(THEMES.LIGHT);
    });
  });

  describe('persistTheme', () => {
    it('salva um tema válido no storage', () => {
      const storage = makeStorage();
      persistTheme(THEMES.DARK, { storage });
      expect(storage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, THEMES.DARK);
    });

    it('não salva um valor inválido', () => {
      const storage = makeStorage();
      persistTheme('verde', { storage });
      expect(storage.setItem).not.toHaveBeenCalled();
    });
  });
});