/**
 * Testes da função pura calcularLimites extraída de RelatorioLimites.
 */
import { describe, it, expect } from 'vitest';
import { calcularLimites, PENEIRAS_GROSSAS, PENEIRAS_FINAS } from '@/utils/relatorioLimitesUtils';

describe('calcularLimites', () => {
  it('retorna estrutura completa mesmo com objeto vazio', () => {
    const result = calcularLimites({});
    expect(result).toHaveProperty('higroT1');
    expect(result).toHaveProperty('higroMedia');
    expect(result).toHaveProperty('granGrossaCalc');
    expect(result).toHaveProperty('sp10');
    expect(result).toHaveProperty('llFit');
    expect(result).toHaveProperty('lpMedia');
    expect(result).toHaveProperty('IP');
    expect(result).toHaveProperty('hrb');
  });

  it('calcula higroT1 corretamente', () => {
    const lim = {
      higro_solo_umido_capsula_1: 30,
      higro_solo_seco_capsula_1: 28,
      higro_peso_capsula_1: 20,
    };
    const result = calcularLimites(lim);
    // agua = 30 - 28 = 2; solo = 28 - 20 = 8; teor = 2/8 * 100 = 25
    expect(result.higroT1).toBe(25);
  });

  it('calcula higroMedia como média dos valores válidos', () => {
    const lim = {
      higro_solo_umido_capsula_1: 30,
      higro_solo_seco_capsula_1: 28,
      higro_peso_capsula_1: 20,
      higro_solo_umido_capsula_2: 31,
      higro_solo_seco_capsula_2: 28,
      higro_peso_capsula_2: 20,
    };
    const result = calcularLimites(lim);
    // T1 = 25, T2 = (31-28)/(28-20)*100 = 3/8*100 = 37.5 → 37.5 → media = 31.25 → 31.25
    expect(result.higroT1).toBe(25);
    expect(result.higroT2).toBe(37.5);
    expect(result.higroMedia).toBe(31.25);
  });

  it('usa peneiras padrão quando não informadas', () => {
    const result = calcularLimites({});
    expect(result.penGrossas).toHaveLength(PENEIRAS_GROSSAS.length);
    expect(result.penFinas).toHaveLength(PENEIRAS_FINAS.length);
  });

  it('calcula granGrossaCalc quando totalSeca é fornecido', () => {
    const lim = {
      amostra_total_seca: 100,
      peneiras_grossas: [
        { label: '3"', mm: 76.2, retido: 10 },
        { label: '2"', mm: 50.8, retido: 20 },
      ],
    };
    const result = calcularLimites(lim);
    expect(result.granGrossaCalc).toHaveLength(2);
    // Primeiro: acum=100, ret=10 → passando=90, pct=90%
    expect(result.granGrossaCalc[0].passando).toBe(90);
    expect(result.granGrossaCalc[0].passPct).toBe(90);
    // Segundo: acum=90, ret=20 → passando=70, pct=70%
    expect(result.granGrossaCalc[1].passando).toBe(70);
    expect(result.granGrossaCalc[1].passPct).toBe(70);
  });

  it('retorna granGrossaCalc vazio quando totalSeca é inválido', () => {
    const result = calcularLimites({ amostra_total_seca: 0 });
    expect(result.granGrossaCalc).toEqual([]);
  });

  it('calcula lpMedia como média dos teores válidos', () => {
    const lim = {
      lp_rows: [
        { solo_umido_capsula: 25, solo_seco_capsula: 23, peso_capsula: 20 },
        { solo_umido_capsula: 26, solo_seco_capsula: 23, peso_capsula: 20 },
      ],
    };
    const result = calcularLimites(lim);
    // T1 = (25-23)/(23-20)*100 = 2/3*100 = 66.67
    // T2 = (26-23)/(23-20)*100 = 3/3*100 = 100
    expect(result.lpTeors[0]).toBe(66.67);
    expect(result.lpTeors[1]).toBe(100);
    // Media = (66.67 + 100) / 2 = 83.335 → toFixed(1) = 83.3
    expect(result.lpMedia).toBe(83.3);
  });

  it('calcula IP quando ll e lp estão disponíveis', () => {
    const lim = {
      ll_rows: [
        { num_golpes: 25, solo_umido_capsula: 30, solo_seco_capsula: 28, peso_capsula: 20 },
        { num_golpes: 20, solo_umido_capsula: 32, solo_seco_capsula: 28, peso_capsula: 20 },
      ],
      lp_rows: [
        { solo_umido_capsula: 25, solo_seco_capsula: 23, peso_capsula: 20 },
      ],
    };
    const result = calcularLimites(lim);
    expect(result.llFit).not.toBeNull();
    expect(result.lpMedia).not.toBeNull();
    expect(result.IP).not.toBeNull();
    expect(result.IP).toBe(parseFloat((result.llFit.ll - result.lpMedia).toFixed(1)));
  });
});