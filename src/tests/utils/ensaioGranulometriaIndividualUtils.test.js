import { describe, it, expect, vi } from 'vitest';

// Mock sieves para evitar dependência de módulo externo
vi.mock('@/constants/sieves', () => ({
  PENEIRAS_CONFIG: [
    { key: 'p_19mm', label: '3/4"',  abertura: '19.0' },
    { key: 'p_12mm', label: '1/2"',  abertura: '12.5' },
    { key: 'p_9mm',  label: '3/8"',  abertura: '9.5'  },
  ],
  filtrarPeneirasPorFaixa: (_faixa, config) => config,
  PENEIRAS_MAP: {},
}));

import {
  getInitialFormData,
  AGREGADO_VAZIO,
  AGREGADO_CAMPOS_PERMITIDOS,
  GRANULOMETRIA_CAMPOS_PERMITIDOS,
  EQUIVALENTE_CAMPOS_PERMITIDOS,
  calcAgregadoUmidade,
  recalcPassantes,
  calcEquivalente,
  calcMediaEquivalente,
  getPedreirasDoProjeto,
  buildAgregadosDoProjeto,
} from '../../utils/ensaioGranulometriaIndividualUtils';

// ── getInitialFormData ────────────────────────────────────────────────────────
describe('getInitialFormData', () => {
  it('retorna obra_id vazio', () => expect(getInitialFormData().obra_id).toBe(''));
  it('retorna data_ensaio como hoje', () => {
    expect(getInitialFormData().data_ensaio).toBe(new Date().toISOString().split('T')[0]);
  });
  it('retorna status rascunho', () => expect(getInitialFormData().status).toBe('rascunho'));
  it('retorna 1 agregado inicial', () => expect(getInitialFormData().agregados).toHaveLength(1));
  it('retorna 3 medições de equivalente_areia', () =>
    expect(getInitialFormData().equivalente_areia.medicoes).toHaveLength(3));
});

// ── AGREGADO_VAZIO ────────────────────────────────────────────────────────────
describe('AGREGADO_VAZIO', () => {
  it('retorna objeto com campos em branco', () => {
    const a = AGREGADO_VAZIO();
    expect(a.nome).toBe('');
    expect(a.granulometria).toEqual({});
  });
  it('retorna nova referência a cada chamada', () => {
    expect(AGREGADO_VAZIO()).not.toBe(AGREGADO_VAZIO());
  });
});

// ── Constantes de campos permitidos ──────────────────────────────────────────
describe('campos permitidos', () => {
  it('AGREGADO_CAMPOS_PERMITIDOS contém nome, peso_umido, peso_seco', () => {
    expect(AGREGADO_CAMPOS_PERMITIDOS).toContain('nome');
    expect(AGREGADO_CAMPOS_PERMITIDOS).toContain('peso_umido');
    expect(AGREGADO_CAMPOS_PERMITIDOS).toContain('peso_seco');
  });
  it('GRANULOMETRIA_CAMPOS_PERMITIDOS contém retido e passante', () => {
    expect(GRANULOMETRIA_CAMPOS_PERMITIDOS).toContain('retido');
    expect(GRANULOMETRIA_CAMPOS_PERMITIDOS).toContain('passante');
  });
  it('EQUIVALENTE_CAMPOS_PERMITIDOS contém topo_argila e topo_areia', () => {
    expect(EQUIVALENTE_CAMPOS_PERMITIDOS).toContain('topo_argila');
    expect(EQUIVALENTE_CAMPOS_PERMITIDOS).toContain('topo_areia');
  });
});

// ── calcAgregadoUmidade ───────────────────────────────────────────────────────
describe('calcAgregadoUmidade', () => {
  it('calcula água e umidade corretamente', () => {
    const r = calcAgregadoUmidade('110', '100');
    expect(r.agua).toBe('10.00');
    expect(parseFloat(r.umidade)).toBeCloseTo(10, 1);
  });
  it('retorna objeto vazio quando peso_umido ausente', () => {
    expect(calcAgregadoUmidade('', '100')).toEqual({});
  });
  it('retorna objeto vazio quando peso_seco ausente', () => {
    expect(calcAgregadoUmidade('110', '')).toEqual({});
  });
  it('umidade é string formatada com 2 casas', () => {
    const { umidade } = calcAgregadoUmidade('110', '100');
    expect(umidade).toMatch(/^\d+\.\d{2}$/);
  });
  it('umidade vazia quando peso_seco zero', () => {
    const { umidade } = calcAgregadoUmidade('100', '0');
    expect(umidade).toBe('');
  });
});

