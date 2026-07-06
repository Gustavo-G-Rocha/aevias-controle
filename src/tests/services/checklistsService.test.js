/**
 * tests/services/checklistsService.test.js
 *
 * Testes comportamentais do checklistsService — CRUD de checklists,
 * validação de entidade e integração com validarESalvarRegistro.
 * Mocka @/api/base44Client.
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
    'CertificacaoUsina', 'ChecklistUsina', 'ChecklistAplicacao',
    'ChecklistMRAF', 'ChecklistConcretagem', 'ChecklistTerraplanagem',
    'ChecklistReciclagem',
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

import {
  listarChecklists,
  listarChecklistsPorObra,
  obterChecklistById,
  criarChecklist,
  atualizarChecklist,
  deletarChecklist,
  obterSchemaChecklist,
} from '@/services/checklistsService';

beforeEach(() => {
  vi.clearAllMocks();
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

describe('checklistsService — validação de entidade', () => {
  it('rejeita entidade desconhecida em listarChecklists', async () => {
    await expect(listarChecklists('Foo')).rejects.toThrow('desconhecida');
  });

  it('rejeita entidade desconhecida em listarChecklistsPorObra', async () => {
    await expect(listarChecklistsPorObra('Foo', 'O1')).rejects.toThrow('desconhecida');
  });

  it('rejeita entidade desconhecida em obterChecklistById', async () => {
    await expect(obterChecklistById('Foo', 'id1')).rejects.toThrow('desconhecida');
  });

  it('rejeita entidade desconhecida em criarChecklist', async () => {
    await expect(criarChecklist('Foo', {})).rejects.toThrow('desconhecida');
  });

  it('rejeita entidade desconhecida em atualizarChecklist', async () => {
    await expect(atualizarChecklist('Foo', 'id1', {})).rejects.toThrow('desconhecida');
  });

  it('rejeita entidade desconhecida em deletarChecklist', async () => {
    await expect(deletarChecklist('Foo', 'id1')).rejects.toThrow('desconhecida');
  });

  it('rejeita entidade desconhecida em obterSchemaChecklist', async () => {
    await expect(obterSchemaChecklist('Foo')).rejects.toThrow('desconhecida');
  });
});

describe('checklistsService — operações CRUD', () => {
  it('listarChecklists delega list com sort e limit padrão', async () => {
    entities.ChecklistUsina.list.mockResolvedValueOnce([{ id: 'c1' }]);
    const result = await listarChecklists('ChecklistUsina');
    expect(result).toEqual([{ id: 'c1' }]);
    expect(entities.ChecklistUsina.list).toHaveBeenCalledWith('-created_date', 500);
  });

  it('listarChecklists aceita limit custom', async () => {
    await listarChecklists('ChecklistUsina', 10);
    expect(entities.ChecklistUsina.list).toHaveBeenCalledWith('-created_date', 10);
  });

  it('listarChecklistsPorObra delega filter com obra_id', async () => {
    entities.ChecklistConcretagem.filter.mockResolvedValueOnce([{ id: 'c1' }]);
    const result = await listarChecklistsPorObra('ChecklistConcretagem', 'O1');
    expect(result).toEqual([{ id: 'c1' }]);
    expect(entities.ChecklistConcretagem.filter).toHaveBeenCalledWith({ obra_id: 'O1' }, '-created_date', 500);
  });

  it('obterChecklistById delega get', async () => {
    entities.ChecklistAplicacao.get.mockResolvedValueOnce({ id: 'c1' });
    const result = await obterChecklistById('ChecklistAplicacao', 'c1');
    expect(result).toEqual({ id: 'c1' });
    expect(entities.ChecklistAplicacao.get).toHaveBeenCalledWith('c1');
  });

  it('criarChecklist delega create via validarESalvarRegistro', async () => {
    await criarChecklist('ChecklistMRAF', { x: 1 });
    expect(entities.ChecklistMRAF.create).toHaveBeenCalledWith({ x: 1 });
  });

  it('atualizarChecklist delega update via validarESalvarRegistro', async () => {
    await atualizarChecklist('ChecklistReciclagem', 'id1', { x: 1 });
    expect(entities.ChecklistReciclagem.update).toHaveBeenCalledWith('id1', { x: 1 });
  });

  it('deletarChecklist delega delete', async () => {
    await deletarChecklist('ChecklistTerraplanagem', 'id1');
    expect(entities.ChecklistTerraplanagem.delete).toHaveBeenCalledWith('id1');
  });

  it('obterSchemaChecklist delega schema', async () => {
    await obterSchemaChecklist('CertificacaoUsina');
    expect(entities.CertificacaoUsina.schema).toHaveBeenCalled();
  });
});

describe('checklistsService — tratamento de erro de validação', () => {
  it('criarChecklist repassa mensagem de validação do backend', async () => {
    const { validarESalvarRegistro } = await import('@/functions/validarESalvarRegistro');
    validarESalvarRegistro.mockRejectedValueOnce({
      response: { data: { error: 'Campo obrigatório faltante' } },
    });
    await expect(criarChecklist('ChecklistUsina', {})).rejects.toThrow('Campo obrigatório faltante');
  });

  it('criarChecklist exibe mensagem genérica quando não há response.data.error', async () => {
    const { validarESalvarRegistro } = await import('@/functions/validarESalvarRegistro');
    validarESalvarRegistro.mockRejectedValueOnce(new Error('network'));
    await expect(criarChecklist('ChecklistUsina', {})).rejects.toThrow('Falha ao criar checklist');
  });

  it('atualizarChecklist repassa mensagem de validação do backend', async () => {
    const { validarESalvarRegistro } = await import('@/functions/validarESalvarRegistro');
    validarESalvarRegistro.mockRejectedValueOnce({
      response: { data: { error: 'Status inválido' } },
    });
    await expect(atualizarChecklist('ChecklistUsina', 'id1', {})).rejects.toThrow('Status inválido');
  });

  it('atualizarChecklist exibe mensagem genérica quando não há response.data.error', async () => {
    const { validarESalvarRegistro } = await import('@/functions/validarESalvarRegistro');
    validarESalvarRegistro.mockRejectedValueOnce(new Error('network'));
    await expect(atualizarChecklist('ChecklistUsina', 'id1', {})).rejects.toThrow('Falha ao atualizar checklist');
  });
});