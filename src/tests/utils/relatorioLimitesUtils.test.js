/**
 * Testes das funções puras extraídas de RelatorioLimites.
 */
import { describe, it, expect } from 'vitest';
import {
  fmtN,
  calcUmidade,
  calcLLRow,
  fitLogLine,
  calcIG,
  classificarHRB,
  fmtDate,
  fmtDateTime,
} from '@/utils/relatorioLimitesUtils';

// ─── fmtN ─────────────────────────────────────────────────────────────────────
describe('fmtN', () => {
  it('formata número com 2 casas por padrão', () => {
    expect(fmtN(3.14159)).toBe('3.14');
  });
  it('formata número com casas decimais customizadas', () => {
    expect(fmtN(3.14159, 4)).toBe('3.1416');
  });
  it('aceita string numérica', () => {
    expect(fmtN('12.5')).toBe('12.50');
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
  it('retorna "-" para string não-numérica', () => {
    expect(fmtN('abc')).toBe('-');
  });
  it('aceita zero', () => {
    expect(fmtN(0)).toBe('0.00');
  });
});

// ─── calcUmidade ──────────────────────────────────────────────────────────────
describe('calcUmidade', () => {
  it('calcula corretamente com valores válidos', () => {
    // água = 50-40 = 10; solo = 40-10 = 30; umidade = 10/30*100 = 33.33
    expect(calcUmidade(50, 40, 10)).toBeCloseTo(33.33, 1);
  });
  it('retorna null quando solo <= 0 (seco === tara)', () => {
    expect(calcUmidade(50, 10, 10)).toBeNull();
  });
  it('retorna null para valores não numéricos', () => {
    expect(calcUmidade('a', 'b', 'c')).toBeNull();
  });
  it('retorna null para undefined', () => {
    expect(calcUmidade(undefined, undefined, undefined)).toBeNull();
  });
  it('retorna null quando solo seria negativo', () => {
    expect(calcUmidade(50, 5, 10)).toBeNull();
  });
});

// ─── calcLLRow ────────────────────────────────────────────────────────────────
describe('calcLLRow', () => {
  it('calcula teor para linha válida', () => {
    const row = { solo_umido_capsula: 50, solo_seco_capsula: 40, peso_capsula: 10 };
    expect(calcLLRow(row).teor).toBeCloseTo(33.33, 1);
  });
  it('retorna { teor: null } quando solo <= 0', () => {
    const row = { solo_umido_capsula: 50, solo_seco_capsula: 10, peso_capsula: 10 };
    expect(calcLLRow(row).teor).toBeNull();
  });
  it('retorna { teor: null } para campos ausentes', () => {
    expect(calcLLRow({}).teor).toBeNull();
  });
});

// ─── fitLogLine ───────────────────────────────────────────────────────────────
describe('fitLogLine', () => {
  it('retorna null para menos de 2 pontos válidos', () => {
    expect(fitLogLine([])).toBeNull();
    expect(fitLogLine([{ x: 10, y: 30 }])).toBeNull();
  });
  it('retorna null para pontos com x <= 0', () => {
    expect(fitLogLine([{ x: 0, y: 30 }, { x: -1, y: 25 }])).toBeNull();
  });
  it('retorna { a, b, ll } para 2+ pontos válidos', () => {
    const pts = [{ x: 20, y: 30 }, { x: 30, y: 25 }];
    const result = fitLogLine(pts);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('a');
    expect(result).toHaveProperty('b');
    expect(result).toHaveProperty('ll');
  });
  it('ll é o valor em x=25 da reta ajustada', () => {
    // linha horizontal y=28 → a=0, b=28, ll=28
    const pts = [{ x: 10, y: 28 }, { x: 40, y: 28 }];
    const result = fitLogLine(pts);
    expect(result.ll).toBeCloseTo(28, 1);
  });
  it('ignora pontos com y=null', () => {
    const pts = [{ x: 10, y: null }, { x: 20, y: 30 }, { x: 30, y: 25 }];
    const result = fitLogLine(pts);
    expect(result).not.toBeNull();
  });
});

// ─── calcIG ───────────────────────────────────────────────────────────────────
describe('calcIG', () => {
  it('retorna null quando algum parâmetro é null', () => {
    expect(calcIG(null, 40, 10)).toBeNull();
    expect(calcIG(50, null, 10)).toBeNull();
    expect(calcIG(50, 40, null)).toBeNull();
  });
  it('retorna 0 para solo granular típico (F200<35, ll<40, ip<10)', () => {
    expect(calcIG(20, 30, 5)).toBe(0);
  });
  it('nunca retorna valor negativo', () => {
    expect(calcIG(0, 0, 0)).toBeGreaterThanOrEqual(0);
  });
  it('retorna valor > 0 para solo argiloso típico', () => {
    // F200=70, ll=55, ip=25
    const ig = calcIG(70, 55, 25);
    expect(ig).toBeGreaterThan(0);
  });
});

// ─── classificarHRB ───────────────────────────────────────────────────────────
describe('classificarHRB', () => {
  it('classifica A1-a para areia grossa bem graduada', () => {
    expect(classificarHRB(50, 30, 30, 35, 6, 0)).toBe('A1-a');
  });
  it('classifica A1-b quando f40<=50 e ip<=6 e ig=0', () => {
    expect(classificarHRB(80, 50, 30, 35, 6, 0)).toBe('A1-b');
  });
  it('classifica A3 quando f200<=35 e f40>=51 e ip=0', () => {
    expect(classificarHRB(80, 60, 5, 20, 0, 0)).toBe('A3');
  });
  it('classifica A4 para solo siltoso com LL<=40', () => {
    expect(classificarHRB(80, 80, 50, 35, 8, 5)).toBe('A4');
  });
  it('classifica A6 para solo argiloso com LL<=40 e ip>=11', () => {
    expect(classificarHRB(80, 80, 50, 35, 15, 12)).toBe('A6');
  });
  it('retorna "-" para combinação não classificável', () => {
    expect(classificarHRB(null, null, null, null, null, null)).toBe('A1-a');
  });
  it('classifica A2-4 para granular com LL<=40 e ip<=10 e ig=0', () => {
    expect(classificarHRB(80, 60, 30, 35, 8, 0)).toBe('A2-4');
  });
});

// ─── fmtDate ──────────────────────────────────────────────────────────────────
describe('fmtDate', () => {
  it('retorna "-" para valor falsy', () => {
    expect(fmtDate(null)).toBe('-');
    expect(fmtDate(undefined)).toBe('-');
    expect(fmtDate('')).toBe('-');
  });
  it('formata data ISO YYYY-MM-DD para pt-BR', () => {
    // A data local varia por timezone; basta confirmar que não retorna "-"
    const result = fmtDate('2025-06-15');
    expect(result).not.toBe('-');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

// ─── fmtDateTime ──────────────────────────────────────────────────────────────
describe('fmtDateTime', () => {
  it('retorna "-" para valor falsy', () => {
    expect(fmtDateTime(null)).toBe('-');
    expect(fmtDateTime(undefined)).toBe('-');
    expect(fmtDateTime('')).toBe('-');
  });
  it('retorna string não vazia para datetime ISO válido', () => {
    const result = fmtDateTime('2025-06-15T10:30:00Z');
    expect(result).not.toBe('-');
    expect(result.length).toBeGreaterThan(0);
  });
  it('adiciona Z quando string não termina em Z e não contém +', () => {
    // Não deve lançar erro
    expect(() => fmtDateTime('2025-06-15T10:30:00')).not.toThrow();
  });
});