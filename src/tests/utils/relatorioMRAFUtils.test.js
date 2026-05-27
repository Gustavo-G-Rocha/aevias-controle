import { describe, it, expect } from 'vitest';
import {
  calcularGranulometria,
  getHeightClass,
  getXLog,
  getYGraph,
  calcularPercentualEmulsao,
} from '../../utils/relatorioMRAFUtils';

// ── calcularGranulometria ─────────────────────────────────────────────────────
describe('calcularGranulometria', () => {
  const ensaioBase = {
    granulometria: {
      peso_retido_peneiras: {
        peneira_19_0mm: 50,
        peneira_12_5mm: 100,
        peneira_9_5mm: 80,
        peneira_4_75mm: 40,
        peneira_0_075mm: 10,
      },
    },
    extracao_ligante: { amostra_sem_ligante: 500 },
  };

  it('retorna array vazio se não há granulometria', () => {
    expect(calcularGranulometria({}, null, null)).toEqual([]);
    expect(calcularGranulometria({ granulometria: {} }, null, null)).toEqual([]);
  });

  it('sem faixa retorna todas as 20 peneiras da config', () => {
    const result = calcularGranulometria(ensaioBase, null, null);
    expect(result).toHaveLength(20);
  });

  it('com faixa filtra apenas peneiras da faixa', () => {
    const faixa = {
      peneiras: [
        { abertura: '19,0mm', min: 80, max: 100 },
        { abertura: '12,5mm', min: 60, max: 90  },
        { abertura: '9,5mm',  min: 40, max: 75  },
      ],
    };
    const result = calcularGranulometria(ensaioBase, faixa, null);
    expect(result).toHaveLength(3);
    expect(result[0].astm).toBe('Nº ¾"');
  });

  it('calcula percentual passante corretamente', () => {
    const faixa = {
      peneiras: [
        { abertura: '19,0', min: 80, max: 100 },
      ],
    };
    const ensaio = {
      granulometria: { peso_retido_peneiras: { peneira_19_0mm: 50 } },
      extracao_ligante: { amostra_sem_ligante: 200 },
    };
    const result = calcularGranulometria(ensaio, faixa, null);
    // (200 - 50) / 200 * 100 = 75.0
    expect(result[0].percentualPassante).toBe('75.0');
  });

  it('popula limiteMin e limiteMax da faixa', () => {
    const faixa = {
      peneiras: [{ abertura: '19,0', min: 80, max: 100 }],
    };
    const result = calcularGranulometria(ensaioBase, faixa, null);
    expect(result[0].limiteMin).toBe(80);
    expect(result[0].limiteMax).toBe(100);
  });

  it('popula faixaTrabalhoMin e faixaTrabalhoMax do projeto', () => {
    const project = {
      faixa_trabalho_min: { peneira_19_0mm: 72 },
      faixa_trabalho_max: { peneira_19_0mm: 98 },
    };
    const faixa = { peneiras: [{ abertura: '19,0', min: 80, max: 100 }] };
    const result = calcularGranulometria(ensaioBase, faixa, project);
    expect(result[0].faixaTrabalhoMin).toBe(72);
    expect(result[0].faixaTrabalhoMax).toBe(98);
  });

  it('acumula retido corretamente (passante decresce)', () => {
    const ensaio = {
      granulometria: {
        peso_retido_peneiras: {
          peneira_19_0mm:  50,
          peneira_12_5mm: 100,
        },
      },
      extracao_ligante: { amostra_sem_ligante: 500 },
    };
    const faixa = {
      peneiras: [
        { abertura: '19,0', min: 0, max: 100 },
        { abertura: '12,5', min: 0, max: 100 },
      ],
    };
    const result = calcularGranulometria(ensaio, faixa, null);
    // Passante após 19mm: (500-50)/500*100 = 90%
    expect(result[0].percentualPassante).toBe('90.0');
    // Passante após 12.5mm: (500-150)/500*100 = 70%
    expect(result[1].percentualPassante).toBe('70.0');
  });
});

// ── getHeightClass ────────────────────────────────────────────────────────────
describe('getHeightClass', () => {
  it('5 peneiras → h-10', () => {
    expect(getHeightClass(5)).toBe('h-10');
  });

  it('10 peneiras → h-7', () => {
    expect(getHeightClass(10)).toBe('h-7');
  });

  it('20 peneiras → h-5', () => {
    expect(getHeightClass(20)).toBe('h-5');
  });
});

// ── getXLog ───────────────────────────────────────────────────────────────────
describe('getXLog', () => {
  it('maior abertura (= max) retorna 30 (eixo esquerdo)', () => {
    expect(getXLog(100, 0.1, 100)).toBeCloseTo(30);
  });

  it('menor abertura (= min) retorna 620 (eixo direito)', () => {
    expect(getXLog(0.1, 0.1, 100)).toBeCloseTo(620);
  });

  it('abertura no meio retorna valor intermediário', () => {
    const x = getXLog(10, 0.1, 100);
    expect(x).toBeGreaterThan(30);
    expect(x).toBeLessThan(620);
  });
});

// ── getYGraph ─────────────────────────────────────────────────────────────────
describe('getYGraph', () => {
  it('100% passante retorna topo do gráfico (y ≈ 5)', () => {
    // 240 - (100/100 * 235) = 240 - 235 = 5
    expect(getYGraph(100)).toBeCloseTo(5);
  });

  it('0% passante retorna base do gráfico (y = 240)', () => {
    expect(getYGraph(0)).toBeCloseTo(240);
  });

  it('50% passante retorna metade', () => {
    // 240 - (50/100 * 235) = 240 - 117.5 = 122.5
    expect(getYGraph(50)).toBeCloseTo(122.5);
  });
});

// ── calcularPercentualEmulsao ─────────────────────────────────────────────────
describe('calcularPercentualEmulsao', () => {
  it('calcula percentual corretamente', () => {
    expect(calcularPercentualEmulsao(4.5, 5.0)).toBe('90.00');
  });

  it('retorna string vazia se teor é undefined', () => {
    expect(calcularPercentualEmulsao(undefined, 5.0)).toBe('');
  });

  it('retorna string vazia se resíduo é undefined', () => {
    expect(calcularPercentualEmulsao(4.5, undefined)).toBe('');
  });

  it('retorna string vazia se ambos são undefined', () => {
    expect(calcularPercentualEmulsao(undefined, undefined)).toBe('');
  });
});