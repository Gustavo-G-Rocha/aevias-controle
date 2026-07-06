/**
 * tests/services/obrasService.test.js
 *
 * Testes comportamentais do obrasService — CRUD de obras e filtros
 * por regional e status. Mocka @/api/base44Client.
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
  return { entities: { Obra: make() } };
});

vi.mock('@/api/base44Client', () => ({ base44: { entities } }));

import {
  listarObrasRecentes,
  listarObrasPorRegional,
  listarObrasAtivas,
  obterObraById,
  criarObra,
  atualizarObra,
  deletarObra,
} from '@/services/obrasService';

beforeEach(() => {
  vi.clearAllMocks();
  entities.Obra.list.mockResolvedValue([]);
  entities.Obra.filter.mockResolvedValue([]);
  entities.Obra.create.mockResolvedValue({ id: 'new' });
  entities.Obra.update.mockResolvedValue({ ok: true });
  entities.Obra.get.mockResolvedValue({ id: 'r' });
  entities.Obra.delete.mockResolvedValue({ ok: true });
});

describe('obrasService — operações CRUD', () => {
  it('listarObrasRecentes delega list com sort e limit padrão', async () => {
    entities.Obra.list.mockResolvedValueOnce([{ id: 'o1' }]);
    const result = await listarObrasRecentes();
    expect(result).toEqual([{ id: 'o1' }]);
    expect(entities.Obra.list).toHaveBeenCalledWith('-created_date', 500);
  });

  it('listarObrasRecentes aceita limit custom', async () => {
    await listarObrasRecentes(10);
    expect(entities.Obra.list).toHaveBeenCalledWith('-created_date', 10);
  });

  it('listarObrasPorRegional delega filter com regional_id', async () => {
    entities.Obra.filter.mockResolvedValueOnce([{ id: 'o1' }]);
    const result = await listarObrasPorRegional('r1');
    expect(result).toEqual([{ id: 'o1' }]);
    expect(entities.Obra.filter).toHaveBeenCalledWith({ regional_id: 'r1' }, '-created_date', 500);
  });

  it('listarObrasAtivas delega filter com status em_andamento', async () => {
    entities.Obra.filter.mockResolvedValueOnce([{ id: 'o1' }]);
    const result = await listarObrasAtivas();
    expect(result).toEqual([{ id: 'o1' }]);
    expect(entities.Obra.filter).toHaveBeenCalledWith({ status: 'em_andamento' }, '-created_date', 500);
  });

  it('obterObraById delega get', async () => {
    entities.Obra.get.mockResolvedValueOnce({ id: 'o1' });
    const result = await obterObraById('o1');
    expect(result).toEqual({ id: 'o1' });
    expect(entities.Obra.get).toHaveBeenCalledWith('o1');
  });

  it('criarObra delega create', async () => {
    await criarObra({ nome: 'Obra A' });
    expect(entities.Obra.create).toHaveBeenCalledWith({ nome: 'Obra A' });
  });

  it('atualizarObra delega update', async () => {
    await atualizarObra('o1', { nome: 'Obra B' });
    expect(entities.Obra.update).toHaveBeenCalledWith('o1', { nome: 'Obra B' });
  });

  it('deletarObra delega delete', async () => {
    await deletarObra('o1');
    expect(entities.Obra.delete).toHaveBeenCalledWith('o1');
  });
});