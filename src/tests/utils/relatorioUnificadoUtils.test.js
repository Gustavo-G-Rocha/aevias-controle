import { describe, it, expect } from 'vitest';

import {
  formatDate,
  getRecordTypeName,
  isFiltersValid,
  getActiveFiltersDescription,
} from '@/utils/relatorioUnificadoUtils';

describe('relatorioUnificadoUtils', () => {
  describe('formatDate', () => {
    it('deve formatar uma data válida em pt-BR', () => {
      const result = formatDate('2026-05-27');
      expect(result).toMatch(/27\/05\/2026/);
    });

    it('deve retornar "-" quando data é null', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('deve retornar "-" quando data é undefined', () => {
      expect(formatDate(undefined)).toBe('-');
    });

    it('deve retornar "-" quando data é string vazia', () => {
      expect(formatDate('')).toBe('-');
    });
  });

  describe('getRecordTypeName', () => {
    it('deve retornar o tipo original quando não encontra mapeamento', () => {
      const result = getRecordTypeName('UnknownType');
      expect(result).toBe('UnknownType');
    });
  });

  describe('isFiltersValid', () => {
    it('deve retornar true quando todos os filtros obrigatórios estão presentes', () => {
      const filters = {
        obra_id: '123',
        data_inicio: '2026-01-01',
        data_fim: '2026-12-31',
        tipo: 'DiarioObra',
      };
      expect(isFiltersValid(filters)).toBe(true);
    });

    it('deve retornar false quando falta obra_id', () => {
      const filters = {
        data_inicio: '2026-01-01',
        data_fim: '2026-12-31',
        tipo: 'DiarioObra',
      };
      expect(isFiltersValid(filters)).toBe(false);
    });

    it('deve retornar false quando falta data_inicio', () => {
      const filters = {
        obra_id: '123',
        data_fim: '2026-12-31',
        tipo: 'DiarioObra',
      };
      expect(isFiltersValid(filters)).toBe(false);
    });

    it('deve retornar false quando falta data_fim', () => {
      const filters = {
        obra_id: '123',
        data_inicio: '2026-01-01',
        tipo: 'DiarioObra',
      };
      expect(isFiltersValid(filters)).toBe(false);
    });

    it('deve retornar false quando falta tipo', () => {
      const filters = {
        obra_id: '123',
        data_inicio: '2026-01-01',
        data_fim: '2026-12-31',
      };
      expect(isFiltersValid(filters)).toBe(false);
    });
  });

  describe('getActiveFiltersDescription', () => {
    it('deve retornar array vazio quando não há filtros adicionais', () => {
      const filters = {};
      expect(getActiveFiltersDescription(filters)).toEqual([]);
    });

    it('deve incluir laboratoristas quando presentes', () => {
      const filters = {
        laboratoristas: ['João', 'Maria'],
      };
      const result = getActiveFiltersDescription(filters);
      expect(result).toContain('Laboratoristas: João, Maria');
    });

    it('deve incluir rodovia quando presente', () => {
      const filters = {
        rodovia: 'BR-101',
      };
      const result = getActiveFiltersDescription(filters);
      expect(result).toContain('Rodovia: BR-101');
    });

    it('deve incluir empreiteira quando presente', () => {
      const filters = {
        empreiteira: 'Construtora XYZ',
      };
      const result = getActiveFiltersDescription(filters);
      expect(result).toContain('Empreiteira: Construtora XYZ');
    });

    it('deve incluir usina quando presente', () => {
      const filters = {
        usina: 'Usina ABC',
      };
      const result = getActiveFiltersDescription(filters);
      expect(result).toContain('Usina: Usina ABC');
    });

    it('deve incluir múltiplos filtros quando presentes', () => {
      const filters = {
        laboratoristas: ['João'],
        rodovia: 'BR-101',
        empreiteira: 'Construtora XYZ',
        usina: 'Usina ABC',
      };
      const result = getActiveFiltersDescription(filters);
      expect(result.length).toBe(4);
    });
  });
});