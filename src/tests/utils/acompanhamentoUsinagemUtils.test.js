import { describe, it, expect } from 'vitest';
import {
  getInitialFormData,
  AGREGADO_VAZIO,
  CARGA_VAZIA,
  buildProjectFormPatch,
  buildObraFormPatch,
  filtrarProjetosPorObra,
  sanitizeAgregados,
  sanitizeCargas,
  buildDataToSave,
} from '../../utils/acompanhamentoUsinagemUtils';

// ── getInitialFormData ────────────────────────────────────────────────────────
describe('getInitialFormData', () => {
  it('retorna obra_id vazio', () => expect(getInitialFormData().obra_id).toBe(''));
  it('retorna data como hoje', () =>
    expect(getInitialFormData().data).toBe(new Date().toISOString().split('T')[0]));
  it('retorna status rascunho', () => expect(getInitialFormData().status).toBe('rascunho'));
  it('retorna agregados como array vazio', () => expect(getInitialFormData().agregados).toEqual([]));
  it('retorna cargas como array vazio', () => expect(getInitialFormData().cargas).toEqual([]));
});

// ── AGREGADO_VAZIO ────────────────────────────────────────────────────────────
describe('AGREGADO_VAZIO', () => {
  it('gera nome com base no total passado', () =>
    expect(AGREGADO_VAZIO(2).nome).toBe('Agregado 3'));
  it('campos numéricos iniciam como string vazia', () => {
    const a = AGREGADO_VAZIO(0);
    expect(a.composicao).toBe('');
    expect(a.umidade).toBe('');
    expect(a.temperatura_t1).toBe('');
    expect(a.temperatura_t2).toBe('');
  });
});

// ── CARGA_VAZIA ───────────────────────────────────────────────────────────────
describe('CARGA_VAZIA', () => {
  it('retorna objeto com campos em branco', () => {
    const c = CARGA_VAZIA();
    expect(c.placa_caminhao).toBe('');
    expect(c.peso).toBe('');
    expect(c.observacao).toBe('');
  });
  it('retorna nova referência a cada chamada', () =>
    expect(CARGA_VAZIA()).not.toBe(CARGA_VAZIA()));
});

// ── buildObraFormPatch ────────────────────────────────────────────────────────
describe('buildObraFormPatch', () => {
  it('preenche rodovia com primeira rodovia da obra', () => {
    const obra = { id: '1', rodovias: ['BR-101', 'BR-104'], usinas: ['U1'] };
    expect(buildObraFormPatch(obra).rodovia).toBe('BR-101');
  });
  it('preenche usina com primeira usina da obra', () => {
    const obra = { id: '1', rodovias: [], usinas: ['Usina A'] };
    expect(buildObraFormPatch(obra).usina).toBe('Usina A');
  });
  it('reseta project_id para vazio', () => {
    expect(buildObraFormPatch({ id: '1' }).project_id).toBe('');
  });
  it('retorna strings vazias para obra sem rodovias/usinas', () => {
    const patch = buildObraFormPatch({ id: '1' });
    expect(patch.rodovia).toBe('');
    expect(patch.usina).toBe('');
  });
  it('retorna obra_id da obra', () => {
    expect(buildObraFormPatch({ id: 'abc' }).obra_id).toBe('abc');
  });
});

// ── buildProjectFormPatch ─────────────────────────────────────────────────────
describe('buildProjectFormPatch', () => {
  it('preenche numero_projeto com nome do projeto', () => {
    expect(buildProjectFormPatch({ name: 'Proj A' }).numero_projeto).toBe('Proj A');
  });
  it('preenche ligante_nome com tipo do ligante', () => {
    const proj = { ligante: { tipo: 'CAP 50/70' } };
    expect(buildProjectFormPatch(proj).ligante_nome).toBe('CAP 50/70');
  });
  it('preenche pedreira com a pedreira do primeiro agregado', () => {
    const proj = { agregados: [{ pedreira: 'P1', nome: 'Brita' }] };
    expect(buildProjectFormPatch(proj).pedreira).toBe('P1');
  });
  it('cria agregados com nome e percentual do projeto', () => {
    const proj = { agregados: [{ nome: 'Brita 1', percentual_mistura: 60 }] };
    const patch = buildProjectFormPatch(proj);
    expect(patch.agregados[0].nome).toBe('Brita 1');
    expect(patch.agregados[0].composicao).toBe(60);
  });
  it('usa fallback "Agregado N" quando nome ausente', () => {
    const proj = { agregados: [{}] };
    expect(buildProjectFormPatch(proj).agregados[0].nome).toBe('Agregado 1');
  });
  it('retorna agregados vazio para projeto null', () => {
    expect(buildProjectFormPatch(null).agregados).toEqual([]);
  });
});

