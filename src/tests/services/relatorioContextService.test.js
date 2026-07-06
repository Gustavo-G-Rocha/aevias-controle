/**
 * tests/services/relatorioContextService.test.js
 *
 * Testes comportamentais do relatorioContextService — carregamento de
 * contexto (obra, regional, project, faixa, creator user) com tolerância
 * a falhas. Mocka @/api/base44Client.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { entities, auth, users } = vi.hoisted(() => {
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
      Obra: make(),
      Regional: make(),
      Project: make(),
      FaixaGranulometrica: make(),
      User: make(),
    },
    auth: {},
    users: {},
  };
});

vi.mock('@/api/base44Client', () => ({ base44: { entities, auth, users } }));

import {
  carregarObraRegional,
  carregarProject,
  carregarFaixaDoProject,
  carregarCreatorUser,
  carregarContextoRelatorio,
  obterRegistroPorEntidade,
} from '@/services/relatorioContextService';

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

describe('relatorioContextService — carregarObraRegional', () => {
  it('retorna nulls quando obraId é vazio', async () => {
    const result = await carregarObraRegional(null);
    expect(result).toEqual({ obra: null, regional: null });
    expect(entities.Obra.get).not.toHaveBeenCalled();
  });

  it('carrega obra e regional em sequência', async () => {
    entities.Obra.get.mockResolvedValueOnce({ id: 'o1', regional_id: 'r1' });
    entities.Regional.get.mockResolvedValueOnce({ id: 'r1', nome: 'Norte' });
    const result = await carregarObraRegional('o1');
    expect(result.obra).toEqual({ id: 'o1', regional_id: 'r1' });
    expect(result.regional).toEqual({ id: 'r1', nome: 'Norte' });
  });

  it('retorna obra sem regional quando obra não tem regional_id', async () => {
    entities.Obra.get.mockResolvedValueOnce({ id: 'o1' });
    const result = await carregarObraRegional('o1');
    expect(result.obra).toEqual({ id: 'o1' });
    expect(result.regional).toBeNull();
    expect(entities.Regional.get).not.toHaveBeenCalled();
  });

  it('retorna obra mesmo quando regional falha', async () => {
    entities.Obra.get.mockResolvedValueOnce({ id: 'o1', regional_id: 'r1' });
    entities.Regional.get.mockRejectedValueOnce(new Error('boom'));
    const result = await carregarObraRegional('o1');
    expect(result.obra).toEqual({ id: 'o1', regional_id: 'r1' });
    expect(result.regional).toBeNull();
  });

  it('retorna nulls quando obra falha', async () => {
    entities.Obra.get.mockRejectedValueOnce(new Error('boom'));
    const result = await carregarObraRegional('o1');
    expect(result).toEqual({ obra: null, regional: null });
  });
});

describe('relatorioContextService — carregarProject', () => {
  it('retorna null quando projectId é vazio', async () => {
    const result = await carregarProject(null);
    expect(result).toBeNull();
    expect(entities.Project.get).not.toHaveBeenCalled();
  });

  it('carrega projeto pelo id', async () => {
    entities.Project.get.mockResolvedValueOnce({ id: 'p1', nome: 'Projeto A' });
    const result = await carregarProject('p1');
    expect(result).toEqual({ id: 'p1', nome: 'Projeto A' });
  });

  it('retorna null quando project falha', async () => {
    entities.Project.get.mockRejectedValueOnce(new Error('boom'));
    const result = await carregarProject('p1');
    expect(result).toBeNull();
  });
});

describe('relatorioContextService — carregarFaixaDoProject', () => {
  it('retorna null quando project é null', async () => {
    const result = await carregarFaixaDoProject(null);
    expect(result).toBeNull();
    expect(entities.FaixaGranulometrica.get).not.toHaveBeenCalled();
  });

  it('retorna null quando project não tem faixa_granulometrica_id', async () => {
    const result = await carregarFaixaDoProject({ id: 'p1' });
    expect(result).toBeNull();
    expect(entities.FaixaGranulometrica.get).not.toHaveBeenCalled();
  });

  it('carrega faixa pelo faixa_granulometrica_id', async () => {
    entities.FaixaGranulometrica.get.mockResolvedValueOnce({ id: 'f1' });
    const result = await carregarFaixaDoProject({ id: 'p1', faixa_granulometrica_id: 'f1' });
    expect(result).toEqual({ id: 'f1' });
    expect(entities.FaixaGranulometrica.get).toHaveBeenCalledWith('f1');
  });

  it('retorna null quando faixa falha', async () => {
    entities.FaixaGranulometrica.get.mockRejectedValueOnce(new Error('boom'));
    const result = await carregarFaixaDoProject({ id: 'p1', faixa_granulometrica_id: 'f1' });
    expect(result).toBeNull();
  });
});

describe('relatorioContextService — carregarCreatorUser', () => {
  it('retorna null quando email é vazio', async () => {
    const result = await carregarCreatorUser(null);
    expect(result).toBeNull();
    expect(entities.User.filter).not.toHaveBeenCalled();
  });

  it('retorna primeiro usuário do filtro', async () => {
    entities.User.filter.mockResolvedValueOnce([{ id: 'u1', email: 'x@y.com' }]);
    const result = await carregarCreatorUser('x@y.com');
    expect(result).toEqual({ id: 'u1', email: 'x@y.com' });
    expect(entities.User.filter).toHaveBeenCalledWith({ email: 'x@y.com' });
  });

  it('retorna null quando filtro retorna vazio', async () => {
    entities.User.filter.mockResolvedValueOnce([]);
    const result = await carregarCreatorUser('x@y.com');
    expect(result).toBeNull();
  });

  it('retorna null quando filtro falha', async () => {
    entities.User.filter.mockRejectedValueOnce(new Error('boom'));
    const result = await carregarCreatorUser('x@y.com');
    expect(result).toBeNull();
  });
});

describe('relatorioContextService — carregarContextoRelatorio', () => {
  it('retorna nulls quando record é null', async () => {
    const result = await carregarContextoRelatorio(null);
    expect(result).toEqual({ obra: null, regional: null, project: null, creatorUser: null });
  });

  it('carrega obra, regional, project e creatorUser em paralelo', async () => {
    entities.Obra.get.mockResolvedValueOnce({ id: 'o1', regional_id: 'r1' });
    entities.Regional.get.mockResolvedValueOnce({ id: 'r1' });
    entities.Project.get.mockResolvedValueOnce({ id: 'p1' });
    entities.User.filter.mockResolvedValueOnce([{ id: 'u1' }]);

    const result = await carregarContextoRelatorio({
      obra_id: 'o1',
      project_id: 'p1',
      created_by: 'x@y.com',
    });

    expect(result.obra).toEqual({ id: 'o1', regional_id: 'r1' });
    expect(result.regional).toEqual({ id: 'r1' });
    expect(result.project).toEqual({ id: 'p1' });
    expect(result.creatorUser).toEqual({ id: 'u1' });
  });

  it('tolera falhas individuais retornando null', async () => {
    entities.Obra.get.mockRejectedValueOnce(new Error('boom'));
    entities.Project.get.mockRejectedValueOnce(new Error('boom'));
    entities.User.filter.mockRejectedValueOnce(new Error('boom'));

    const result = await carregarContextoRelatorio({
      obra_id: 'o1',
      project_id: 'p1',
      created_by: 'x@y.com',
    });

    expect(result.obra).toBeNull();
    expect(result.regional).toBeNull();
    expect(result.project).toBeNull();
    expect(result.creatorUser).toBeNull();
  });
});

describe('relatorioContextService — obterRegistroPorEntidade', () => {
  it('delega get na entidade informada', async () => {
    entities.Obra.get.mockResolvedValueOnce({ id: 'o1' });
    const result = await obterRegistroPorEntidade('Obra', 'o1');
    expect(result).toEqual({ id: 'o1' });
    expect(entities.Obra.get).toHaveBeenCalledWith('o1');
  });

  it('delega get em Project', async () => {
    entities.Project.get.mockResolvedValueOnce({ id: 'p1' });
    const result = await obterRegistroPorEntidade('Project', 'p1');
    expect(result).toEqual({ id: 'p1' });
    expect(entities.Project.get).toHaveBeenCalledWith('p1');
  });
});