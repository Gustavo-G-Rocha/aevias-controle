/**
 * tests/services/diarioObraService.test.js
 *
 * Testes comportamentais do diarioObraService — CRUD de diários de obra
 * e integração com validarESalvarRegistro. Mocka @/api/base44Client.
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
  return { entities: { DiarioObra: make() } };
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

import {
  listarDiarios,
  listarDiariosPorObra,
  obterDiarioById,
  criarDiario,
  atualizarDiario,
  deletarDiario,
} from '@/services/diarioObraService';

beforeEach(() => {
  vi.clearAllMocks();
  entities.DiarioObra.list.mockResolvedValue([]);
  entities.DiarioObra.filter.mockResolvedValue([]);
  entities.DiarioObra.create.mockResolvedValue({ id: 'new' });
  entities.DiarioObra.update.mockResolvedValue({ ok: true });
  entities.DiarioObra.get.mockResolvedValue({ id: 'r' });
  entities.DiarioObra.delete.mockResolvedValue({ ok: true });
});

describe('diarioObraService — operações CRUD', () => {
  it('listarDiarios delega list com sort e limit padrão', async () => {
    entities.DiarioObra.list.mockResolvedValueOnce([{ id: 'd1' }]);
    const result = await listarDiarios();
    expect(result).toEqual([{ id: 'd1' }]);
    expect(entities.DiarioObra.list).toHaveBeenCalledWith('-created_date', 500);
  });

  it('listarDiarios aceita limit custom', async () => {
    await listarDiarios(10);
    expect(entities.DiarioObra.list).toHaveBeenCalledWith('-created_date', 10);
  });

  it('listarDiariosPorObra delega filter com obra_id', async () => {
    entities.DiarioObra.filter.mockResolvedValueOnce([{ id: 'd1' }]);
    const result = await listarDiariosPorObra('O1');
    expect(result).toEqual([{ id: 'd1' }]);
    expect(entities.DiarioObra.filter).toHaveBeenCalledWith({ obra_id: 'O1' }, '-created_date', 500);
  });

  it('obterDiarioById delega get', async () => {
    entities.DiarioObra.get.mockResolvedValueOnce({ id: 'd1' });
    const result = await obterDiarioById('d1');
    expect(result).toEqual({ id: 'd1' });
    expect(entities.DiarioObra.get).toHaveBeenCalledWith('d1');
  });

  it('criarDiario delega create via validarESalvarRegistro', async () => {
    await criarDiario({ x: 1 });
    expect(entities.DiarioObra.create).toHaveBeenCalledWith({ x: 1 });
  });

  it('atualizarDiario delega update via validarESalvarRegistro', async () => {
    await atualizarDiario('id1', { x: 1 });
    expect(entities.DiarioObra.update).toHaveBeenCalledWith('id1', { x: 1 });
  });

  it('deletarDiario delega delete', async () => {
    await deletarDiario('id1');
    expect(entities.DiarioObra.delete).toHaveBeenCalledWith('id1');
  });
});

describe('diarioObraService — tratamento de erro de validação', () => {
  it('criarDiario repassa mensagem de validação do backend', async () => {
    const { validarESalvarRegistro } = await import('@/functions/validarESalvarRegistro');
    validarESalvarRegistro.mockRejectedValueOnce({
      response: { data: { error: 'Obra obrigatória' } },
    });
    await expect(criarDiario({})).rejects.toThrow('Obra obrigatória');
  });

  it('criarDiario exibe mensagem genérica quando não há response.data.error', async () => {
    const { validarESalvarRegistro } = await import('@/functions/validarESalvarRegistro');
    validarESalvarRegistro.mockRejectedValueOnce(new Error('network'));
    await expect(criarDiario({})).rejects.toThrow('Falha ao criar diário');
  });

  it('atualizarDiario repassa mensagem de validação do backend', async () => {
    const { validarESalvarRegistro } = await import('@/functions/validarESalvarRegistro');
    validarESalvarRegistro.mockRejectedValueOnce({
      response: { data: { error: 'Status inválido' } },
    });
    await expect(atualizarDiario('id1', {})).rejects.toThrow('Status inválido');
  });

  it('atualizarDiario exibe mensagem genérica quando não há response.data.error', async () => {
    const { validarESalvarRegistro } = await import('@/functions/validarESalvarRegistro');
    validarESalvarRegistro.mockRejectedValueOnce(new Error('network'));
    await expect(atualizarDiario('id1', {})).rejects.toThrow('Falha ao atualizar diário');
  });
});