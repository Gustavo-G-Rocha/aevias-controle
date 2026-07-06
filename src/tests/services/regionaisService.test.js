/**
 * tests/services/regionaisService.test.js
 *
 * Testes comportamentais do regionaisService — CRUD de regionais e
 * filtro por gestor. Mocka @/api/base44Client.
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
  });
  return { entities: { Regional: make() } };
});

vi.mock('@/api/base44Client', () => ({ base44: { entities } }));

import {
  listarRegionais,
  listarRegionaisAtivas,
  obterRegionalById,
  criarRegional,
  atualizarRegional,
  deletarRegional,
  obterRegionaisPorGestor,
} from '@/services/regionaisService';

beforeEach(() => {
  vi.clearAllMocks();
  entities.Regional.list.mockResolvedValue([]);
  entities.Regional.filter.mockResolvedValue([]);
  entities.Regional.create.mockResolvedValue({ id: 'new' });
  entities.Regional.update.mockResolvedValue({ ok: true });
  entities.Regional.get.mockResolvedValue({ id: 'r' });
  entities.Regional.delete.mockResolvedValue({ ok: true });
});

describe('regionaisService — operações CRUD', () => {
  it('listarRegionais delega list', async () => {
    entities.Regional.list.mockResolvedValueOnce([{ id: 'r1' }]);
    const result = await listarRegionais();
    expect(result).toEqual([{ id: 'r1' }]);
    expect(entities.Regional.list).toHaveBeenCalledWith();
  });

  it('listarRegionaisAtivas delega filter com status ativa', async () => {
    entities.Regional.filter.mockResolvedValueOnce([{ id: 'r1' }]);
    const result = await listarRegionaisAtivas();
    expect(result).toEqual([{ id: 'r1' }]);
    expect(entities.Regional.filter).toHaveBeenCalledWith({ status: 'ativa' });
  });

  it('obterRegionalById delega get', async () => {
    entities.Regional.get.mockResolvedValueOnce({ id: 'r1' });
    const result = await obterRegionalById('r1');
    expect(result).toEqual({ id: 'r1' });
    expect(entities.Regional.get).toHaveBeenCalledWith('r1');
  });

  it('criarRegional delega create', async () => {
    await criarRegional({ nome: 'Norte' });
    expect(entities.Regional.create).toHaveBeenCalledWith({ nome: 'Norte' });
  });

  it('atualizarRegional delega update', async () => {
    await atualizarRegional('r1', { nome: 'Sul' });
    expect(entities.Regional.update).toHaveBeenCalledWith('r1', { nome: 'Sul' });
  });

  it('deletarRegional delega delete', async () => {
    await deletarRegional('r1');
    expect(entities.Regional.delete).toHaveBeenCalledWith('r1');
  });
});

describe('regionaisService — obterRegionaisPorGestor', () => {
  it('filtra por gestor_contrato_responsavel (case-insensitive)', async () => {
    entities.Regional.list.mockResolvedValueOnce([
      { id: 'r1', gestor_contrato_responsavel: 'GESTOR@x.com' },
      { id: 'r2', gestor_contrato_responsavel: 'other@x.com' },
    ]);
    const result = await obterRegionaisPorGestor('gestor@x.com');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });

  it('filtra por gestores_contrato_responsaveis (array)', async () => {
    entities.Regional.list.mockResolvedValueOnce([
      { id: 'r1', gestores_contrato_responsaveis: ['GESTOR@x.com', 'other@x.com'] },
      { id: 'r2', gestores_contrato_responsaveis: ['nobody@x.com'] },
    ]);
    const result = await obterRegionaisPorGestor('gestor@x.com');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });

  it('filtra por salas_tecnicas_responsaveis (array)', async () => {
    entities.Regional.list.mockResolvedValueOnce([
      { id: 'r1', salas_tecnicas_responsaveis: ['GESTOR@x.com'] },
      { id: 'r2', salas_tecnicas_responsaveis: ['nobody@x.com'] },
    ]);
    const result = await obterRegionaisPorGestor('gestor@x.com');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });

  it('retorna vazio quando gestor não está em nenhuma regional', async () => {
    entities.Regional.list.mockResolvedValueOnce([
      { id: 'r1', gestor_contrato_responsavel: 'other@x.com' },
    ]);
    const result = await obterRegionaisPorGestor('gestor@x.com');
    expect(result).toEqual([]);
  });

  it('retorna vazio quando não há regionais', async () => {
    entities.Regional.list.mockResolvedValueOnce([]);
    const result = await obterRegionaisPorGestor('gestor@x.com');
    expect(result).toEqual([]);
  });

  it('tolera regionais sem campos de gestor', async () => {
    entities.Regional.list.mockResolvedValueOnce([
      { id: 'r1' },
      { id: 'r2', gestor_contrato_responsavel: 'GESTOR@x.com' },
    ]);
    const result = await obterRegionaisPorGestor('gestor@x.com');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r2');
  });
});