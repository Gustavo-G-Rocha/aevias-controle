/**
 * tests/services/faixasProjectsSupervisorService.test.js
 * Cobre os services de Faixas Granulométricas, Projects e o carregamento
 * de registros do supervisor via backend function.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { sdk } = vi.hoisted(() => ({
  sdk: {
    entities: {
      FaixaGranulometrica: {
        list: vi.fn(), filter: vi.fn(), get: vi.fn(),
        create: vi.fn(), update: vi.fn(), delete: vi.fn(),
      },
      Project: {
        list: vi.fn(), filter: vi.fn(), get: vi.fn(),
        create: vi.fn(), update: vi.fn(), delete: vi.fn(), schema: vi.fn(),
      },
    },
  },
}));

vi.mock('@/api/base44Client', () => ({ base44: sdk }));
vi.mock('@/functions/carregarRegistrosSupervisor', () => ({
  carregarRegistrosSupervisor: vi.fn(),
}));

import * as faixas from '@/services/faixasService';
import * as projects from '@/services/projectsService';
import { carregarRegistrosSupervisorService } from '@/services/supervisorRecordsService';
import { carregarRegistrosSupervisor } from '@/functions/carregarRegistrosSupervisor';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('faixasService', () => {
  it('listarFaixasPorTipo e listarFaixasAtivas usam filtros server-side corretos', async () => {
    sdk.entities.FaixaGranulometrica.filter.mockResolvedValue([]);
    await faixas.listarFaixasPorTipo('CAUQ');
    await faixas.listarFaixasAtivas();
    expect(sdk.entities.FaixaGranulometrica.filter).toHaveBeenNthCalledWith(1, { tipo: 'CAUQ' });
    expect(sdk.entities.FaixaGranulometrica.filter).toHaveBeenNthCalledWith(2, { status: 'ativo' });
  });

  it('criar/atualizar/deletar delegam corretamente', async () => {
    sdk.entities.FaixaGranulometrica.create.mockResolvedValue({ id: 'f1' });
    sdk.entities.FaixaGranulometrica.update.mockResolvedValue({ id: 'f1' });
    sdk.entities.FaixaGranulometrica.delete.mockResolvedValue({});

    await faixas.criarFaixa({ nome: 'Faixa C' });
    await faixas.atualizarFaixa('f1', { status: 'inativo' });
    await faixas.deletarFaixa('f1');

    expect(sdk.entities.FaixaGranulometrica.create).toHaveBeenCalledWith({ nome: 'Faixa C' });
    expect(sdk.entities.FaixaGranulometrica.update).toHaveBeenCalledWith('f1', { status: 'inativo' });
    expect(sdk.entities.FaixaGranulometrica.delete).toHaveBeenCalledWith('f1');
  });

  it('falha na API vira mensagem amigável com causa preservada', async () => {
    const original = new Error('500');
    sdk.entities.FaixaGranulometrica.list.mockRejectedValue(original);
    await expect(faixas.listarFaixas()).rejects.toMatchObject({
      message: 'Falha ao carregar faixas granulométricas',
      cause: original,
    });
  });
});

describe('projectsService', () => {
  it('listarProjectsPorTipo e listarProjectsAtivos usam filtros corretos', async () => {
    sdk.entities.Project.filter.mockResolvedValue([]);
    await projects.listarProjectsPorTipo('CAUQ');
    await projects.listarProjectsAtivos();
    expect(sdk.entities.Project.filter).toHaveBeenNthCalledWith(1, { tipo_projeto: 'CAUQ' });
    expect(sdk.entities.Project.filter).toHaveBeenNthCalledWith(2, { status: 'ativo' });
  });

  it('obterProjectById e obterSchemaProject delegam corretamente', async () => {
    sdk.entities.Project.get.mockResolvedValue({ id: 'p1' });
    sdk.entities.Project.schema.mockResolvedValue({ name: 'Project' });

    expect(await projects.obterProjectById('p1')).toEqual({ id: 'p1' });
    expect(await projects.obterSchemaProject()).toEqual({ name: 'Project' });
    expect(sdk.entities.Project.get).toHaveBeenCalledWith('p1');
  });

  it('falha na API vira mensagem amigável', async () => {
    sdk.entities.Project.list.mockRejectedValue(new Error('boom'));
    await expect(projects.listarProjects()).rejects.toThrow('Falha ao carregar projetos');
  });
});

describe('supervisorRecordsService', () => {
  it('retorna os registros normalizados da backend function', async () => {
    carregarRegistrosSupervisor.mockResolvedValue({
      data: { records: [{ id: 'e1', entityType: 'EnsaioCAUQ' }] },
    });

    const r = await carregarRegistrosSupervisorService();

    expect(carregarRegistrosSupervisor).toHaveBeenCalledWith({});
    expect(r).toEqual([{ id: 'e1', entityType: 'EnsaioCAUQ' }]);
  });

  it('retorna lista vazia quando a resposta vem sem records', async () => {
    carregarRegistrosSupervisor.mockResolvedValue({ data: {} });
    expect(await carregarRegistrosSupervisorService()).toEqual([]);

    carregarRegistrosSupervisor.mockResolvedValue({});
    expect(await carregarRegistrosSupervisorService()).toEqual([]);
  });

  it('propaga erros da backend function (sem engolir)', async () => {
    carregarRegistrosSupervisor.mockRejectedValue(new Error('403'));
    await expect(carregarRegistrosSupervisorService()).rejects.toThrow('403');
  });
});