import { describe, it, expect } from 'vitest';
import {
  fmtN, fmtDate,
  calcISC, calcExpansao, fitLinear, evalParabola, buildParabolaCurve,
  buildInfoFields, PENETRACOES, TEMPOS, PRESSAO_PADRAO,
} from '../../utils/relatorioProctorUtils';

// ── fmtN ─────────────────────────────────────────────────────────────────────
describe('fmtN', () => {
  it('formata número com 2 casas por padrão', () => {
    expect(fmtN(1.234)).toBe('1.23');
  });
  it('respeita casas decimais customizadas', () => {
    expect(fmtN(1.2345, 3)).toBe('1.235');
  });
  it('retorna "-" para null', () => {
    expect(fmtN(null)).toBe('-');
  });
  it('retorna "-" para undefined', () => {
    expect(fmtN(undefined)).toBe('-');
  });
  it('retorna "-" para NaN', () => {
    expect(fmtN(NaN)).toBe('-');
  });
  it('aceita string numérica', () => {
    expect(fmtN('3.7', 1)).toBe('3.7');
  });
});

// ── fmtDate ──────────────────────────────────────────────────────────────────
describe('fmtDate', () => {
  it('formata data ISO YYYY-MM-DD em pt-BR', () => {
    expect(fmtDate('2024-06-15')).toMatch(/15\/06\/2024/);
  });
  it('retorna "-" para string vazia', () => {
    expect(fmtDate('')).toBe('-');
  });
  it('retorna "-" para null', () => {
    expect(fmtDate(null)).toBe('-');
  });
});

// ── calcISC ───────────────────────────────────────────────────────────────────
describe('calcISC', () => {
  const cil = { leituras: ['0', '0', '0', '100', '0', '200', '0', '0', '0'] };

  it('calcula ISC 254 corretamente', () => {
    const { isc254 } = calcISC(cil, '1');
    expect(isc254).toBeCloseTo(100 / PRESSAO_PADRAO[3] * 100, 0);
  });

  it('calcula ISC 508 corretamente', () => {
    const { isc508 } = calcISC(cil, '1');
    expect(isc508).toBeCloseTo(200 / PRESSAO_PADRAO[5] * 100, 0);
  });

  it('ISC final é o maior entre isc254 e isc508', () => {
    const { isc, isc254, isc508 } = calcISC(cil, '1');
    expect(isc).toBe(Math.max(isc254, isc508));
  });

  it('retorna nulls para fator zero', () => {
    const { isc254, isc508, isc } = calcISC(cil, '0');
    expect(isc254).toBeNull();
    expect(isc508).toBeNull();
    expect(isc).toBeNull();
  });

  it('retorna nulls para fator NaN', () => {
    const { isc } = calcISC(cil, 'abc');
    expect(isc).toBeNull();
  });

  it('pressoes tem 9 elementos', () => {
    expect(calcISC(cil, '1').pressoes).toHaveLength(9);
  });
});

// ── calcExpansao ──────────────────────────────────────────────────────────────
describe('calcExpansao', () => {
  it('calcula diferença e expansão corretamente', () => {
    const exp = { altura_inicial: '100', leitura_1dia: '0', leitura_2dia: '2', leitura_3dia: '', leitura_4dia: '' };
    const { diferenca, expansao_pct } = calcExpansao(exp);
    expect(diferenca).toBe(2);
    expect(expansao_pct).toBeCloseTo(2);
  });

  it('usa a última leitura não vazia', () => {
    const exp = { altura_inicial: '100', leitura_1dia: '0', leitura_2dia: '1', leitura_3dia: '3', leitura_4dia: '' };
    const { diferenca } = calcExpansao(exp);
    expect(diferenca).toBe(3);
  });

  it('retorna null para diferença quando leitura final ausente', () => {
    const exp = { altura_inicial: '100', leitura_1dia: '0', leitura_2dia: '', leitura_3dia: '', leitura_4dia: '' };
    const { diferenca } = calcExpansao(exp);
    expect(diferenca).toBeNull();
  });

  it('retorna null para expansao_pct quando altura inicial é zero', () => {
    const exp = { altura_inicial: '0', leitura_1dia: '0', leitura_2dia: '2', leitura_3dia: '', leitura_4dia: '' };
    const { expansao_pct } = calcExpansao(exp);
    expect(expansao_pct).toBeNull();
  });
});

