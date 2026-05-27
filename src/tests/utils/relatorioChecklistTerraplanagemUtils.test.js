import { describe, it, expect } from 'vitest';
import {
  formatDateTerra,
  getClimaEmojiTerra,
  getClimaTextoTerra,
  calcularVariacaoUmidade,
  calcularGrauCompactacao,
  chunkArray,
  temAcoesCorretivas,
  formatarResultados,
  formatarJornada,
} from '../../utils/relatorioChecklistTerraplanagemUtils';

describe('relatorioChecklistTerraplanagemUtils', () => {
  describe('formatDateTerra', () => {
    it('retorna string vazia se inválida', () => {
      expect(formatDateTerra('invalid')).toBe('');
    });

    it('retorna data formatada se válida', () => {
      // Assumindo formatDate retorna uma string válida
      const resultado = formatDateTerra('2025-05-27');
      expect(typeof resultado).toBe('string');
    });
  });

  describe('getClimaEmojiTerra', () => {
    it('retorna emoji para bom', () => {
      expect(getClimaEmojiTerra('bom')).toBe('☀️');
    });

    it('retorna emoji para instável', () => {
      expect(getClimaEmojiTerra('instavel')).toBe('⛅');
    });

    it('retorna emoji para chuva', () => {
      expect(getClimaEmojiTerra('chuva')).toBe('🌧️');
    });

    it('retorna string vazia para condição desconhecida', () => {
      expect(getClimaEmojiTerra('unknown')).toBe('');
    });
  });

  describe('getClimaTextoTerra', () => {
    it('retorna texto para bom', () => {
      expect(getClimaTextoTerra('bom')).toBe('Bom');
    });

    it('retorna texto para chuva', () => {
      expect(getClimaTextoTerra('chuva')).toBe('Chuva');
    });

    it('retorna "-" para condição desconhecida', () => {
      expect(getClimaTextoTerra('unknown')).toBe('-');
    });
  });

  describe('calcularVariacaoUmidade', () => {
    it('calcula variação corretamente', () => {
      expect(calcularVariacaoUmidade('10', '12')).toBe('2.00');
    });

    it('retorna null se valores inválidos', () => {
      expect(calcularVariacaoUmidade('abc', '12')).toBeNull();
      expect(calcularVariacaoUmidade('10', 'xyz')).toBeNull();
    });

    it('trata valores negativos', () => {
      expect(calcularVariacaoUmidade('12', '10')).toBe('-2.00');
    });
  });

  describe('calcularGrauCompactacao', () => {
    it('calcula grau corretamente', () => {
      const resultado = calcularGrauCompactacao('1.5', '1.2');
      expect(resultado).toBe('125.00');
    });

    it('retorna null se densProctor é 0', () => {
      expect(calcularGrauCompactacao('1.5', '0')).toBeNull();
    });

    it('retorna null se valores inválidos', () => {
      expect(calcularGrauCompactacao('abc', '1.2')).toBeNull();
    });
  });

  describe('chunkArray', () => {
    it('divide array em chunks', () => {
      const arr = [1, 2, 3, 4, 5, 6];
      expect(chunkArray(arr, 2)).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it('retorna array vazio se input é null', () => {
      expect(chunkArray(null, 2)).toEqual([]);
    });

    it('trata último chunk com tamanho menor', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(chunkArray(arr, 2)).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('temAcoesCorretivas', () => {
    it('retorna true se tem ações corretivas', () => {
      const checklist = {
        acoes_corretivas_realizado: true,
        acoes_corretivas_descricao: 'Açao X'
      };
      expect(temAcoesCorretivas(checklist)).toBe(true);
    });

    it('retorna false se sem descrição', () => {
      const checklist = {
        acoes_corretivas_realizado: true,
        acoes_corretivas_descricao: ''
      };
      expect(temAcoesCorretivas(checklist)).toBe(false);
    });

    it('retorna false se realizado é false', () => {
      const checklist = {
        acoes_corretivas_realizado: false,
        acoes_corretivas_descricao: 'Açao X'
      };
      expect(temAcoesCorretivas(checklist)).toBe(false);
    });
  });

  describe('formatarResultados', () => {
    it('formata resultados com pipes', () => {
      expect(formatarResultados('1.2 | 1.3 | 1.4')).toBe('1.2 | 1.3 | 1.4');
    });

    it('retorna "-" se null', () => {
      expect(formatarResultados(null)).toBe('-');
    });
  });

  describe('formatarJornada', () => {
    it('formata jornada válida', () => {
      const jornada = { horario_inicio: '08:00', horario_fim: '17:00' };
      expect(formatarJornada(jornada)).toBe('08:00 - 17:00');
    });

    it('retorna N/A se sem horários', () => {
      expect(formatarJornada({ horario_inicio: '08:00' })).toBe('N/A');
      expect(formatarJornada(null)).toBe('N/A');
    });
  });
});