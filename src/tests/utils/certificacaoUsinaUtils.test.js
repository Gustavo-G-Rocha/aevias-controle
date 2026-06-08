import { describe, it, expect } from 'vitest';
import {
  calcularErro,
  calcularDesvioPadrao,
  contarConformidades,
  validarCertificacao,
  initGranulometriaRows,
  initEnsaioValidacaoRows,
  PENEIRAS_GRANULOMETRIA,
} from '@/utils/certificacaoUsinaUtils';

describe('calcularErro', () => {
  it('calcula erro corretamente', () => {
    expect(calcularErro(10, 12)).toBe(2);
    expect(calcularErro(5.5, 5.0)).toBeCloseTo(-0.5);
  });
  it('retorna null quando algum valor é null', () => {
    expect(calcularErro(null, 5)).toBeNull();
    expect(calcularErro(5, null)).toBeNull();
  });
  it('retorna null para valores não numéricos', () => {
    expect(calcularErro('abc', 5)).toBeNull();
  });
});

describe('calcularDesvioPadrao', () => {
  it('calcula desvio padrão de lista simples', () => {
    const valores = [2, 4, 4, 4, 5, 5, 7, 9];
    const dp = calcularDesvioPadrao(valores);
    expect(dp).toBeCloseTo(2.0, 1);
  });
  it('retorna null para menos de 2 valores', () => {
    expect(calcularDesvioPadrao([])).toBeNull();
    expect(calcularDesvioPadrao([5])).toBeNull();
  });
  it('ignora valores nulos', () => {
    const dp = calcularDesvioPadrao([null, 4, 6, null]);
    expect(dp).toBeCloseTo(Math.sqrt(2), 3);
  });
});

describe('contarConformidades', () => {
  it('conta corremente conforme e não conforme', () => {
    const secao = {
      a: 'Conforme',
      b: 'Não conforme',
      c: 'Conforme',
      d: 'Conforme',
    };
    const resultado = contarConformidades(secao);
    expect(resultado.conforme).toBe(3);
    expect(resultado.nao_conforme).toBe(1);
    expect(resultado.total).toBe(4);
  });
  it('retorna zeros para objeto vazio', () => {
    const r = contarConformidades({});
    expect(r.total).toBe(0);
  });
  it('ignora campos nulos', () => {
    const r = contarConformidades({ a: null, b: 'Conforme' });
    expect(r.conforme).toBe(1);
    expect(r.total).toBe(1);
  });
});

describe('validarCertificacao', () => {
  it('rascunho é sempre válido', () => {
    expect(validarCertificacao({}, 'rascunho').valid).toBe(true);
  });
  it('finalizado sem data é inválido', () => {
    const r = validarCertificacao({ razao_social: 'Teste', obra_id: '1' }, 'finalizado');
    expect(r.valid).toBe(false);
  });
  it('finalizado sem razão social é inválido', () => {
    const r = validarCertificacao({ data_vistoria: '2024-01-01', obra_id: '1' }, 'finalizado');
    expect(r.valid).toBe(false);
  });
  it('finalizado com todos campos obrigatórios é válido', () => {
    const r = validarCertificacao({ data_vistoria: '2024-01-01', razao_social: 'ABC', obra_id: '1' }, 'finalizado');
    expect(r.valid).toBe(true);
  });
});

describe('initGranulometriaRows', () => {
  it('retorna uma linha por peneira', () => {
    const rows = initGranulometriaRows();
    expect(rows.length).toBe(PENEIRAS_GRANULOMETRIA.length);
    expect(rows[0].peneira).toBe('1 1/2"');
  });
});

describe('initEnsaioValidacaoRows', () => {
  it('retorna número correto de linhas', () => {
    expect(initEnsaioValidacaoRows(3).length).toBe(3);
    expect(initEnsaioValidacaoRows().length).toBe(4);
  });
});