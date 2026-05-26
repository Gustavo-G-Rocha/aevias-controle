import { describe, it, expect } from 'vitest';
import {
  getInitialFormData,
  calcExtracaoLigante,
  calcPassante,
  getPedreiraDoProjeto,
  buildProjectPatch,
} from '../../utils/ensaioMRAFUtils';

// ── getInitialFormData ────────────────────────────────────────────────────────
describe('getInitialFormData', () => {
  it('retorna objeto com obra_id vazio', () => {
    expect(getInitialFormData().obra_id).toBe('');
  });
  it('retorna data_ensaio como data de hoje', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getInitialFormData().data_ensaio).toBe(today);
  });
  it('retorna fator_correcao 1.0', () => {
    expect(getInitialFormData().extracao_ligante.fator_correcao).toBe(1.0);
  });
  it('retorna status rascunho', () => {
    expect(getInitialFormData().status).toBe('rascunho');
  });
  it('retorna peso_retido_peneiras como objeto vazio', () => {
    expect(getInitialFormData().granulometria.peso_retido_peneiras).toEqual({});
  });
});

// ── calcExtracaoLigante ───────────────────────────────────────────────────────
describe('calcExtracaoLigante', () => {
  it('calcula umidade corretamente', () => {
    const ext = { amostra_umida: 110, amostra_seca: 100, fator_correcao: 1, amostra_com_ligante: null, amostra_sem_ligante: null, residuo_emulsao: null, teor_ligante: null };
    const { umidade } = calcExtracaoLigante(ext);
    expect(umidade).toBeCloseTo(10, 1);
  });

  it('não calcula umidade quando amostra_seca é zero', () => {
    const ext = { amostra_umida: 100, amostra_seca: 0, fator_correcao: 1, amostra_com_ligante: null, amostra_sem_ligante: null, residuo_emulsao: null, teor_ligante: null };
    expect(calcExtracaoLigante(ext).umidade).toBeUndefined();
  });

  it('calcula peso_ligante e teor_ligante corretamente', () => {
    const ext = { amostra_umida: null, amostra_seca: null, amostra_com_ligante: 500, amostra_sem_ligante: 480, fator_correcao: 1, residuo_emulsao: null, teor_ligante: null };
    const { peso_ligante, teor_ligante } = calcExtracaoLigante(ext);
    expect(peso_ligante).toBeCloseTo(20, 1);
    expect(teor_ligante).toBeCloseTo((20 / 480) * 100, 1);
  });

  it('aplica fator_correcao no peso_ligante', () => {
    const ext = { amostra_com_ligante: 500, amostra_sem_ligante: 480, fator_correcao: 1.5, amostra_umida: null, amostra_seca: null, residuo_emulsao: null, teor_ligante: null };
    const { peso_ligante } = calcExtracaoLigante(ext);
    expect(peso_ligante).toBeCloseTo(30, 1);
  });

  it('calcula percentual_emulsao a partir do teor calculado', () => {
    const ext = { amostra_com_ligante: 500, amostra_sem_ligante: 480, fator_correcao: 1, residuo_emulsao: 65, amostra_umida: null, amostra_seca: null, teor_ligante: null };
    const res = calcExtracaoLigante(ext);
    const teorEsperado = (20 / 480) * 100;
    expect(res.percentual_emulsao).toBeCloseTo((teorEsperado / 65) * 100, 1);
  });

  it('calcula percentual_emulsao usando teor_ligante já existente no ext', () => {
    const ext = { amostra_com_ligante: null, amostra_sem_ligante: null, fator_correcao: 1, residuo_emulsao: 65, teor_ligante: 4.17, amostra_umida: null, amostra_seca: null };
    const { percentual_emulsao } = calcExtracaoLigante(ext);
    expect(percentual_emulsao).toBeCloseTo((4.17 / 65) * 100, 1);
  });

  it('retorna objeto vazio quando nenhuma entrada', () => {
    const ext = { amostra_umida: null, amostra_seca: null, amostra_com_ligante: null, amostra_sem_ligante: null, fator_correcao: 1, residuo_emulsao: null, teor_ligante: null };
    expect(calcExtracaoLigante(ext)).toEqual({});
  });

  it('arredonda para 2 casas decimais', () => {
    const ext = { amostra_umida: 111.111, amostra_seca: 100, fator_correcao: 1, amostra_com_ligante: null, amostra_sem_ligante: null, residuo_emulsao: null, teor_ligante: null };
    const { umidade } = calcExtracaoLigante(ext);
    expect(String(umidade).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);
  });
});

