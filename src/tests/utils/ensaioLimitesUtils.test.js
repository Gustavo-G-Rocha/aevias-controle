import { describe, it, expect } from 'vitest';
import {
  normalizeNumber,
  calcUmidade,
  calcLLRow,
  calcLPRow,
  fitLogLine,
  classificarHRB,
  calcIndexGroup,
  formatValue,
} from '@/utils/ensaioLimitesUtils';

describe('ensaioLimitesUtils', () => {
  describe('normalizeNumber', () => {
    it('deve normalizar um número com decimais padrão (2)', () => {
      expect(normalizeNumber('3.14159')).toBe(3.14);
      expect(normalizeNumber(3.14159)).toBe(3.14);
    });

    it('deve normalizar com casas decimais customizadas', () => {
      expect(normalizeNumber('3.14159', 3)).toBe(3.142);
      expect(normalizeNumber('3.14159', 1)).toBe(3.1);
    });

    it('deve retornar null para entrada inválida', () => {
      expect(normalizeNumber('abc')).toBeNull();
      expect(normalizeNumber(undefined)).toBeNull();
      expect(normalizeNumber(null)).toBeNull();
    });

    it('deve retornar 0 para "0"', () => {
      expect(normalizeNumber('0')).toBe(0);
      expect(normalizeNumber(0)).toBe(0);
    });
  });

  describe('calcUmidade', () => {
    it('deve calcular umidade corretamente', () => {
      const result = calcUmidade(25.5, 20.3, 15.0);
      const expected = ((25.5 - 20.3) / (20.3 - 15.0)) * 100;
      expect(result).toBeCloseTo(expected, 2);
    });

    it('deve retornar null quando falta dados', () => {
      expect(calcUmidade(null, 20, 15)).toBeNull();
      expect(calcUmidade(25, null, 15)).toBeNull();
      expect(calcUmidade(25, 20, null)).toBeNull();
    });

    it('deve retornar null quando solo <= 0', () => {
      expect(calcUmidade(25, 20, 20)).toBeNull();
      expect(calcUmidade(25, 20, 25)).toBeNull();
    });
  });

  describe('calcLLRow', () => {
    it('deve calcular LL row corretamente', () => {
      const row = {
        solo_umido_capsula: '26.5',
        solo_seco_capsula: '21.2',
        peso_capsula: '15.0',
      };
      const result = calcLLRow(row);
      expect(result.agua).toBeDefined();
      expect(result.solo).toBeDefined();
      expect(result.teor).toBeDefined();
    });

    it('deve retornar null para teor quando dados incompletos', () => {
      const row = {
        solo_umido_capsula: null,
        solo_seco_capsula: '21.2',
        peso_capsula: '15.0',
      };
      const result = calcLLRow(row);
      expect(result.teor).toBeNull();
    });
  });

  describe('calcLPRow', () => {
    it('deve calcular LP row como umidade simples', () => {
      const row = {
        solo_umido_capsula: '20.5',
        solo_seco_capsula: '18.3',
        peso_capsula: '15.0',
      };
      const result = calcLPRow(row);
      const expected = ((20.5 - 18.3) / (18.3 - 15.0)) * 100;
      expect(result).toBeCloseTo(expected, 2);
    });

    it('deve retornar null quando dados incompletos', () => {
      const row = {
        solo_umido_capsula: null,
        solo_seco_capsula: '18.3',
        peso_capsula: '15.0',
      };
      expect(calcLPRow(row)).toBeNull();
    });
  });

  describe('fitLogLine', () => {
    it('deve calcular regressão linear com 2+ pontos', () => {
      const points = [
        { x: 10, y: 30 },
        { x: 20, y: 28 },
        { x: 30, y: 25 },
      ];
      const result = fitLogLine(points);
      expect(result).not.toBeNull();
      expect(result.a).toBeDefined();
      expect(result.b).toBeDefined();
      expect(result.ll).toBeDefined();
    });

    it('deve retornar null com menos de 2 pontos', () => {
      const points = [{ x: 10, y: 30 }];
      expect(fitLogLine(points)).toBeNull();
    });

    it('deve filtrar pontos com x <= 0', () => {
      const points = [
        { x: 0, y: 30 },
        { x: 10, y: 30 },
        { x: 20, y: 28 },
      ];
      const result = fitLogLine(points);
      expect(result).not.toBeNull();
    });

    it('deve retornar null para denominador próximo a zero', () => {
      const points = [
        { x: 5, y: 30 },
        { x: 5, y: 31 },
      ];
      const result = fitLogLine(points);
      expect(result).toBeNull();
    });
  });

  describe('calcIndexGroup', () => {
    it('deve calcular IG para solos granulares (F200 < 35)', () => {
      const result = calcIndexGroup(20, 35, 5);
      expect(result).toBeDefined();
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('deve calcular IG para solos siltosos/argilosos (F200 > 35)', () => {
      const result = calcIndexGroup(50, 45, 12);
      expect(result).toBeDefined();
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('deve retornar null se faltam parâmetros', () => {
      expect(calcIndexGroup(null, 45, 12)).toBeNull();
      expect(calcIndexGroup(50, null, 12)).toBeNull();
      expect(calcIndexGroup(50, 45, null)).toBeNull();
    });

    it('deve garantir IG >= 0', () => {
      const result = calcIndexGroup(5, 35, 2);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('classificarHRB', () => {
    it('deve classificar como A1-a', () => {
      const result = classificarHRB(40, 25, 20, 35, 5, 0);
      expect(result).toBe('A1-a');
    });

    it('deve classificar como A4', () => {
      const result = classificarHRB(null, null, 50, 38, 8, 5);
      expect(result).toBe('A4');
    });

    it('deve retornar "-" quando nenhuma classificação se aplica', () => {
      const result = classificarHRB(null, null, 100, 100, 100, 100);
      expect(result).toBe('-');
    });

    it('deve tratar valores null como 0', () => {
      const result = classificarHRB(null, null, null, null, null, null);
      expect(typeof result).toBe('string');
    });
  });

  describe('formatValue', () => {
    it('deve formatar um número com decimais', () => {
      expect(formatValue(3.14159, 2)).toBe('3.14');
      expect(formatValue(3.14159, 3)).toBe('3.142');
    });

    it('deve retornar "-" para null ou undefined', () => {
      expect(formatValue(null)).toBe('-');
      expect(formatValue(undefined)).toBe('-');
    });

    it('deve usar 2 decimais por padrão', () => {
      expect(formatValue(3.14159)).toBe('3.14');
    });

    it('deve formatar zero corretamente', () => {
      expect(formatValue(0, 1)).toBe('0');
    });
  });
});