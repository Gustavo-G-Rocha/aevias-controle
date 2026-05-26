import { describe, it, expect } from 'vitest';
import {
  PENEIRAS_CONFIG,
  formatDate,
  formatDateBrasilia,
  calcularGranulometria,
  calcularMedia,
  getHeightClass,
  getXLog,
  getYGraph,
} from '../../utils/relatorioCAUQUtils';

// ── PENEIRAS_CONFIG ───────────────────────────────────────────────────────────
describe('PENEIRAS_CONFIG', () => {
  it('tem 20 peneiras', () => {
    expect(PENEIRAS_CONFIG).toHaveLength(20);
  });

  it('primeira peneira é 75mm', () => {
    expect(PENEIRAS_CONFIG[0].abertura).toBe('75,0');
    expect(PENEIRAS_CONFIG[0].key).toBe('peneira_75_0mm');
  });

  it('última peneira é 0.075mm (Nº 200)', () => {
    expect(PENEIRAS_CONFIG[19].key).toBe('peneira_0_075mm');
    expect(PENEIRAS_CONFIG[19].label).toBe('Nº 200');
  });
});

// ── formatDate ────────────────────────────────────────────────────────────────
describe('formatDate', () => {
  it('formata data ISO para pt-BR UTC', () => {
    expect(formatDate('2024-03-15')).toBe('15/03/2024');
  });

  it('retorna string vazia para undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('retorna string vazia para null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('retorna string vazia para string vazia', () => {
    expect(formatDate('')).toBe('');
  });
});

// ── formatDateBrasilia ────────────────────────────────────────────────────────
describe('formatDateBrasilia', () => {
  it('retorna N/A para null', () => {
    expect(formatDateBrasilia(null)).toBe('N/A');
  });

  it('retorna N/A para undefined', () => {
    expect(formatDateBrasilia(undefined)).toBe('N/A');
  });

  it('formata datetime string sem Z adicionando Z antes de parsear', () => {
    const result = formatDateBrasilia('2024-03-15T12:00:00');
    expect(result).toContain('2024');
  });

  it('não modifica string já com Z', () => {
    const result = formatDateBrasilia('2024-03-15T12:00:00Z');
    expect(result).toContain('2024');
  });
});

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
      faixaTrabalhoMax:   { peneira_19_0mm: 98 },
      faixa_trabalho_max: { peneira_19_0mm: 98 },
    };
    const faixa = { peneiras: [{ abertura: '19,0', min: 80, max: 100 }] };
    const result = calcularGranulometria(ensaioBase, faixa, project);
    expect(result[0].faixaTrabalhoMin).toBe(72);
    expect(result[0].faixaTrabalhoMax).toBe(98);
  });

  it('pesoInicial zero resulta em percentualPassante 0', () => {
    const ensaioSemPeso = {
      granulometria: { peso_retido_peneiras: { peneira_19_0mm: 50 } },
      extracao_ligante: { amostra_sem_ligante: 0 },
    };
    const result = calcularGranulometria(ensaioSemPeso, null, null);
    const peneira = result.find(p => p.astm === 'Nº ¾"');
    expect(Number(peneira.percentualPassante)).toBe(0);
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

// ── calcularMedia ─────────────────────────────────────────────────────────────
describe('calcularMedia', () => {
  const cps = [
    { densidade_aparente: '2.350', volume_vazios: '4.5', rtcd_valor: '1.2' },
    { densidade_aparente: '2.360', volume_vazios: '4.7', rtcd_valor: '1.4' },
    { densidade_aparente: '2.340', volume_vazios: '4.3', rtcd_valor: '1.0' },
  ];

  it('retorna "-" para array vazio', () => {
    expect(calcularMedia([], 'densidade_aparente')).toBe('-');
  });

  it('retorna "-" para campo sem valores numéricos', () => {
    expect(calcularMedia([{ x: 'abc' }], 'x')).toBe('-');
  });

  it('calcula média de densidade_aparente com 3 casas', () => {
    // (2.350+2.360+2.340)/3 = 2.350
    expect(calcularMedia(cps, 'densidade_aparente')).toBe('2.350');
  });

  it('calcula média de volume_vazios com 1 casa', () => {
    // (4.5+4.7+4.3)/3 = 4.5
    expect(calcularMedia(cps, 'volume_vazios')).toBe('4.5');
  });

  it('calcula média genérica com 2 casas decimais', () => {
    expect(calcularMedia(cps, 'rtcd_valor')).toBe('1.20');
  });

  it('ignora valores NaN', () => {
    const cpsComNaN = [{ rtcd_valor: '1.0' }, { rtcd_valor: 'abc' }, { rtcd_valor: '3.0' }];
    expect(calcularMedia(cpsComNaN, 'rtcd_valor')).toBe('2.00');
  });
});

// ── getHeightClass ────────────────────────────────────────────────────────────
describe('getHeightClass', () => {
  it('sem marshall, 5 peneiras → h-12', () => {
    expect(getHeightClass(5, false)).toBe('h-12');
  });

  it('sem marshall, 10 peneiras → h-8', () => {
    expect(getHeightClass(10, false)).toBe('h-8');
  });

  it('sem marshall, 20 peneiras → h-6', () => {
    expect(getHeightClass(20, false)).toBe('h-6');
  });

  it('com marshall, 5 peneiras → h-8', () => {
    expect(getHeightClass(5, true)).toBe('h-8');
  });

  it('com marshall, 13 peneiras → h-4', () => {
    expect(getHeightClass(13, true)).toBe('h-4');
  });

  it('com marshall, 20 peneiras → h-3', () => {
    expect(getHeightClass(20, true)).toBe('h-3');
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
    // alturaTotal - (100/100 * alturaGrafico) = 390 - 385 = 5
    expect(getYGraph(100, 390, 385)).toBeCloseTo(5);
  });

  it('0% passante retorna base do gráfico (y = alturaTotal)', () => {
    expect(getYGraph(0, 390, 385)).toBeCloseTo(390);
  });

  it('50% passante retorna metade', () => {
    // 390 - (50/100 * 385) = 390 - 192.5 = 197.5
    expect(getYGraph(50, 390, 385)).toBeCloseTo(197.5);
  });
});