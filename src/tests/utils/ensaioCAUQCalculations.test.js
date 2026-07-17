/**
 * Robustez — Cálculos do Ensaio CAUQ (ensaioCAUQCalculations.js)
 *
 * O fator de correção de estabilidade Marshall (tabela DNIT) afeta
 * diretamente o resultado do ensaio. Erros de interpolação produziriam
 * laudos técnicos incorretos. Testa limites, interpolação e monotonicidade.
 */
import { describe, it, expect } from 'vitest';
import {
  TABELA_CORRECAO_ESTABILIDADE,
  getFatorCorrecaoEstabilidade,
  novoCorpoProva,
} from '../../utils/ensaioCAUQCalculations.js';

describe('getFatorCorrecaoEstabilidade — limites da tabela', () => {
  it('altura abaixo do mínimo (50.8mm) → clamp no primeiro fator (1.47)', () => {
    expect(getFatorCorrecaoEstabilidade(40)).toBe(1.47);
    expect(getFatorCorrecaoEstabilidade(0)).toBe(1.47);
    expect(getFatorCorrecaoEstabilidade(-5)).toBe(1.47);
  });

  it('altura acima do máximo (76.2mm) → clamp no último fator (0.76)', () => {
    expect(getFatorCorrecaoEstabilidade(80)).toBe(0.76);
    expect(getFatorCorrecaoEstabilidade(1000)).toBe(0.76);
  });

  it('altura exatamente nos extremos', () => {
    expect(getFatorCorrecaoEstabilidade(50.8)).toBe(1.47);
    expect(getFatorCorrecaoEstabilidade(76.2)).toBe(0.76);
  });
});

describe('getFatorCorrecaoEstabilidade — valores exatos da tabela DNIT', () => {
  it('63.5mm (CP padrão Marshall) → 1.00', () => {
    expect(getFatorCorrecaoEstabilidade(63.5)).toBe(1.0);
  });
  it('60.0mm → 1.10', () => {
    expect(getFatorCorrecaoEstabilidade(60.0)).toBe(1.1);
  });
  it('70.3mm → 0.85', () => {
    expect(getFatorCorrecaoEstabilidade(70.3)).toBe(0.85);
  });
});

describe('getFatorCorrecaoEstabilidade — interpolação linear', () => {
  it('ponto médio entre 63.5 (1.00) e 63.9 (0.99) ≈ 0.995', () => {
    expect(getFatorCorrecaoEstabilidade(63.7)).toBeCloseTo(0.995, 3);
  });
  it('interpolação entre 50.8 (1.47) e 51.0 (1.45): 50.9 → 1.46', () => {
    expect(getFatorCorrecaoEstabilidade(50.9)).toBeCloseTo(1.46, 3);
  });
  it('resultado sempre dentro do intervalo dos vizinhos', () => {
    const f = getFatorCorrecaoEstabilidade(58.55);
    expect(f).toBeLessThanOrEqual(1.15);
    expect(f).toBeGreaterThanOrEqual(1.14);
  });
});

describe('getFatorCorrecaoEstabilidade — monotonicidade (fator decresce com altura)', () => {
  it('varredura de 50.8 a 76.2 nunca aumenta o fator', () => {
    let prev = Infinity;
    for (let h = 50.8; h <= 76.2; h += 0.1) {
      const f = getFatorCorrecaoEstabilidade(h);
      expect(f).toBeLessThanOrEqual(prev + 1e-9);
      prev = f;
    }
  });
});

describe('TABELA_CORRECAO_ESTABILIDADE — integridade da tabela', () => {
  it('alturas estritamente crescentes (pré-requisito da interpolação)', () => {
    for (let i = 1; i < TABELA_CORRECAO_ESTABILIDADE.length; i++) {
      expect(TABELA_CORRECAO_ESTABILIDADE[i][0]).toBeGreaterThan(TABELA_CORRECAO_ESTABILIDADE[i - 1][0]);
    }
  });
  it('fatores não-crescentes', () => {
    for (let i = 1; i < TABELA_CORRECAO_ESTABILIDADE.length; i++) {
      expect(TABELA_CORRECAO_ESTABILIDADE[i][1]).toBeLessThanOrEqual(TABELA_CORRECAO_ESTABILIDADE[i - 1][1]);
    }
  });
  it('todos os pares têm 2 números válidos', () => {
    for (const [h, f] of TABELA_CORRECAO_ESTABILIDADE) {
      expect(Number.isFinite(h)).toBe(true);
      expect(Number.isFinite(f)).toBe(true);
      expect(f).toBeGreaterThan(0);
    }
  });
});

describe('novoCorpoProva — template', () => {
  it('inicializa com numero e const_prensa=1.0', () => {
    const cp = novoCorpoProva(3);
    expect(cp.numero).toBe(3);
    expect(cp.const_prensa).toBe(1.0);
    expect(cp.metodo_rompimento).toBe('estabilidade_fluencia');
  });
  it('campos de medição iniciam null (não 0 — evita falso resultado)', () => {
    const cp = novoCorpoProva(1);
    for (const k of ['peso_ar', 'peso_imerso', 'volume', 'densidade_aparente', 'estabilidade_corrigida', 'fluencia']) {
      expect(cp[k]).toBeNull();
    }
  });
});