// ── recalcPassantes ───────────────────────────────────────────────────────────
describe('recalcPassantes', () => {
  it('calcula passante 100% quando sem retido', () => {
    const result = recalcPassantes({}, 500, null);
    Object.values(result).forEach(v => expect(parseFloat(v.passante)).toBeCloseTo(100, 1));
  });

  it('acumula retidos para calcular passante', () => {
    const gran = { p_19mm: { retido: '100' }, p_12mm: { retido: '200' }, p_9mm: { retido: '0' } };
    const result = recalcPassantes(gran, 500, null);
    expect(parseFloat(result.p_19mm.passante)).toBeCloseTo(80, 1);
    expect(parseFloat(result.p_12mm.passante)).toBeCloseTo(40, 1);
    expect(parseFloat(result.p_9mm.passante)).toBeCloseTo(40, 1);
  });

  it('retorna granulometria original quando pesoSeco é 0', () => {
    const gran = { p_19mm: { retido: '100' } };
    expect(recalcPassantes(gran, 0, null)).toBe(gran);
  });

  it('retorna granulometria original quando pesoSeco é null', () => {
    const gran = {};
    expect(recalcPassantes(gran, null, null)).toBe(gran);
  });
});

// ── calcEquivalente ───────────────────────────────────────────────────────────
describe('calcEquivalente', () => {
  it('calcula (h2/h1)*100', () => {
    expect(parseFloat(calcEquivalente('10', '8'))).toBeCloseTo(80, 1);
  });
  it('retorna "" quando h1 é 0', () => {
    expect(calcEquivalente('0', '8')).toBe('');
  });
  it('retorna "" quando h2 é 0', () => {
    expect(calcEquivalente('10', '0')).toBe('');
  });
  it('retorna "" quando ambos ausentes', () => {
    expect(calcEquivalente('', '')).toBe('');
  });
  it('formata com 2 casas decimais', () => {
    expect(calcEquivalente('3', '2')).toMatch(/^\d+\.\d{2}$/);
  });
});

// ── calcMediaEquivalente ──────────────────────────────────────────────────────
describe('calcMediaEquivalente', () => {
  it('calcula média de equivalentes válidos', () => {
    const medicoes = [
      { equivalente: '80.00' },
      { equivalente: '90.00' },
      { equivalente: '' },
    ];
    expect(parseFloat(calcMediaEquivalente(medicoes))).toBeCloseTo(85, 1);
  });
  it('retorna "" para lista vazia', () => {
    expect(calcMediaEquivalente([])).toBe('');
  });
  it('retorna "" quando nenhuma medição tem equivalente válido', () => {
    expect(calcMediaEquivalente([{ equivalente: '' }, { equivalente: 'abc' }])).toBe('');
  });
  it('retorna média de 1 medição válida', () => {
    expect(parseFloat(calcMediaEquivalente([{ equivalente: '75.00' }]))).toBeCloseTo(75, 1);
  });
});

// ── getPedreirasDoProjeto ─────────────────────────────────────────────────────
describe('getPedreirasDoProjeto', () => {
  it('retorna "" para projeto null', () => expect(getPedreirasDoProjeto(null)).toBe(''));
  it('retorna "" para projeto sem agregados', () => expect(getPedreirasDoProjeto({ agregados: [] })).toBe(''));
  it('retorna pedreira única', () => {
    expect(getPedreirasDoProjeto({ agregados: [{ pedreira: 'P1' }] })).toBe('P1');
  });
  it('junta múltiplas pedreiras com " + "', () => {
    expect(getPedreirasDoProjeto({ agregados: [{ pedreira: 'P1' }, { pedreira: 'P2' }] })).toBe('P1 + P2');
  });
  it('deduplica pedreiras repetidas', () => {
    expect(getPedreirasDoProjeto({ agregados: [{ pedreira: 'P1' }, { pedreira: 'P1' }] })).toBe('P1');
  });
  it('ignora pedreiras vazias/null', () => {
    expect(getPedreirasDoProjeto({ agregados: [{ pedreira: '' }, { pedreira: 'P2' }] })).toBe('P2');
  });
});

// ── buildAgregadosDoProjeto ───────────────────────────────────────────────────
describe('buildAgregadosDoProjeto', () => {
  it('cria agregados a partir do projeto', () => {
    const proj = { agregados: [{ nome: 'Brita 1' }, { nome: 'Areia' }] };
    const result = buildAgregadosDoProjeto(proj);
    expect(result[0].nome).toBe('Brita 1');
    expect(result[1].nome).toBe('Areia');
  });

  it('adiciona agregado vazio extra quando total < 4', () => {
    const proj = { agregados: [{ nome: 'A' }, { nome: 'B' }, { nome: 'C' }] };
    expect(buildAgregadosDoProjeto(proj)).toHaveLength(4);
  });

  it('não adiciona extra quando já tem 4', () => {
    const proj = { agregados: [{ nome: 'A' }, { nome: 'B' }, { nome: 'C' }, { nome: 'D' }] };
    expect(buildAgregadosDoProjeto(proj)).toHaveLength(4);
  });

  it('campos de peso iniciam em branco', () => {
    const proj = { agregados: [{ nome: 'Brita' }] };
    const agr = buildAgregadosDoProjeto(proj)[0];
    expect(agr.peso_umido).toBe('');
    expect(agr.peso_seco).toBe('');
    expect(agr.granulometria).toEqual({});
  });

  it('usa string vazia quando nome é undefined', () => {
    const proj = { agregados: [{}] };
    expect(buildAgregadosDoProjeto(proj)[0].nome).toBe('');
  });
});