// ── calcPassante ──────────────────────────────────────────────────────────────
describe('calcPassante', () => {
  const peneiras = [
    { key: 'p_19mm' },
    { key: 'p_12mm' },
    { key: 'p_9mm' },
  ];

  it('calcula passante para primeira peneira', () => {
    const pesos = { p_19mm: 100 };
    expect(calcPassante(peneiras, pesos, 0, 500)).toBe('80.0');
  });

  it('acumula pesos para peneiras subsequentes', () => {
    const pesos = { p_19mm: 100, p_12mm: 150 };
    expect(calcPassante(peneiras, pesos, 1, 500)).toBe('50.0');
  });

  it('retorna "-" quando pesoInicial é 0', () => {
    expect(calcPassante(peneiras, {}, 0, 0)).toBe('-');
  });

  it('retorna "-" quando pesoInicial é null', () => {
    expect(calcPassante(peneiras, {}, 0, null)).toBe('-');
  });

  it('100% passante quando nenhum peso retido', () => {
    expect(calcPassante(peneiras, {}, 0, 200)).toBe('100.0');
  });

  it('0% passante quando tudo retido', () => {
    expect(calcPassante(peneiras, { p_19mm: 200 }, 0, 200)).toBe('0.0');
  });
});

// ── getPedreiraDoProjeto ──────────────────────────────────────────────────────
describe('getPedreiraDoProjeto', () => {
  it('retorna string vazia para projeto null', () => {
    expect(getPedreiraDoProjeto(null)).toBe('');
  });

  it('retorna string vazia para projeto sem agregados', () => {
    expect(getPedreiraDoProjeto({ agregados: [] })).toBe('');
  });

  it('retorna pedreira única', () => {
    expect(getPedreiraDoProjeto({ agregados: [{ pedreira: 'P1' }] })).toBe('P1');
  });

  it('concatena múltiplas pedreiras', () => {
    const proj = { agregados: [{ pedreira: 'P1' }, { pedreira: 'P2' }] };
    expect(getPedreiraDoProjeto(proj)).toBe('P1, P2');
  });

  it('deduplica pedreiras repetidas', () => {
    const proj = { agregados: [{ pedreira: 'P1' }, { pedreira: 'P1' }] };
    expect(getPedreiraDoProjeto(proj)).toBe('P1');
  });

  it('ignora agregados sem pedreira', () => {
    const proj = { agregados: [{ pedreira: '' }, { pedreira: 'P2' }] };
    expect(getPedreiraDoProjeto(proj)).toBe('P2');
  });
});

// ── buildProjectPatch ─────────────────────────────────────────────────────────
describe('buildProjectPatch', () => {
  const projects = [
    { id: 'p1', faixa_granulometrica_id: 'f1', ligante: { tipo: 'CAP 30-45' }, agregados: [{ pedreira: 'Pedrão' }] },
    { id: 'p2', faixa_granulometrica_id: null,  ligante: null,                  agregados: [] },
  ];
  const faixas = [
    { id: 'f1', nome: 'Faixa C' },
  ];

  it('retorna { project_id: "" } para projectId não encontrado', () => {
    expect(buildProjectPatch('inexistente', projects, faixas)).toEqual({ project_id: '' });
  });

  it('popula faixa_especificada quando faixa existe', () => {
    expect(buildProjectPatch('p1', projects, faixas).faixa_especificada).toBe('Faixa C');
  });

  it('usa "Não definida" quando faixa não encontrada', () => {
    expect(buildProjectPatch('p2', projects, faixas).faixa_especificada).toBe('Não definida');
  });

  it('popula tipo_ligante corretamente', () => {
    expect(buildProjectPatch('p1', projects, faixas).tipo_ligante).toBe('CAP 30-45');
  });

  it('tipo_ligante vazio quando projeto não tem ligante', () => {
    expect(buildProjectPatch('p2', projects, faixas).tipo_ligante).toBe('');
  });

  it('popula pedreira a partir dos agregados', () => {
    expect(buildProjectPatch('p1', projects, faixas).pedreira).toBe('Pedrão');
  });

  it('pedreira vazia quando sem agregados', () => {
    expect(buildProjectPatch('p2', projects, faixas).pedreira).toBe('');
  });

  it('retorna project_id correto', () => {
    expect(buildProjectPatch('p1', projects, faixas).project_id).toBe('p1');
  });
});