// ── filtrarProjetosPorObra ────────────────────────────────────────────────────
describe('filtrarProjetosPorObra', () => {
  const obras      = [{ id: 'o1', regional_id: 'r1' }];
  const regionais  = [{ id: 'r1', project_ids: ['p1', 'p2'] }];
  const projects   = [
    { id: 'p1', tipo_projeto: 'CAUQ' },
    { id: 'p2', tipo_projeto: 'MRAF' },
    { id: 'p3', tipo_projeto: 'CAUQ' },
  ];

  it('retorna apenas projetos CAUQ da regional da obra', () => {
    const result = filtrarProjetosPorObra('o1', obras, regionais, projects);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });
  it('retorna [] para obra não encontrada', () => {
    expect(filtrarProjetosPorObra('inexistente', obras, regionais, projects)).toEqual([]);
  });
  it('retorna [] para regional sem project_ids', () => {
    const reg = [{ id: 'r1' }];
    expect(filtrarProjetosPorObra('o1', obras, reg, projects)).toEqual([]);
  });
});

// ── sanitizeAgregados ─────────────────────────────────────────────────────────
describe('sanitizeAgregados', () => {
  it('converte string vazia em null para campos numéricos', () => {
    const result = sanitizeAgregados([{ nome: 'B', composicao: '', umidade: '', temperatura_t1: '', temperatura_t2: '' }]);
    expect(result[0].composicao).toBeNull();
    expect(result[0].umidade).toBeNull();
  });
  it('converte string numérica em float', () => {
    const result = sanitizeAgregados([{ nome: 'B', composicao: '60.5', umidade: '2.3', temperatura_t1: '', temperatura_t2: '' }]);
    expect(result[0].composicao).toBe(60.5);
    expect(result[0].umidade).toBe(2.3);
  });
  it('preserva nome como string', () => {
    const result = sanitizeAgregados([{ nome: 'Brita', composicao: '', umidade: '', temperatura_t1: '', temperatura_t2: '' }]);
    expect(result[0].nome).toBe('Brita');
  });
});

// ── sanitizeCargas ────────────────────────────────────────────────────────────
describe('sanitizeCargas', () => {
  it('converte string vazia em null para peso', () => {
    const result = sanitizeCargas([{ placa_caminhao: 'ABC', hora_saida: '', peso: '', temperatura_1: '', temperatura_2: '', observacao: '' }]);
    expect(result[0].peso).toBeNull();
  });
  it('converte string numérica em float para peso', () => {
    const result = sanitizeCargas([{ placa_caminhao: '', hora_saida: '', peso: '5.5', temperatura_1: '', temperatura_2: '', observacao: '' }]);
    expect(result[0].peso).toBe(5.5);
  });
  it('preserva placa_caminhao como string', () => {
    const result = sanitizeCargas([{ placa_caminhao: 'XYZ-1234', hora_saida: '', peso: '', temperatura_1: '', temperatura_2: '', observacao: '' }]);
    expect(result[0].placa_caminhao).toBe('XYZ-1234');
  });
});

// ── buildDataToSave ───────────────────────────────────────────────────────────
describe('buildDataToSave', () => {
  const base = {
    obra_id: 'o1', data: '2024-01-01',
    temperatura_ligante: '160',
    agregados: [{ nome: 'B', composicao: '60', umidade: '', temperatura_t1: '', temperatura_t2: '' }],
    cargas: [],
    approved: false, was_rejected: false,
  };

  it('define status finalizado quando finalizar=true', () => {
    expect(buildDataToSave(base, true, 'id1').status).toBe('finalizado');
  });
  it('define status rascunho quando finalizar=false', () => {
    expect(buildDataToSave(base, false, null).status).toBe('rascunho');
  });
  it('converte temperatura_ligante para float', () => {
    expect(buildDataToSave(base, false, null).temperatura_ligante).toBe(160);
  });
  it('temperatura_ligante null quando string vazia', () => {
    expect(buildDataToSave({ ...base, temperatura_ligante: '' }, false, null).temperatura_ligante).toBeNull();
  });
  it('marca was_rejected=true ao reeditar reprovado', () => {
    expect(buildDataToSave(base, true, 'id1').was_rejected).toBe(true);
  });
  it('was_rejected mantém false quando não reprovado', () => {
    expect(buildDataToSave({ ...base, approved: null }, false, null).was_rejected).toBe(false);
  });
});