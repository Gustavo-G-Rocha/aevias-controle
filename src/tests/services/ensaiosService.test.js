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

  it('listarEnsaios delega list com ordenação e limite padrão', async () => {
    entities.EnsaioCAUQ.list.mockResolvedValueOnce([{ id: 'e1' }]);
    expect(await listarEnsaios('EnsaioCAUQ')).toEqual([{ id: 'e1' }]);
    expect(entities.EnsaioCAUQ.list).toHaveBeenCalledWith('-created_date', 500);
  });

  it('listarEnsaios aceita limite custom', async () => {
    await listarEnsaios('EnsaioCAUQ', 10);
    expect(entities.EnsaioCAUQ.list).toHaveBeenCalledWith('-created_date', 10);
  });

  it('listarEnsaiosPorObra delega filter com obra_id', async () => {
    await listarEnsaiosPorObra('EnsaioMRAF', 'O1');
    expect(entities.EnsaioMRAF.filter).toHaveBeenCalledWith({ obra_id: 'O1' }, '-created_date', 500);
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
    expect(entities.EnsaioMRAF.update).toHaveBeenCalledWith('e1', expect.any(Object));
    expect(entities.EnsaioCAUQ.update).not.toHaveBeenCalled();
  });

  it('detecta EnsaioCAUQ por corpos_prova_marshall', async () => {
    await aprovarEnsaio({ id: 'e2', corpos_prova_marshall: [] }, user);
    expect(entities.EnsaioCAUQ.update).toHaveBeenCalledWith('e2', expect.any(Object));
  });

  it('detecta GranuMistura por peneiras', async () => {
    await aprovarEnsaio({ id: 'e3', peneiras: [] }, user);
    expect(entities.GranuMistura.update).toHaveBeenCalledWith('e3', expect.any(Object));
  });

  it('detecta EnsaioDensidade por pesos', async () => {
    await aprovarEnsaio({ id: 'e4', pesos: {} }, user);
    expect(entities.EnsaioDensidade.update).toHaveBeenCalledWith('e4', expect.any(Object));
  });

  it('detecta AcompanhamentoCarga por cargas', async () => {
    await aprovarEnsaio({ id: 'e5', cargas: [] }, user);
    expect(entities.AcompanhamentoCarga.update).toHaveBeenCalledWith('e5', expect.any(Object));
  });

  it('detecta EnsaioCAUQ por extracao_ligante', async () => {
    await aprovarEnsaio({ id: 'e7', extracao_ligante: {} }, user);
    expect(entities.EnsaioCAUQ.update).toHaveBeenCalledWith('e7', expect.any(Object));
  });

  it('detecta EnsaioMRAF por teor_ligante_residual', async () => {
    await aprovarEnsaio({ id: 'e8', teor_ligante_residual: 3 }, user);
    expect(entities.EnsaioMRAF.update).toHaveBeenCalledWith('e8', expect.any(Object));
  });

  it('detecta EnsaioGranulometriaIndividual por agregados + tipo_material', async () => {
    await aprovarEnsaio({ id: 'e9', agregados: [], tipo_material: 'CAUQ' }, user);
    expect(entities.EnsaioGranulometriaIndividual.update).toHaveBeenCalledWith('e9', expect.any(Object));
  });

  it('detecta EnsaioVigaBenkelman por levantamentos + cte_viga', async () => {
    await aprovarEnsaio({ id: 'e10', levantamentos: [], cte_viga: 2.4 }, user);
    expect(entities.EnsaioVigaBenkelman.update).toHaveBeenCalledWith('e10', expect.any(Object));
  });

  it('detecta ChecklistUsina por rodadas_producao', async () => {
    await aprovarEnsaio({ id: 'e11', rodadas_producao: [] }, user);
    expect(entities.ChecklistUsina.update).toHaveBeenCalledWith('e11', expect.any(Object));
  });

  it('detecta ChecklistConcretagem por cargas_concreto', async () => {
    await aprovarEnsaio({ id: 'e12', cargas_concreto: [] }, user);
    expect(entities.ChecklistConcretagem.update).toHaveBeenCalledWith('e12', expect.any(Object));
  });

  it('detecta ChecklistTerraplanagem por acompanhamento_execucao + empreiteira', async () => {
    await aprovarEnsaio({ id: 'e13', acompanhamento_execucao: {}, empreiteira: 'X' }, user);
    expect(entities.ChecklistTerraplanagem.update).toHaveBeenCalledWith('e13', expect.any(Object));
  });

  it('detecta ChecklistAplicacao por controle_aplicacao', async () => {
    await aprovarEnsaio({ id: 'e14', controle_aplicacao: {} }, user);
    expect(entities.ChecklistAplicacao.update).toHaveBeenCalledWith('e14', expect.any(Object));
  });

  it('detecta DiarioObra por atividades_realizadas', async () => {
    await aprovarEnsaio({ id: 'e15', atividades_realizadas: [] }, user);
    expect(entities.DiarioObra.update).toHaveBeenCalledWith('e15', expect.any(Object));
  });

  it('lança erro quando não consegue determinar o tipo', async () => {
    await expect(aprovarEnsaio({ id: 'e6' }, user)).rejects.toThrow('Não foi possível determinar');
  });
});

describe('ensaiosService — assinar/aprovar/reprovar/excluir', () => {
  it('aprovarEnsaio envia payload de aprovação completo', async () => {
    await aprovarEnsaio({ id: 'e1', entityType: 'EnsaioCAUQ' }, user);
    expect(entities.EnsaioCAUQ.update).toHaveBeenCalledWith(
      'e1',
      expect.objectContaining({
        approved: true,
        approved_by: user.email,
        approver_details: expect.objectContaining({
          name: 'Lab Nome',
          position: user.access_level,
          crea_number: '12345',
        }),
      })
    );
  });

  it('reprovarEnsaio envia payload com motivo e was_rejected', async () => {
    await reprovarEnsaio({ id: 'e1', entityType: 'EnsaioCAUQ' }, user, 'fora da tolerância');
    expect(entities.EnsaioCAUQ.update).toHaveBeenCalledWith(
      'e1',
      expect.objectContaining({
        approved: false,
        rejection_reason: 'fora da tolerância',
        was_rejected: true,
        approved_by: user.email,
      })
    );
  });

  it('assinarEnsaio envia client_signature com dados do usuário', async () => {
    await assinarEnsaio({ id: 'e1', entityType: 'EnsaioCAUQ' }, user);
    expect(entities.EnsaioCAUQ.update).toHaveBeenCalledWith(
      'e1',
      expect.objectContaining({
        client_signature: expect.objectContaining({
          signed_by: user.email,
          engineer_name: 'Lab Nome',
          crea_number: '12345',
        }),
      })
    );
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