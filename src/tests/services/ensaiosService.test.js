/**
 * tests/services/ensaiosService.test.js
 *
 * Testes comportamentais do ensaiosService — CRUD de ensaios, validação de
 * entidade, detecção automática de tipo (detectEntityName) e payloads de
 * assinatura/aprovação/reprovação. Mocka @/api/base44Client.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { entities } = vi.hoisted(() => {
  const make = () => ({
    list: vi.fn(),
    filter: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    schema: vi.fn(),
  });
  const names = [
    'EnsaioCAUQ', 'EnsaioMRAF', 'EnsaioDensidade', 'EnsaioDensidadeInSitu',
    'EnsaioGranulometriaIndividual', 'GranuMistura', 'EnsaioManchaPendulo',
    'EnsaioProctor', 'EnsaioRompimentoConcreto', 'EnsaioSondagem',
    'EnsaioTaxaMRAF', 'EnsaioTaxaPinturaImprimacao', 'EnsaioVigaBenkelman',
    'AcompanhamentoCarga', 'AcompanhamentoUsinagem',
    // Entidades de checklist/diário alcançadas pelos fallbacks de detectEntityName
    'ChecklistUsina', 'ChecklistConcretagem', 'ChecklistTerraplanagem',
    'ChecklistAplicacao', 'DiarioObra',
  ];
  const entities = {};
  for (const n of names) entities[n] = make();
  return { entities };
});

vi.mock('@/api/base44Client', () => ({ base44: { entities } }));

vi.mock('@/functions/validarESalvarRegistro', () => ({
  validarESalvarRegistro: vi.fn(async ({ entityName, data, operation, recordId }) => {
    const { base44 } = await import('@/api/base44Client');
    if (operation === 'create') {
      const result = await base44.entities[entityName].create(data);
      return { data: { success: true, data: result } };
    }
    const result = await base44.entities[entityName].update(recordId, data);
    return { data: { success: true, data: result } };
  }),
}));

const { gerenciarAprovacao } = vi.hoisted(() => ({
  gerenciarAprovacao: vi.fn(async (payload) => {
    return { data: { success: true, data: { id: payload.recordId, ...payload } } };
  }),
}));

vi.mock('@/functions/gerenciarAprovacao', () => ({ gerenciarAprovacao }));

import {
  listarEnsaios,
  listarEnsaiosPorObra,
  obterEnsaioById,
  criarEnsaio,
  atualizarEnsaio,
  deletarEnsaio,
  obterSchemaEnsaio,
  assinarEnsaio,
  aprovarEnsaio,
  reprovarEnsaio,
  excluirEnsaio,
} from '@/services/ensaiosService';

const user = {
  email: 'lab@x.com',
  full_name: 'Lab Nome',
  laboratorista_name: 'Lab Nome',
  access_level: 'sala_tecnica_afirmaevias',
  role: 'user',
  crea_number: '12345',
};

beforeEach(() => {
  vi.clearAllMocks();
  gerenciarAprovacao.mockResolvedValue({ data: { success: true, data: { ok: true } } });
  for (const n of Object.keys(entities)) {
    entities[n].list.mockResolvedValue([]);
    entities[n].filter.mockResolvedValue([]);
    entities[n].create.mockResolvedValue({ id: 'new' });
    entities[n].update.mockResolvedValue({ ok: true });
    entities[n].get.mockResolvedValue({ id: 'r' });
    entities[n].delete.mockResolvedValue({ ok: true });
    entities[n].schema.mockResolvedValue({});
  }
});

describe('ensaiosService — CRUD e validação de entidade', () => {
  it('rejeita entidade desconhecida em listarEnsaios', async () => {
    await expect(listarEnsaios('Foo')).rejects.toThrow('desconhecida');
  });

  it('listarEnsaios retorna página 1 com pageSize padrão', async () => {
    entities.EnsaioCAUQ.list.mockResolvedValueOnce([{ id: 'e1' }, { id: 'e2' }]);
    const result = await listarEnsaios('EnsaioCAUQ');
    expect(result.data).toEqual([{ id: 'e1' }, { id: 'e2' }]);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(100);
    expect(result.hasMore).toBe(false);
    expect(entities.EnsaioCAUQ.list).toHaveBeenCalledWith('-created_date', 101, 0);
  });

  it('listarEnsaios aceita page e pageSize custom', async () => {
    entities.EnsaioCAUQ.list.mockResolvedValueOnce([]);
    await listarEnsaios('EnsaioCAUQ', { page: 3, pageSize: 10 });
    expect(entities.EnsaioCAUQ.list).toHaveBeenCalledWith('-created_date', 11, 20);
  });

  it('listarEnsaios sinaliza hasMore quando há mais registros', async () => {
    const records = Array.from({ length: 101 }, (_, i) => ({ id: `e${i}` }));
    entities.EnsaioCAUQ.list.mockResolvedValueOnce(records);
    const result = await listarEnsaios('EnsaioCAUQ', { pageSize: 50 });
    expect(result.data).toHaveLength(50);
    expect(result.hasMore).toBe(true);
  });

  it('listarEnsaiosPorObra delega filter com obra_id e paginação', async () => {
    entities.EnsaioMRAF.filter.mockResolvedValueOnce([{ id: 'e1' }]);
    const result = await listarEnsaiosPorObra('EnsaioMRAF', 'O1');
    expect(result.data).toEqual([{ id: 'e1' }]);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(100);
    expect(entities.EnsaioMRAF.filter).toHaveBeenCalledWith({ obra_id: 'O1' }, '-created_date', 101, 0);
  });

  it('listarEnsaiosPorObra aceita page e pageSize custom', async () => {
    entities.EnsaioMRAF.filter.mockResolvedValueOnce([]);
    await listarEnsaiosPorObra('EnsaioMRAF', 'O1', { page: 2, pageSize: 20 });
    expect(entities.EnsaioMRAF.filter).toHaveBeenCalledWith({ obra_id: 'O1' }, '-created_date', 21, 20);
  });

  it('obterEnsaioById delega get', async () => {
    await obterEnsaioById('EnsaioCAUQ', 'e1');
    expect(entities.EnsaioCAUQ.get).toHaveBeenCalledWith('e1');
  });

  it('criarEnsaio delega create', async () => {
    await criarEnsaio('EnsaioCAUQ', { x: 1 });
    expect(entities.EnsaioCAUQ.create).toHaveBeenCalledWith({ x: 1 });
  });

  it('atualizarEnsaio delega update', async () => {
    await atualizarEnsaio('EnsaioCAUQ', 'e1', { x: 1 });
    expect(entities.EnsaioCAUQ.update).toHaveBeenCalledWith('e1', { x: 1 });
  });

  it('deletarEnsaio delega delete', async () => {
    await deletarEnsaio('EnsaioCAUQ', 'e1');
    expect(entities.EnsaioCAUQ.delete).toHaveBeenCalledWith('e1');
  });

  it('obterSchemaEnsaio delega schema', async () => {
    await obterSchemaEnsaio('EnsaioCAUQ');
    expect(entities.EnsaioCAUQ.schema).toHaveBeenCalled();
  });
});

describe('ensaiosService — detectEntityName', () => {
  it('usa entityType quando presente', async () => {
    await aprovarEnsaio({ id: 'e1', entityType: 'EnsaioMRAF' }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'EnsaioMRAF' }));
  });

  it('usa entityName como fonte secundária quando entityType ausente', async () => {
    await aprovarEnsaio({ id: 'e16', entityName: 'EnsaioDensidadeInSitu' }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'EnsaioDensidadeInSitu' }));
  });

  it('detecta EnsaioCAUQ por corpos_prova_marshall', async () => {
    await aprovarEnsaio({ id: 'e2', corpos_prova_marshall: [] }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'EnsaioCAUQ' }));
  });

  it('detecta GranuMistura por peneiras', async () => {
    await aprovarEnsaio({ id: 'e3', peneiras: [] }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'GranuMistura' }));
  });

  it('detecta EnsaioDensidade por pesos', async () => {
    await aprovarEnsaio({ id: 'e4', pesos: {} }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'EnsaioDensidade' }));
  });

  it('detecta AcompanhamentoCarga por cargas', async () => {
    await aprovarEnsaio({ id: 'e5', cargas: [] }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'AcompanhamentoCarga' }));
  });

  it('detecta EnsaioCAUQ por extracao_ligante', async () => {
    await aprovarEnsaio({ id: 'e7', extracao_ligante: {} }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'EnsaioCAUQ' }));
  });

  it('detecta EnsaioMRAF por teor_ligante_residual', async () => {
    await aprovarEnsaio({ id: 'e8', teor_ligante_residual: 3 }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'EnsaioMRAF' }));
  });

  it('detecta EnsaioGranulometriaIndividual por agregados + tipo_material', async () => {
    await aprovarEnsaio({ id: 'e9', agregados: [], tipo_material: 'CAUQ' }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'EnsaioGranulometriaIndividual' }));
  });

  it('detecta EnsaioVigaBenkelman por levantamentos + cte_viga', async () => {
    await aprovarEnsaio({ id: 'e10', levantamentos: [], cte_viga: 2.4 }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'EnsaioVigaBenkelman' }));
  });

  it('detecta ChecklistUsina por rodadas_producao', async () => {
    await aprovarEnsaio({ id: 'e11', rodadas_producao: [] }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'ChecklistUsina' }));
  });

  it('detecta ChecklistConcretagem por cargas_concreto', async () => {
    await aprovarEnsaio({ id: 'e12', cargas_concreto: [] }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'ChecklistConcretagem' }));
  });

  it('detecta ChecklistTerraplanagem por acompanhamento_execucao + empreiteira', async () => {
    await aprovarEnsaio({ id: 'e13', acompanhamento_execucao: {}, empreiteira: 'X' }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'ChecklistTerraplanagem' }));
  });

  it('detecta ChecklistAplicacao por controle_aplicacao', async () => {
    await aprovarEnsaio({ id: 'e14', controle_aplicacao: {} }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'ChecklistAplicacao' }));
  });

  it('detecta DiarioObra por atividades_realizadas', async () => {
    await aprovarEnsaio({ id: 'e15', atividades_realizadas: [] }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith(expect.objectContaining({ entityName: 'DiarioObra' }));
  });

  it('lança erro quando não consegue determinar o tipo', async () => {
    await expect(aprovarEnsaio({ id: 'e6' }, user)).rejects.toThrow('Não foi possível determinar');
  });
});

describe('ensaiosService — assinar/aprovar/reprovar/excluir', () => {
  it('aprovarEnsaio delega para gerenciarAprovacao com action approve', async () => {
    await aprovarEnsaio({ id: 'e1', entityType: 'EnsaioCAUQ' }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith({
      action: 'approve',
      entityName: 'EnsaioCAUQ',
      recordId: 'e1',
    });
  });

  it('reprovarEnsaio delega para gerenciarAprovacao com action reject e motivo', async () => {
    await reprovarEnsaio({ id: 'e1', entityType: 'EnsaioCAUQ' }, user, 'fora da tolerância');
    expect(gerenciarAprovacao).toHaveBeenCalledWith({
      action: 'reject',
      entityName: 'EnsaioCAUQ',
      recordId: 'e1',
      rejectionReason: 'fora da tolerância',
    });
  });

  it('assinarEnsaio delega para gerenciarAprovacao com action sign', async () => {
    await assinarEnsaio({ id: 'e1', entityType: 'EnsaioCAUQ' }, user);
    expect(gerenciarAprovacao).toHaveBeenCalledWith({
      action: 'sign',
      entityName: 'EnsaioCAUQ',
      recordId: 'e1',
    });
  });

  it('excluirEnsaio deleta via entidade detectada', async () => {
    await excluirEnsaio({ id: 'e1', entityType: 'EnsaioCAUQ' });
    expect(entities.EnsaioCAUQ.delete).toHaveBeenCalledWith('e1');
  });

  it('aprovarEnsaio rejeita ensaio sem id', async () => {
    await expect(aprovarEnsaio({}, user)).rejects.toThrow('Ensaio inválido');
  });

  it('reprovarEnsaio rejeita ensaio nulo', async () => {
    await expect(reprovarEnsaio(null, user, 'motivo')).rejects.toThrow('Ensaio inválido');
  });

  it('excluirEnsaio rejeita ensaio indefinido', async () => {
    await expect(excluirEnsaio(undefined)).rejects.toThrow('Ensaio inválido');
  });

  it('assinarEnsaio rejeita ensaio sem id', async () => {
    await expect(assinarEnsaio({}, user)).rejects.toThrow('Ensaio inválido');
  });
});