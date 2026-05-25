import { describe, it, expect } from 'vitest';
import { sanitizeNumber, sanitizeNestedNumbers, sanitizeAgregados, sanitizeEquivalenteAreia } from '@/utils/dataSanitization';

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

describe('sanitizeAgregados', () => {
  it('converte campos numéricos vazios para null', () => {
    const input = [{
      nome: 'Brita 1',
      peso_umido: '',
      peso_seco: '500.5',
      agua: '',
      umidade: '',
      granulometria: {},
    }];
    const result = sanitizeAgregados(input);
    expect(result[0].peso_umido).toBeNull();
    expect(result[0].peso_seco).toBe(500.5);
    expect(result[0].agua).toBeNull();
    expect(result[0].umidade).toBeNull();
    expect(result[0].nome).toBe('Brita 1');
  });

  it('sanitiza granulometria aninhada', () => {
    const input = [{
      nome: 'A',
      peso_umido: '', peso_seco: '', agua: '', umidade: '',
      granulometria: {
        peneira_9_5mm: { retido: '12.3', passante: '' },
        peneira_4_75mm: { retido: '', passante: '95.0' },
      },
    }];
    const result = sanitizeAgregados(input);
    expect(result[0].granulometria.peneira_9_5mm.retido).toBe(12.3);
    expect(result[0].granulometria.peneira_9_5mm.passante).toBeNull();
    expect(result[0].granulometria.peneira_4_75mm.retido).toBeNull();
    expect(result[0].granulometria.peneira_4_75mm.passante).toBe(95.0);
  });

  it('trata granulometria vazia sem erros', () => {
    const input = [{ nome: '', peso_umido: '', peso_seco: '', agua: '', umidade: '', granulometria: {} }];
    expect(() => sanitizeAgregados(input)).not.toThrow();
    expect(sanitizeAgregados(input)[0].granulometria).toEqual({});
  });
});

describe('sanitizeEquivalenteAreia', () => {
  it('converte campos vazios para null', () => {
    const input = {
      medicoes: [
        { topo_argila: '10.5', topo_areia: '', equivalente: '' },
        { topo_argila: '', topo_areia: '8.0', equivalente: '76.19' },
      ],
      media: '',
    };
    const result = sanitizeEquivalenteAreia(input);
    expect(result.medicoes[0].topo_argila).toBe(10.5);
    expect(result.medicoes[0].topo_areia).toBeNull();
    expect(result.medicoes[1].equivalente).toBe(76.19);
    expect(result.media).toBeNull();
  });

  it('trata array de medicoes vazio', () => {
    const result = sanitizeEquivalenteAreia({ medicoes: [], media: '80' });
    expect(result.medicoes).toEqual([]);
    expect(result.media).toBe(80);
  });
});