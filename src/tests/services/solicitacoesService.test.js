/**
 * tests/services/solicitacoesService.test.js
 *
 * Testes comportamentais do solicitacoesService — CRUD de solicitações
 * de transferência (Obra e Regional). Mocka @/api/base44Client.
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
  return {
    entities: {
      SolicitacaoTransferenciaObra: make(),
      SolicitacaoTransferenciaRegional: make(),
    },
  };
});

vi.mock('@/api/base44Client', () => ({ base44: { entities } }));

import {
  listarSolicitacoesTransferenciaObra,
  listarSolicitacoesTransferenciaRegional,
  listarSolicitacoesTransferenciaObraPorStatus,
  listarSolicitacoesTransferenciaRegionalPorStatus,
  obterSolicitacaoTransferenciaObraById,
  obterSolicitacaoTransferenciaRegionalById,
  criarSolicitacaoTransferenciaObra,
  criarSolicitacaoTransferenciaRegional,
  atualizarSolicitacaoTransferenciaObra,
  atualizarSolicitacaoTransferenciaRegional,
} from '@/services/solicitacoesService';

beforeEach(() => {
  vi.clearAllMocks();
  for (const n of Object.keys(entities)) {
    entities[n].list.mockResolvedValue([]);
    entities[n].filter.mockResolvedValue([]);
    entities[n].create.mockResolvedValue({ id: 'new' });
    entities[n].update.mockResolvedValue({ ok: true });
    entities[n].get.mockResolvedValue({ id: 'r' });
    entities[n].delete.mockResolvedValue({ ok: true });
  }
});

describe('solicitacoesService — Solicitação de Transferência de Obra', () => {
  it('listar delega list', async () => {
    entities.SolicitacaoTransferenciaObra.list.mockResolvedValueOnce([{ id: 's1' }]);
    const result = await listarSolicitacoesTransferenciaObra();
    expect(result).toEqual([{ id: 's1' }]);
    expect(entities.SolicitacaoTransferenciaObra.list).toHaveBeenCalledWith();
  });

  it('listarPorStatus delega filter com status', async () => {
    entities.SolicitacaoTransferenciaObra.filter.mockResolvedValueOnce([{ id: 's1' }]);
    const result = await listarSolicitacoesTransferenciaObraPorStatus('pendente');
    expect(result).toEqual([{ id: 's1' }]);
    expect(entities.SolicitacaoTransferenciaObra.filter).toHaveBeenCalledWith({ status: 'pendente' });
  });

  it('obterById delega get', async () => {
    entities.SolicitacaoTransferenciaObra.get.mockResolvedValueOnce({ id: 's1' });
    const result = await obterSolicitacaoTransferenciaObraById('s1');
    expect(result).toEqual({ id: 's1' });
    expect(entities.SolicitacaoTransferenciaObra.get).toHaveBeenCalledWith('s1');
  });

  it('criar delega create', async () => {
    await criarSolicitacaoTransferenciaObra({ motivo: 'teste' });
    expect(entities.SolicitacaoTransferenciaObra.create).toHaveBeenCalledWith({ motivo: 'teste' });
  });

  it('atualizar delega update', async () => {
    await atualizarSolicitacaoTransferenciaObra('s1', { status: 'aprovada' });
    expect(entities.SolicitacaoTransferenciaObra.update).toHaveBeenCalledWith('s1', { status: 'aprovada' });
  });
});

describe('solicitacoesService — Solicitação de Transferência de Regional', () => {
  it('listar delega list com sort padrão', async () => {
    entities.SolicitacaoTransferenciaRegional.list.mockResolvedValueOnce([{ id: 's1' }]);
    const result = await listarSolicitacoesTransferenciaRegional();
    expect(result).toEqual([{ id: 's1' }]);
    expect(entities.SolicitacaoTransferenciaRegional.list).toHaveBeenCalledWith('-created_date');
  });

  it('listar aceita sort custom', async () => {
    await listarSolicitacoesTransferenciaRegional('-updated_date');
    expect(entities.SolicitacaoTransferenciaRegional.list).toHaveBeenCalledWith('-updated_date');
  });

  it('listarPorStatus delega filter com status', async () => {
    entities.SolicitacaoTransferenciaRegional.filter.mockResolvedValueOnce([{ id: 's1' }]);
    const result = await listarSolicitacoesTransferenciaRegionalPorStatus('pendente');
    expect(result).toEqual([{ id: 's1' }]);
    expect(entities.SolicitacaoTransferenciaRegional.filter).toHaveBeenCalledWith({ status: 'pendente' });
  });

  it('obterById delega get', async () => {
    entities.SolicitacaoTransferenciaRegional.get.mockResolvedValueOnce({ id: 's1' });
    const result = await obterSolicitacaoTransferenciaRegionalById('s1');
    expect(result).toEqual({ id: 's1' });
    expect(entities.SolicitacaoTransferenciaRegional.get).toHaveBeenCalledWith('s1');
  });

  it('criar delega create', async () => {
    await criarSolicitacaoTransferenciaRegional({ motivo: 'teste' });
    expect(entities.SolicitacaoTransferenciaRegional.create).toHaveBeenCalledWith({ motivo: 'teste' });
  });

  it('atualizar delega update', async () => {
    await atualizarSolicitacaoTransferenciaRegional('s1', { status: 'aprovada' });
    expect(entities.SolicitacaoTransferenciaRegional.update).toHaveBeenCalledWith('s1', { status: 'aprovada' });
  });
});