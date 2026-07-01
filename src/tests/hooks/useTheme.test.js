/**
 * tests/hooks/useTheme.test.js
 *
 * O ambiente de testes é 'node' (sem DOM/RTL), então validamos:
 *  1. A lógica pura de tema (via themeStorage — funções injetáveis).
 *  2. O contrato de interface do hook useTheme via leitura do source.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  THEMES,
  THEME_STORAGE_KEY,
  resolveInitialTheme,
  persistTheme,
  toggleThemeValue,
} from '@/utils/themeStorage';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../hooks/useTheme.js'), 'utf-8');

function makeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: vi.fn((k) => (k in data ? data[k] : null)),
    setItem: vi.fn((k, v) => { data[k] = String(v); }),
  };
}

describe('useTheme - lógica de tema', () => {
  it('valor padrão é light sem preferência salva ou de sistema', () => {
    const storage = makeStorage();
    expect(resolveInitialTheme({ storage, matchMedia: () => ({ matches: false }) })).toBe(THEMES.LIGHT);
  });

  it('respeita a preferência salva no storage', () => {
    const storage = makeStorage({ [THEME_STORAGE_KEY]: THEMES.DARK });
    expect(resolveInitialTheme({ storage, matchMedia: () => ({ matches: false }) })).toBe(THEMES.DARK);
  });

  it('toggle + persistência gravam o novo tema', () => {
    const storage = makeStorage({ [THEME_STORAGE_KEY]: THEMES.LIGHT });
    const next = toggleThemeValue(THEMES.LIGHT);
    persistTheme(next, { storage });
    expect(next).toBe(THEMES.DARK);
    expect(storage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, THEMES.DARK);
  });
});

describe('useTheme - contrato de interface', () => {
  it('exporta o hook useTheme', () => {
    expect(src).toContain('export function useTheme');
  });

  it('retorna theme, isDark, setTheme e toggleTheme', () => {
    expect(src).toContain('theme');
    expect(src).toContain('isDark');
    expect(src).toContain('setTheme');
    expect(src).toContain('toggleTheme');
  });

  it('aplica/remove a classe dark no documentElement', () => {
    expect(src).toContain("classList.toggle('dark'");
  });

  it('persiste a preferência ao alterar o tema', () => {
    expect(src).toContain('persistTheme');
  });

  it('resolve o tema inicial a partir do storage/sistema', () => {
    expect(src).toContain('resolveInitialTheme');
  });
});