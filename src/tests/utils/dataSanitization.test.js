import { describe, it, expect } from 'vitest';
import { sanitizeNumber, sanitizeNestedNumbers } from '@/utils/dataSanitization';

describe('sanitizeNumber', () => {
  it('retorna null para string vazia', () => {
    expect(sanitizeNumber('')).toBeNull();
  });

  it('retorna null para null', () => {
    expect(sanitizeNumber(null)).toBeNull();
  });

  it('retorna null para undefined', () => {
    expect(sanitizeNumber(undefined)).toBeNull();
  });

  it('converte string numérica para número', () => {
    expect(sanitizeNumber('3.14')).toBe(3.14);
    expect(sanitizeNumber('10')).toBe(10);
    expect(sanitizeNumber('0')).toBe(0);
  });

  it('retorna null para string não numérica', () => {
    expect(sanitizeNumber('abc')).toBeNull();
  });

  it('aceita número diretamente', () => {
    expect(sanitizeNumber(5)).toBe(5);
    expect(sanitizeNumber(0)).toBe(0);
  });

  it('retorna null para NaN explícito', () => {
    expect(sanitizeNumber(NaN)).toBeNull();
  });
});

describe('sanitizeNestedNumbers', () => {
  it('retorna o mesmo valor para não-objetos', () => {
    expect(sanitizeNestedNumbers(null)).toBeNull();
    expect(sanitizeNestedNumbers(undefined)).toBeUndefined();
    expect(sanitizeNestedNumbers([])).toEqual([]);
  });

  it('sanitiza valores de um objeto plano', () => {
    const input = { a: '1.5', b: '', c: null, d: 'xyz' };
    expect(sanitizeNestedNumbers(input)).toEqual({ a: 1.5, b: null, c: null, d: null });
  });

  it('sanitiza objetos aninhados recursivamente', () => {
    const input = { nivel1: { nivel2: { valor: '42' } } };
    expect(sanitizeNestedNumbers(input)).toEqual({ nivel1: { nivel2: { valor: 42 } } });
  });

  it('não modifica chaves com sub-objetos — percorre recursivamente', () => {
    const input = { meta: { min: '10', max: '20' } };
    const result = sanitizeNestedNumbers(input);
    expect(result.meta.min).toBe(10);
    expect(result.meta.max).toBe(20);
  });
});