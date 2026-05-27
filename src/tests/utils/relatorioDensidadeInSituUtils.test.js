import { describe, it, expect } from 'vitest';
import { formatDate, formatDateBrasilia, fmtN } from '../../utils/relatorioDensidadeInSituUtils';

describe('relatorioDensidadeInSituUtils', () => {
  describe('formatDate', () => {
    it('formata data no padrão pt-BR com UTC', () => {
      const result = formatDate('2024-05-15');
      expect(result).toBe('15/05/2024');
    });

    it('retorna string vazia se data nula', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    it('formata data com hora', () => {
      const result = formatDate('2024-05-15T10:30:00Z');
      expect(result).toContain('15');
    });
  });

  describe('formatDateBrasilia', () => {
    it('formata data e hora em Brasília', () => {
      const result = formatDateBrasilia('2024-05-15T10:30:00Z');
      expect(result).toContain('15');
    });

    it('retorna N/A se data nula', () => {
      expect(formatDateBrasilia(null)).toBe('N/A');
      expect(formatDateBrasilia(undefined)).toBe('N/A');
    });

    it('normaliza datas sem Z', () => {
      const result = formatDateBrasilia('2024-05-15T10:30:00');
      expect(result).toBeTruthy();
    });
  });

  describe('fmtN', () => {
    it('formata número com 2 casas decimais por padrão', () => {
      expect(fmtN(3.14159)).toBe('3.14');
    });

    it('formata com casas decimais customizadas', () => {
      expect(fmtN(3.14159, 3)).toBe('3.142');
    });

    it('formata inteiro', () => {
      expect(fmtN(42)).toBe('42.00');
    });

    it('retorna string vazia para null/undefined/NaN', () => {
      expect(fmtN(null)).toBe('');
      expect(fmtN(undefined)).toBe('');
      expect(fmtN(NaN)).toBe('');
    });

    it('formata zero corretamente', () => {
      expect(fmtN(0)).toBe('0.00');
    });

    it('formata valores negativos', () => {
      expect(fmtN(-3.14159)).toBe('-3.14');
    });
  });
});