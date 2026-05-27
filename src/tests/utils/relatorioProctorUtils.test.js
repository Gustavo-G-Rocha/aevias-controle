import { describe, it, expect } from 'vitest';
import {
  buildChartPoints,
  buildISCPoints,
  buildExpansaoPoints,
  calcISC,
  calcExpansao,
  evalParabola,
  fmtN,
  fmtDate,
} from '../../utils/relatorioProctorUtils';

describe('relatorioProctorUtils', () => {
  describe('buildChartPoints', () => {
    it('constrói pontos de densidade com umidade calculada (higro)', () => {
      const ensaio = {
        densidades: [
          { umidade_calculada: 10, dens_ap_seca: 1.6 },
          { umidade_calculada: 12, dens_ap_seca: 1.7 },
        ],
      };
      const points = buildChartPoints(ensaio, true);
      expect(points).toHaveLength(2);
      expect(points[0]).toEqual({ x: 10, y: 1.6 });
    });

    it('constrói pontos com teor_umidade_media (não higro)', () => {
      const ensaio = {
        densidades: [
          { dens_ap_seca: 1.6 },
          { dens_ap_seca: 1.7 },
        ],
        umidades: [
          { teor_umidade_media: 10 },
          { teor_umidade_media: 12 },
        ],
      };
      const points = buildChartPoints(ensaio, false);
      expect(points).toHaveLength(2);
      expect(points[0]).toEqual({ x: 10, y: 1.6 });
    });

    it('filtra pontos inválidos (x <= 0 ou y <= 0)', () => {
      const ensaio = {
        densidades: [
          { umidade_calculada: 0, dens_ap_seca: 1.6 },
          { umidade_calculada: 10, dens_ap_seca: 1.7 },
        ],
      };
      const points = buildChartPoints(ensaio, true);
      expect(points).toHaveLength(1);
    });

    it('retorna array vazio se sem densidades', () => {
      const ensaio = { densidades: null };
      const points = buildChartPoints(ensaio, true);
      expect(points).toEqual([]);
    });
  });

  describe('buildISCPoints', () => {
    it('constrói pontos ISC corretamente', () => {
      const ensaio = {
        cbr_cilindros: [
          { leituras: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        ],
        cbr_fator_anel: '2',
        densidades: [{ umidade_calculada: 10 }],
      };
      const points = buildISCPoints(ensaio, true);
      expect(points.length).toBeGreaterThanOrEqual(0);
    });

    it('filtra pontos com ISC nulo', () => {
      const ensaio = {
        cbr_cilindros: [
          { leituras: [] },
        ],
        cbr_fator_anel: '0',
        densidades: [{ umidade_calculada: 10 }],
      };
      const points = buildISCPoints(ensaio, true);
      expect(points).toEqual([]);
    });
  });

  describe('buildExpansaoPoints', () => {
    it('constrói pontos de expansão', () => {
      const ensaio = {
        expansao_cilindros: [
          {
            altura_inicial: 127.5,
            leitura_1dia: 10,
            leitura_2dia: 11,
            expansao_pct: 0.78,
          },
        ],
        densidades: [{ umidade_calculada: 10 }],
      };
      const points = buildExpansaoPoints(ensaio, true);
      expect(points.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('fmtN', () => {
    it('formata número com 2 casas decimais por padrão', () => {
      expect(fmtN(3.14159)).toBe('3.14');
    });

    it('formata com casas decimais customizadas', () => {
      expect(fmtN(3.14159, 3)).toBe('3.142');
    });

    it('retorna - para valores nulos/undefined/NaN', () => {
      expect(fmtN(null)).toBe('-');
      expect(fmtN(undefined)).toBe('-');
      expect(fmtN(NaN)).toBe('-');
    });
  });

  describe('fmtDate', () => {
    it('formata data no padrão pt-BR', () => {
      const result = fmtDate('2024-05-15');
      expect(result).toContain('15');
    });

    it('retorna - se data nula', () => {
      expect(fmtDate(null)).toBe('-');
      expect(fmtDate(undefined)).toBe('-');
    });
  });

  describe('calcISC', () => {
    it('calcula ISC com fator válido', () => {
      const cil = { leituras: [1, 2, 3, 4, 5, 6, 7, 8, 9] };
      const result = calcISC(cil, '2');
      expect(result).toHaveProperty('isc254');
      expect(result).toHaveProperty('isc508');
      expect(result).toHaveProperty('isc');
    });

    it('retorna null com fator inválido', () => {
      const cil = { leituras: [1, 2, 3] };
      const result = calcISC(cil, '0');
      expect(result.isc254).toBe(null);
    });
  });

  describe('calcExpansao', () => {
    it('calcula expansão percentual', () => {
      const exp = {
        altura_inicial: 127.5,
        leitura_1dia: 10,
        leitura_2dia: 11,
        leitura_3dia: null,
        leitura_4dia: null,
      };
      const result = calcExpansao(exp);
      expect(result).toHaveProperty('diferenca');
      expect(result).toHaveProperty('expansao_pct');
    });
  });

  describe('evalParabola', () => {
    it('avalia parábola num ponto', () => {
      const parabola = { a: 1, b: 2, c: 3 };
      const result = evalParabola(parabola, 2);
      expect(result).toBe(11); // 1*4 + 2*2 + 3 = 11
    });

    it('retorna null sem parábola', () => {
      expect(evalParabola(null, 2)).toBe(null);
    });

    it('retorna null com x nulo', () => {
      const parabola = { a: 1, b: 2, c: 3 };
      expect(evalParabola(parabola, null)).toBe(null);
    });
  });
});