// ── fitLinear ─────────────────────────────────────────────────────────────────
describe('fitLinear', () => {
  it('retorna null com menos de 2 pontos', () => {
    expect(fitLinear([{ x: 1, y: 1 }])).toBeNull();
  });

  it('ajusta reta perfeita y = 2x + 1', () => {
    const pts = [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }];
    const { a, b } = fitLinear(pts);
    expect(a).toBeCloseTo(2);
    expect(b).toBeCloseTo(1);
  });

  it('retorna null para pontos colineares verticais (denominador zero)', () => {
    const pts = [{ x: 1, y: 0 }, { x: 1, y: 5 }];
    expect(fitLinear(pts)).toBeNull();
  });
});

// ── evalParabola ──────────────────────────────────────────────────────────────
describe('evalParabola', () => {
  const par = { a: 1, b: 0, c: 0 }; // y = x²

  it('avalia y = x² corretamente', () => {
    expect(evalParabola(par, 3)).toBeCloseTo(9);
  });

  it('retorna null para parábola null', () => {
    expect(evalParabola(null, 3)).toBeNull();
  });

  it('retorna null para x null', () => {
    expect(evalParabola(par, null)).toBeNull();
  });
});

// ── buildParabolaCurve ────────────────────────────────────────────────────────
describe('buildParabolaCurve', () => {
  const par = { a: -1, b: 20, c: -80 };
  const pts = [{ x: 8, y: 1 }, { x: 10, y: 2 }, { x: 12, y: 1 }];

  it('retorna 30 pontos para entrada válida', () => {
    expect(buildParabolaCurve(pts, par)).toHaveLength(30);
  });

  it('retorna array vazio se parábola é null', () => {
    expect(buildParabolaCurve(pts, null)).toHaveLength(0);
  });

  it('retorna array vazio se pts é vazio', () => {
    expect(buildParabolaCurve([], par)).toHaveLength(0);
  });

  it('x da curva fica dentro do range dos pontos', () => {
    const curve = buildParabolaCurve(pts, par);
    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    curve.forEach(p => {
      expect(p.x).toBeGreaterThanOrEqual(minX - 0.01);
      expect(p.x).toBeLessThanOrEqual(maxX + 0.01);
    });
  });
});

// ── buildInfoFields ───────────────────────────────────────────────────────────
describe('buildInfoFields', () => {
  it('retorna 9 campos', () => {
    const ensaio = { local_coleta: 'X', material: 'Y', rodovia: 'Z', energia_compactacao: 'Normal', laboratorista_name: 'L', trecho: 'T', camada: 'C', data_ensaio: '2024-01-01' };
    expect(buildInfoFields(ensaio, { name: 'Obra A' })).toHaveLength(9);
  });

  it('usa "-" para campos ausentes', () => {
    const fields = buildInfoFields({}, null);
    fields.forEach(([, val]) => expect(val).toBe('-'));
  });

  it('usa nome da obra corretamente', () => {
    const fields = buildInfoFields({}, { name: 'Rodovia BR-101' });
    expect(fields[0][1]).toBe('Rodovia BR-101');
  });
});

// ── Constantes ─────────────────────────────────────────────────────────────────
describe('constantes', () => {
  it('PENETRACOES tem 9 valores', () => {
    expect(PENETRACOES).toHaveLength(9);
  });
  it('TEMPOS tem 9 valores', () => {
    expect(TEMPOS).toHaveLength(9);
  });
  it('PRESSAO_PADRAO tem entrada para índice 3 e 5', () => {
    expect(PRESSAO_PADRAO[3]).toBeDefined();
    expect(PRESSAO_PADRAO[5]).toBeDefined();
  });
});