import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateBrasilia,
  isTaxaNaoConforme,
  isTaxaConforme,
  formatValueByField,
} from '../../utils/relatorioTaxaMRAFUtils';

describe('relatorioTaxaMRAFUtils', () => {
  describe('formatDate', () => {
    it('formata data em pt-BR com UTC', () => {
      const result = formatDate('2024-05-15');
      expect(result).toBe('15/05/2024');
    });

    it('retorna string vazia se nulo', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatDateBrasilia', () => {
    it('formata data-hora em pt-BR com timezone Sao Paulo', () => {
      const result = formatDateBrasilia('2024-05-15T10:30:00Z');
      expect(result).toContain('15');
    });

    it('retorna N/A se nulo', () => {
      expect(formatDateBrasilia(null)).toBe('N/A');
      expect(formatDateBrasilia(undefined)).toBe('N/A');
    });

    it('adiciona Z se não estiver no formato com timezone', () => {
      const result = formatDateBrasilia('2024-05-15T10:30:00');
      expect(result).toBeTruthy();
    });
  });

  describe('isTaxaNaoConforme', () => {
    it('retorna true quando valor < taxaMinima', () => {
      expect(isTaxaNaoConforme(1.5, 2.0)).toBe(true);
    });

    it('retorna false quando valor >= taxaMinima', () => {
      expect(isTaxaNaoConforme(2.0, 2.0)).toBe(false);
      expect(isTaxaNaoConforme(2.5, 2.0)).toBe(false);
    });

    it('retorna false quando taxaMinima é null', () => {
      expect(isTaxaNaoConforme(1.5, null)).toBe(false);
    });

    it('retorna false quando valor é null', () => {
      expect(isTaxaNaoConforme(null, 2.0)).toBe(false);
    });
  });

  describe('isTaxaConforme', () => {
    it('retorna true quando valor >= taxaMinima', () => {
      expect(isTaxaConforme(2.0, 2.0)).toBe(true);
      expect(isTaxaConforme(2.5, 2.0)).toBe(true);
    });

    it('retorna false quando valor < taxaMinima', () => {
      expect(isTaxaConforme(1.5, 2.0)).toBe(false);
    });

    it('retorna false quando taxaMinima é null', () => {
      expect(isTaxaConforme(2.0, null)).toBe(false);
    });

    it('retorna false quando valor é null', () => {
      expect(isTaxaConforme(null, 2.0)).toBe(false);
    });
  });

  describe('formatValueByField', () => {
    it('retorna - quando valor é null', () => {
      expect(formatValueByField(null, 'taxa_mraf_aplicada', false)).toBe('-');
    });

    it('formata taxa com 1 casa decimal', () => {
      expect(formatValueByField(1.567, 'taxa_mraf_aplicada', true)).toBe('1.6');
    });

    it('formata estaca com 0 casas decimais', () => {
      expect(formatValueByField(10.567, 'estaca', false)).toBe('11');
    });

    it('formata outros campos com 3 casas decimais e remove zeros', () => {
      expect(formatValueByField(10.100, 'peso_amostra', false)).toBe('10.1');
      expect(formatValueByField(10.000, 'peso_amostra', false)).toBe('10');
    });

    it('retorna string como está', () => {
      expect(formatValueByField('texto', 'campo', false)).toBe('texto');
    });
  });
});