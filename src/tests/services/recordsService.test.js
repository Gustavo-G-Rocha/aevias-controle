/**
 * tests/services/recordsService.test.js
 *
 * Testes comportamentais do recordsService — fonte única de carregamento de
 * registros. Mocka @/api/base44Client e valida normalização, deduplicação,
 * carregamento em lote, dados auxiliares e CRUD genérico.
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
    'DiarioObra', 'EnsaioCAUQ', 'EnsaioMRAF', 'EnsaioDensidade',
    'EnsaioDensidadeInSitu', 'EnsaioTaxaPinturaImprimacao', 'ChecklistUsina',
    'ChecklistAplicacao', 'ChecklistMRAF', 'ChecklistConcretagem',
    'ChecklistTerraplanagem', 'ChecklistReciclagem', 'EnsaioSondagem',
    'EnsaioGranulometriaIndividual', 'AcompanhamentoUsinagem',
    'AcompanhamentoCarga', 'EnsaioManchaPendulo', 'EnsaioVigaBenkelman',
    'EnsaioTaxaMRAF', 'BoletimSondagem', 'BoletimSondagemTrado',
    'EnsaioProctor', 'EnsaioRompimentoConcreto', 'GranuMistura',
    'CertificacaoUsina', 'Obra', 'Project', 'Regional', 'User',
  ];
  const entities = {};
  for (const n of names) entities[n] = make();
  return { entities };
});

vi.mock('@/api/base44Client', () => ({ base44: { entities } }));

import { base44 } from '@/api/base44Client';
import {
  normalizeRecords,
  deduplicateRecords,
  loadAllRecords,
  loadRecordsByObra,
  loadAuxData,
  loadRecordsByEntities,
  loadRecordsGrouped,
  listarRegistros,
  filtrarRegistros,
  atualizarRegistro,
  obterRegistro,
  deletarRegistro,
  criarRegistro,
  ALL_RECORD_ENTITIES,
} from '@/services/recordsService';

beforeEach(() => {
  vi.clearAllMocks();
  for (const n of Object.keys(entities)) {
    entities[n].list.mockResolvedValue([]);
    entities[n].filter.mockResolvedValue([]);
    entities[n].create.mockResolvedValue({ id: 'created' });
    entities[n].update.mockResolvedValue({ ok: true });
    entities[n].get.mockResolvedValue({ id: 'read' });
    entities[n].delete.mockResolvedValue({ ok: true });
    entities[n].schema.mockResolvedValue({});
  }
});

describe('recordsService — pure helpers', () => {
  it('normalizeRecords adiciona entityType a cada registro na ordem', () => {
    const out = normalizeRecords([[{ id: 1 }, { id: 2 }], []], ['A', 'B']);
    expect(out).toEqual([{ id: 1, entityType: 'A' }, { id: 2, entityType: 'A' }]);
  });

  it('normalizeRecords vazio retorna vazio', () => {
    expect(normalizeRecords([], [])).toEqual([]);
  });

  it('deduplicateRecords remove duplicatas por id', () => {
    const r = deduplicateRecords([
      { id: 'x', entityType: 'EnsaioCAUQ' },
      { id: 'x', entityType: 'EnsaioCAUQ' },
    ]);
    expect(r).toHaveLength(1);
  });

  it('deduplicateRecords aplica dedup semântico para DiarioObra', () => {
    const base = { obra_id: 'o', data: 'd', laboratorista_name: 'l', tipo_local: 't', trecho: 'tr' };
    const r = deduplicateRecords([
      { id: 'a', entityType: 'DiarioObra', ...base },
      { id: 'b', entityType: 'DiarioObra', ...base },
    ]);
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe('a');
  });

  it('deduplicateRecords mantém registros distintos sem chaves semânticas', () => {
    const r = deduplicateRecords([
      { id: '1', entityType: 'EnsaioCAUQ' },
      { id: '2', entityType: 'EnsaioCAUQ' },
    ]);
    expect(r).toHaveLength(2);
  });
});

describe('recordsService — loadAllRecords', () => {
  it('modo dashboard usa limite 200 por entidade', async () => {
    await loadAllRecords('dashboard');
    for (const n of ALL_RECORD_ENTITIES) {
      expect(entities[n].list).toHaveBeenCalledWith('-created_date', 200);
    }
  });

  it('modo list (padrão) usa limite 2000 por entidade', async () => {
    await loadAllRecords();
    for (const n of ALL_RECORD_ENTITIES) {
      expect(entities[n].list).toHaveBeenCalledWith('-created_date', 2000);
    }
  });

  it('normaliza com entityType e aplica dedup id + semântico', async () => {
    entities.DiarioObra.list.mockResolvedValueOnce([
      { id: 'd1', obra_id: 'o1', data: '2026-01-01', laboratorista_name: 'A', tipo_local: 'x', trecho: 't' },
      { id: 'd2', obra_id: 'o1', data: '2026-01-01', laboratorista_name: 'A', tipo_local: 'x', trecho: 't' },
    ]);
    entities.EnsaioCAUQ.list.mockResolvedValueOnce([{ id: 'd1', obra_id: 'o2' }]);
    const out = await loadAllRecords();
    expect(out).toHaveLength(1);
    expect(out[0].entityType).toBe('DiarioObra');
  });

  it('tolera entidade cujo list falha (retorna [] sem quebrar o lote)', async () => {
    entities.EnsaioMRAF.list.mockRejectedValueOnce(new Error('boom'));
    const out = await loadAllRecords();
    expect(Array.isArray(out)).toBe(true);
    expect(out.some((r) => r.entityType === 'EnsaioMRAF')).toBe(false);
  });
});

describe('recordsService — loadRecordsByObra', () => {
  it('filtra server-side por obra_id com limite 2000 e normaliza', async () => {
    entities.DiarioObra.filter.mockResolvedValueOnce([{ id: 'd1', obra_id: 'O1' }]);
    const out = await loadRecordsByObra('O1');
    expect(entities.DiarioObra.filter).toHaveBeenCalledWith({ obra_id: 'O1' }, '-created_date', 2000);
    expect(out[0]).toEqual(expect.objectContaining({ id: 'd1', obra_id: 'O1', entityType: 'DiarioObra' }));
  });
});

describe('recordsService — loadAuxData', () => {
  it('carrega obras/projects/regionais; users só quando needsUsers', async () => {
    entities.Obra.list.mockResolvedValueOnce([{ id: 'o1' }]);
    entities.Project.list.mockResolvedValueOnce([{ id: 'p1' }]);
    entities.Regional.list.mockResolvedValueOnce([{ id: 'r1' }]);
    const data = await loadAuxData({ needsRegionais: true, needsUsers: false });
    expect(data.obras).toEqual([{ id: 'o1' }]);
    expect(data.projects).toEqual([{ id: 'p1' }]);
    expect(data.regionais).toEqual([{ id: 'r1' }]);
    expect(data.users).toEqual([]);
    expect(entities.User.list).not.toHaveBeenCalled();
  });

  it('carrega users quando needsUsers=true', async () => {
    entities.User.list.mockResolvedValueOnce([{ id: 'u1' }]);
    const data = await loadAuxData({ needsUsers: true });
    expect(data.users).toEqual([{ id: 'u1' }]);
  });

  it('retorna [] para entidade auxiliar que falha', async () => {
    entities.Regional.list.mockRejectedValueOnce(new Error('x'));
    const data = await loadAuxData({ needsRegionais: true });
    expect(data.regionais).toEqual([]);
    expect(data.obras).toEqual([]);
  });
});

describe('recordsService — subconjuntos e CRUD genérico', () => {
  it('loadRecordsByEntities retorna array plano concatenado (sem entityType)', async () => {
    entities.DiarioObra.list.mockResolvedValueOnce([{ id: 'd1' }]);
    entities.EnsaioCAUQ.list.mockResolvedValueOnce([{ id: 'e1' }]);
    const out = await loadRecordsByEntities(['DiarioObra', 'EnsaioCAUQ']);
    expect(out).toEqual([{ id: 'd1' }, { id: 'e1' }]);
  });

  it('loadRecordsGrouped retorna array de arrays alinhado', async () => {
    entities.DiarioObra.list.mockResolvedValueOnce([{ id: 'd1' }]);
    entities.EnsaioCAUQ.list.mockResolvedValueOnce([{ id: 'e1' }]);
    const out = await loadRecordsGrouped(['DiarioObra', 'EnsaioCAUQ']);
    expect(out).toEqual([[{ id: 'd1' }], [{ id: 'e1' }]]);
  });

  it('listarRegistros delega para base44.list e retorna [] em erro', async () => {
    entities.DiarioObra.list.mockResolvedValueOnce([{ id: 'd1' }]);
    expect(await listarRegistros('DiarioObra', '-updated_date', 10)).toEqual([{ id: 'd1' }]);
    expect(entities.DiarioObra.list).toHaveBeenCalledWith('-updated_date', 10);

    entities.DiarioObra.list.mockRejectedValueOnce(new Error('x'));
    expect(await listarRegistros('DiarioObra')).toEqual([]);
  });

  it('filtrarRegistros delega para base44.filter e retorna [] em erro', async () => {
    entities.DiarioObra.filter.mockResolvedValueOnce([{ id: 'd1' }]);
    expect(await filtrarRegistros('DiarioObra', { obra_id: 'o1' })).toEqual([{ id: 'd1' }]);
    expect(entities.DiarioObra.filter).toHaveBeenCalledWith({ obra_id: 'o1' }, '-created_date', 500);

    entities.DiarioObra.filter.mockRejectedValueOnce(new Error('x'));
    expect(await filtrarRegistros('DiarioObra', { obra_id: 'o1' })).toEqual([]);
  });

  it('criarRegistro delega create', async () => {
    await criarRegistro('DiarioObra', { x: 1 });
    expect(entities.DiarioObra.create).toHaveBeenCalledWith({ x: 1 });
  });

  it('atualizarRegistro delega update', async () => {
    await atualizarRegistro('DiarioObra', 'id1', { x: 1 });
    expect(entities.DiarioObra.update).toHaveBeenCalledWith('id1', { x: 1 });
  });

  it('obterRegistro delega get', async () => {
    await obterRegistro('DiarioObra', 'id1');
    expect(entities.DiarioObra.get).toHaveBeenCalledWith('id1');
  });

  it('deletarRegistro delega delete', async () => {
    await deletarRegistro('DiarioObra', 'id1');
    expect(entities.DiarioObra.delete).toHaveBeenCalledWith('id1');
  });
});