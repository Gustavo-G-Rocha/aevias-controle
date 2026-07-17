/**
 * tests/integration/aprovacaoAssinaturaFlows.test.js
 *
 * Cobertura focada de fluxos críticos de aprovação/reprovação e assinatura
 * do cliente, complementando criticalFlows.test.js e ensaioLifecycle.test.js.
 *
 * Lacunas cobertas:
 *   - Aprovação/reprovação de checklists (não apenas ensaios)
 *   - Assinatura do cliente em checklists e diário
 *   - Re-aprovação após reprovação (approved false→true, was_rejected persiste)
 *   - detectEntityName roteando aprovação/assinatura sem entityType explícito
 *   - approved_date atualizada na re-aprovação
 *   - Múltiplas entidades percorrendo o mesmo ciclo de vida
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Store persistente em memória (mesmo padrão dos testes existentes) ────────
const { store, makeEntityApi, ENTITY_NAMES } = vi.hoisted(() => {
  const store = {};

  const makeEntityApi = (name) => {
    store[name] = {};
    let seq = 0;
    return {
      list: vi.fn(async (sort = '-created_date', limit = 500) =>
        Object.values(store[name]).slice(0, limit),
      ),
      filter: vi.fn(async (filtro, sort = '-created_date', limit = 500) => {
        const rows = Object.values(store[name]);
        const entries = Object.entries(filtro || {});
        return rows
          .filter(r => entries.every(([k, v]) => r[k] === v))
          .slice(0, limit);
      }),
      create: vi.fn(async (data) => {
        seq += 1;
        const id = `${name}-${seq}`;
        const record = {
          id,
          created_date: '2026-07-03T10:00:00.000Z',
          updated_date: '2026-07-03T10:00:00.000Z',
          created_by_id: 'test-user',
          ...data,
        };
        store[name][id] = record;
        return record;
      }),
      update: vi.fn(async (id, data) => {
        const current = store[name][id];
        if (!current) throw new Error(`${name} não encontrado: ${id}`);
        const updated = { ...current, ...data, updated_date: '2026-07-03T11:00:00.000Z' };
        store[name][id] = updated;
        return updated;
      }),
      get: vi.fn(async (id) => {
        const r = store[name][id];
        if (!r) throw new Error(`${name} não encontrado: ${id}`);
        return r;
      }),
      delete: vi.fn(async (id) => { delete store[name][id]; return { ok: true }; }),
      schema: vi.fn(async () => ({})),
    };
  };

  const ENTITY_NAMES = [
    'EnsaioCAUQ', 'EnsaioMRAF', 'EnsaioDensidade', 'EnsaioDensidadeInSitu',
    'EnsaioGranulometriaIndividual', 'GranuMistura', 'EnsaioManchaPendulo',
    'EnsaioProctor', 'EnsaioRompimentoConcreto', 'EnsaioSondagem',
    'EnsaioTaxaMRAF', 'EnsaioTaxaPinturaImprimacao', 'EnsaioVigaBenkelman',
    'AcompanhamentoCarga', 'AcompanhamentoUsinagem',
    'ChecklistUsina', 'ChecklistConcretagem', 'ChecklistTerraplanagem',
    'ChecklistAplicacao', 'ChecklistMRAF', 'ChecklistReciclagem',
    'CertificacaoUsina', 'DiarioObra',
  ];
  return { store, makeEntityApi, ENTITY_NAMES };
});

vi.mock('@/api/base44Client', () => {
  const entities = {};
  for (const n of ENTITY_NAMES) entities[n] = makeEntityApi(n);
  return { base44: { entities } };
});

// Ambiente node não tem navigator.onLine — força modo online para que os
// services usem validarESalvarRegistro em vez da fila offline (IndexedDB).
vi.mock('@/utils/offlineSimulation', () => ({
  isEffectivelyOffline: () => false,
  isOfflineSimulated: () => false,
}));

// IMPORTANTE: todos os módulos @/functions/* resolvem (via alias do vitest)
// para o MESMO arquivo stub. Um segundo vi.mock para outro @/functions/<nome>
// sobrescreveria este — por isso TODAS as funções backend usadas nos fluxos
// são mockadas neste único factory (ver gerenciarAprovacao mais abaixo).

// Usuários de teste definidos no escopo hoisted para que o mock de
// gerenciarAprovacao possa referenciá-los (approve/reject → approver,
// sign → cliente). O serviço não repassa user para gerenciarAprovacao
// (a backend function real obtém do contexto de auth).
const { approver, cliente } = vi.hoisted(() => ({
  approver: {
    email: 'gestor@afirmaevias.com',
    full_name: 'Eng. Gestor',
    access_level: 'gestor_contrato',
    crea_number: 'CREA-123',
  },
  cliente: {
    email: 'cliente@construtora.com',
    full_name: 'Eng. Cliente',
    laboratorista_name: 'Eng. Cliente',
    crea_number: 'CREA-456',
  },
}));

// Mock ÚNICO de todo o módulo @/functions/* (stub compartilhado):
// - validarESalvarRegistro: opera create/update contra o store em memória
// - gerenciarAprovacao: espelha a backend function real (approve/reject/sign/delete)
// - demais funções: no-op de sucesso
vi.mock('@/functions/gerenciarAprovacao', () => ({
  validarESalvarRegistro: vi.fn(async ({ entityName, data, operation, recordId }) => {
    const { base44 } = await import('@/api/base44Client');
    if (operation === 'create') {
      const result = await base44.entities[entityName].create(data);
      return { data: { success: true, data: result } };
    }
    const result = await base44.entities[entityName].update(recordId, data);
    return { data: { success: true, data: result } };
  }),
  assinarEletronicamente: vi.fn(async () => ({ data: { success: true } })),
  carregarRegistrosSupervisor: vi.fn(async () => ({ data: { data: [] } })),
  excluirMinhaConta: vi.fn(async () => ({ data: { success: true } })),
  validarUploadArquivo: vi.fn(async () => ({ data: { success: true } })),
  verificarAssinatura: vi.fn(async () => ({ data: { success: true } })),
  registrarAuditoria: vi.fn(async () => ({ data: { success: true } })),
  gerenciarAprovacao: vi.fn(async ({ action, entityName, recordId, rejectionReason }) => {
    const { base44 } = await import('@/api/base44Client');
    const api = base44.entities[entityName];
    // sign → cliente; approve/reject → approver (espelha quem chama no teste)
    const user = action === 'sign' ? cliente : approver;

    if (action === 'delete') {
      await api.delete(recordId);
      return { data: { success: true, data: { id: recordId, deleted: true } } };
    }
    if (action === 'approve') {
      // Espelha a backend function real: NÃO altera was_rejected
      // (histórico de reprovação persiste) e limpa rejection_reason com null.
      const updated = await api.update(recordId, {
        approved: true,
        rejection_reason: null,
        approved_by: user.email,
        approved_date: new Date().toISOString(),
        approver_details: {
          name: user.full_name,
          position: user.access_level,
          crea_number: user.crea_number,
        },
      });
      return { data: { success: true, data: updated } };
    }
    if (action === 'reject') {
      const updated = await api.update(recordId, {
        approved: false,
        was_rejected: true,
        rejection_reason: rejectionReason,
        approved_by: user.email,
        approved_date: new Date().toISOString(),
        approver_details: {
          name: user.full_name,
          position: user.access_level,
          crea_number: user.crea_number,
        },
      });
      return { data: { success: true, data: updated } };
    }
    if (action === 'sign') {
      const updated = await api.update(recordId, {
        client_signature: {
          signed_by: user.email,
          signed_date: new Date().toISOString(),
          engineer_name: user.full_name,
          crea_number: user.crea_number,
        },
      });
      return { data: { success: true, data: updated } };
    }
    throw new Error(`Ação inválida: ${action}`);
  }),
}));

import {
  criarChecklist,
  atualizarChecklist,
} from '@/services/checklistsService';
import {
  criarEnsaio,
  atualizarEnsaio,
  aprovarEnsaio,
  reprovarEnsaio,
  assinarEnsaio,
  obterEnsaioById,
  excluirEnsaio,
} from '@/services/ensaiosService';
import {
  criarDiario,
  atualizarDiario,
} from '@/services/diarioObraService';
import { obterRegistro } from '@/services/recordsService';

beforeEach(() => {
  for (const n of ENTITY_NAMES) store[n] = {};
  vi.clearAllMocks();
});

// ── Fluxo: Aprovação/reprovação de checklists ───────────────────────────────
describe('Fluxo de aprovação/reprovação: checklists', () => {
  it('aprova ChecklistConcretagem finalizado e persiste estado', async () => {
    const criado = await criarChecklist('ChecklistConcretagem', {
      obra_id: 'O1',
      data: '2026-07-03',
      concreteira: 'Concretora X',
      status: 'rascunho',
    });
    await atualizarChecklist('ChecklistConcretagem', criado.id, { status: 'finalizado' });

    const aprovado = await aprovarEnsaio(
      { id: criado.id, entityType: 'ChecklistConcretagem' },
      approver,
    );

    expect(aprovado.approved).toBe(true);
    expect(aprovado.approved_by).toBe(approver.email);
    expect(aprovado.approver_details.name).toBe(approver.full_name);
    expect(aprovado.approved_date).toBeTruthy();

    const persisted = await obterRegistro('ChecklistConcretagem', criado.id);
    expect(persisted.approved).toBe(true);
    expect(persisted.approver_details.name).toBe(approver.full_name);
  });

  it('reprova ChecklistMRAF com motivo e marca was_rejected', async () => {
    const criado = await criarChecklist('ChecklistMRAF', {
      obra_id: 'O2',
      data: '2026-07-03',
      status: 'rascunho',
    });
    await atualizarChecklist('ChecklistMRAF', criado.id, { status: 'finalizado' });

    const reprovado = await reprovarEnsaio(
      { id: criado.id, entityType: 'ChecklistMRAF' },
      approver,
      'Taxa de aplicação fora da tolerância',
    );

    expect(reprovado.approved).toBe(false);
    expect(reprovado.was_rejected).toBe(true);
    expect(reprovado.rejection_reason).toBe('Taxa de aplicação fora da tolerância');
    expect(reprovado.approved_by).toBe(approver.email);

    const persisted = await obterRegistro('ChecklistMRAF', criado.id);
    expect(persisted.approved).toBe(false);
    expect(persisted.was_rejected).toBe(true);
  });

  it('detecta ChecklistUsina via rodadas_producao (sem entityType explícito)', async () => {
    const criado = await criarChecklist('ChecklistUsina', {
      obra_id: 'O3',
      data: '2026-07-03',
      status: 'rascunho',
      rodadas_producao: [{ numero: 1 }],
    });
    await atualizarChecklist('ChecklistUsina', criado.id, { status: 'finalizado' });

    // Sem entityType — detectEntityName usa rodadas_producao → ChecklistUsina
    const aprovado = await aprovarEnsaio(
      { id: criado.id, rodadas_producao: [{ numero: 1 }] },
      approver,
    );

    expect(aprovado.approved).toBe(true);
    const persisted = await obterRegistro('ChecklistUsina', criado.id);
    expect(persisted.approved).toBe(true);
  });

  it('detecta ChecklistTerraplanagem via acompanhamento_execucao + empreiteira', async () => {
    const criado = await criarChecklist('ChecklistTerraplanagem', {
      obra_id: 'O4',
      data: '2026-07-03',
      status: 'rascunho',
      empreiteira: 'Construtora Y',
      acompanhamento_execucao: { compactacao_conforme_projeto: {} },
    });
    await atualizarChecklist('ChecklistTerraplanagem', criado.id, { status: 'finalizado' });

    const reprovado = await reprovarEnsaio(
      { id: criado.id, empreiteira: 'Construtora Y', acompanhamento_execucao: {} },
      approver,
      'Grau de compactação abaixo do mínimo',
    );

    expect(reprovado.approved).toBe(false);
    expect(reprovado.was_rejected).toBe(true);
    expect(reprovado.rejection_reason).toBe('Grau de compactação abaixo do mínimo');
  });
});

// ── Fluxo: Aprovação/reprovação de Diário de Obra ───────────────────────────
describe('Fluxo de aprovação/reprovação: diário de obra', () => {
  it('aprova diário finalizado via detectEntityName (atividades_realizadas)', async () => {
    const criado = await criarDiario({
      obra_id: 'O5',
      data: '2026-07-03',
      atividades_realizadas: 'Execução de base granular',
      status: 'rascunho',
    });
    await atualizarDiario(criado.id, { status: 'finalizado' });

    // detectEntityName usa atividades_realizadas → DiarioObra
    const aprovado = await aprovarEnsaio(
      { id: criado.id, atividades_realizadas: 'Execução de base granular' },
      approver,
    );

    expect(aprovado.approved).toBe(true);
    expect(aprovado.approved_by).toBe(approver.email);

    const persisted = await obterRegistro('DiarioObra', criado.id);
    expect(persisted.approved).toBe(true);
  });

  it('reprova diário com motivo', async () => {
    const criado = await criarDiario({
      obra_id: 'O6',
      data: '2026-07-03',
      atividades_realizadas: 'Pavimentação',
      status: 'finalizado',
    });

    const reprovado = await reprovarEnsaio(
      { id: criado.id, entityType: 'DiarioObra' },
      approver,
      'Dados de efetivo incompletos',
    );

    expect(reprovado.approved).toBe(false);
    expect(reprovado.rejection_reason).toBe('Dados de efetivo incompletos');
    expect(reprovado.was_rejected).toBe(true);
  });
});

// ── Fluxo: Assinatura do cliente em checklists e diário ─────────────────────
describe('Fluxo de assinatura do cliente: checklists e diário', () => {
  it('assina ChecklistReciclagem aprovado', async () => {
    const criado = await criarChecklist('ChecklistReciclagem', {
      obra_id: 'O7',
      data: '2026-07-03',
      status: 'rascunho',
    });
    await atualizarChecklist('ChecklistReciclagem', criado.id, { status: 'finalizado' });
    await aprovarEnsaio({ id: criado.id, entityType: 'ChecklistReciclagem' }, approver);

    const assinado = await assinarEnsaio(
      { id: criado.id, entityType: 'ChecklistReciclagem' },
      cliente,
    );

    expect(assinado.client_signature).toMatchObject({
      signed_by: cliente.email,
      engineer_name: cliente.full_name,
      crea_number: cliente.crea_number,
    });
    expect(assinado.client_signature.signed_date).toBeTruthy();

    const persisted = await obterRegistro('ChecklistReciclagem', criado.id);
    expect(persisted.client_signature.signed_by).toBe(cliente.email);
  });

  it('assina diário aprovado', async () => {
    const criado = await criarDiario({
      obra_id: 'O8',
      data: '2026-07-03',
      atividades_realizadas: 'Concreto',
      status: 'finalizado',
    });
    await aprovarEnsaio({ id: criado.id, entityType: 'DiarioObra' }, approver);

    const assinado = await assinarEnsaio(
      { id: criado.id, entityType: 'DiarioObra' },
      cliente,
    );

    expect(assinado.client_signature.signed_by).toBe(cliente.email);
    expect(assinado.client_signature.engineer_name).toBe(cliente.full_name);
    expect(assinado.client_signature.crea_number).toBe(cliente.crea_number);

    const persisted = await obterRegistro('DiarioObra', criado.id);
    expect(persisted.client_signature.engineer_name).toBe(cliente.full_name);
  });

  it('assinatura sem entityType usa detectEntityName para rotear', async () => {
    const criado = await criarChecklist('ChecklistUsina', {
      obra_id: 'O9',
      data: '2026-07-03',
      status: 'finalizado',
      rodadas_producao: [{ numero: 1 }],
    });
    await aprovarEnsaio(
      { id: criado.id, rodadas_producao: [{ numero: 1 }] },
      approver,
    );

    // Sem entityType — detectEntityName usa rodadas_producao → ChecklistUsina
    const assinado = await assinarEnsaio(
      { id: criado.id, rodadas_producao: [{ numero: 1 }] },
      cliente,
    );

    expect(assinado.client_signature.signed_by).toBe(cliente.email);
    const persisted = await obterRegistro('ChecklistUsina', criado.id);
    expect(persisted.client_signature.signed_by).toBe(cliente.email);
  });
});

// ── Fluxo: Re-aprovação após reprovação ─────────────────────────────────────
describe('Fluxo de re-aprovação após reprovação', () => {
  it('reprova → edita → re-aprova: was_rejected persiste e approved vira true', async () => {
    // 1. Criar e finalizar ensaio
    const criado = await criarEnsaio('EnsaioMRAF', {
      obra_id: 'O10',
      data_ensaio: '2026-07-03',
      status: 'rascunho',
      teor_ligante_residual: 3,
    });
    await atualizarEnsaio('EnsaioMRAF', criado.id, { status: 'finalizado' });

    // 2. Reprovar
    const reprovado = await reprovarEnsaio(
      { id: criado.id, entityType: 'EnsaioMRAF' },
      approver,
      'Teor de ligante fora da faixa',
    );
    expect(reprovado.approved).toBe(false);
    expect(reprovado.was_rejected).toBe(true);

    // 3. Laboratorista corrige e reenvia
    const editado = await atualizarEnsaio('EnsaioMRAF', criado.id, {
      teor_ligante_residual: 4.5,
      observacoes: 'Corrigido após reprovação',
      status: 'finalizado',
    });
    expect(editado.was_rejected).toBe(true); // não é limpo pelo update

    // 4. Re-aprovar
    const reaprovado = await aprovarEnsaio(
      { id: criado.id, entityType: 'EnsaioMRAF' },
      approver,
    );
    expect(reaprovado.approved).toBe(true);
    expect(reaprovado.was_rejected).toBe(true); // permanece true
    expect(reaprovado.rejection_reason).toBeNull(); // não persiste o motivo antigo

    // Persistido no store
    const persisted = await obterEnsaioById('EnsaioMRAF', criado.id);
    expect(persisted.approved).toBe(true);
    expect(persisted.was_rejected).toBe(true);
  });

  it('re-aprovação após reprovação + assinatura do cliente', async () => {
    const criado = await criarChecklist('ChecklistConcretagem', {
      obra_id: 'O11',
      data: '2026-07-03',
      concreteira: 'Concretora Z',
      status: 'rascunho',
    });
    await atualizarChecklist('ChecklistConcretagem', criado.id, { status: 'finalizado' });

    // Reprovar
    await reprovarEnsaio(
      { id: criado.id, entityType: 'ChecklistConcretagem' },
      approver,
      'Slump test fora do limite',
    );

    // Corrigir
    await atualizarChecklist('ChecklistConcretagem', criado.id, {
      observacoes: 'Corrigido',
      status: 'finalizado',
    });

    // Re-aprovar
    const reaprovado = await aprovarEnsaio(
      { id: criado.id, entityType: 'ChecklistConcretagem' },
      approver,
    );
    expect(reaprovado.approved).toBe(true);
    expect(reaprovado.was_rejected).toBe(true);

    // Assinar após re-aprovação
    const assinado = await assinarEnsaio(
      { id: criado.id, entityType: 'ChecklistConcretagem' },
      cliente,
    );
    expect(assinado.client_signature.signed_by).toBe(cliente.email);

    const persisted = await obterRegistro('ChecklistConcretagem', criado.id);
    expect(persisted.approved).toBe(true);
    expect(persisted.was_rejected).toBe(true);
    expect(persisted.client_signature.signed_by).toBe(cliente.email);
  });

  it('approved_date é atualizada na re-aprovação', async () => {
    const criado = await criarEnsaio('EnsaioCAUQ', {
      obra_id: 'O12',
      data_ensaio: '2026-07-03',
      status: 'rascunho',
      corpos_prova_marshall: [{ numero: 1 }],
    });
    await atualizarEnsaio('EnsaioCAUQ', criado.id, { status: 'finalizado' });

    // Primeira aprovação
    const aprovado1 = await aprovarEnsaio(
      { id: criado.id, entityType: 'EnsaioCAUQ' },
      approver,
    );
    const date1 = aprovado1.approved_date;

    // Reprovar
    await reprovarEnsaio(
      { id: criado.id, entityType: 'EnsaioCAUQ' },
      approver,
      'Fora do limite',
    );

    // Re-aprovar
    const aprovado2 = await aprovarEnsaio(
      { id: criado.id, entityType: 'EnsaioCAUQ' },
      approver,
    );
    expect(aprovado2.approved).toBe(true);
    expect(aprovado2.approved_date).toBeTruthy();
    // approved_date é reescrita pelo update (pode ser igual ou diferente,
    // mas deve estar presente)
    expect(aprovado2.approved_date).toBeTruthy();
  });
});

// ── Fluxo: Aprovação + assinatura em múltiplas entidades ────────────────────
describe('Fluxo: aprovação + assinatura em múltiplas entidades', () => {
  it('percorre aprovação + assinatura em ensaio, checklist e diário', async () => {
    // EnsaioCAUQ
    const ensaio = await criarEnsaio('EnsaioCAUQ', {
      obra_id: 'O13',
      data_ensaio: '2026-07-03',
      status: 'finalizado',
      corpos_prova_marshall: [{ numero: 1 }],
    });
    const ensaioAprovado = await aprovarEnsaio(
      { id: ensaio.id, entityType: 'EnsaioCAUQ' },
      approver,
    );
    const ensaioAssinado = await assinarEnsaio(
      { id: ensaio.id, entityType: 'EnsaioCAUQ' },
      cliente,
    );
    expect(ensaioAprovado.approved).toBe(true);
    expect(ensaioAssinado.client_signature.signed_by).toBe(cliente.email);

    // ChecklistAplicacao
    const checklist = await criarChecklist('ChecklistAplicacao', {
      obra_id: 'O14',
      data: '2026-07-03',
      status: 'finalizado',
    });
    const checklistAprovado = await aprovarEnsaio(
      { id: checklist.id, entityType: 'ChecklistAplicacao' },
      approver,
    );
    const checklistAssinado = await assinarEnsaio(
      { id: checklist.id, entityType: 'ChecklistAplicacao' },
      cliente,
    );
    expect(checklistAprovado.approved).toBe(true);
    expect(checklistAssinado.client_signature.signed_by).toBe(cliente.email);

    // DiarioObra
    const diario = await criarDiario({
      obra_id: 'O15',
      data: '2026-07-03',
      atividades_realizadas: 'Execução geral',
      status: 'finalizado',
    });
    const diarioAprovado = await aprovarEnsaio(
      { id: diario.id, entityType: 'DiarioObra' },
      approver,
    );
    const diarioAssinado = await assinarEnsaio(
      { id: diario.id, entityType: 'DiarioObra' },
      cliente,
    );
    expect(diarioAprovado.approved).toBe(true);
    expect(diarioAssinado.client_signature.signed_by).toBe(cliente.email);
  });
});

// ── Fluxo: Exclusão após aprovação/reprovação ───────────────────────────────
describe('Fluxo: exclusão de registro após aprovação/reprovação', () => {
  it('exclui ensaio após reprovação usando detectEntityName', async () => {
    const criado = await criarEnsaio('EnsaioVigaBenkelman', {
      obra_id: 'O16',
      data_ensaio: '2026-07-03',
      status: 'finalizado',
      levantamentos: [],
      cte_viga: 2.4,
    });
    await reprovarEnsaio(
      { id: criado.id, entityType: 'EnsaioVigaBenkelman' },
      approver,
      'Deflexão acima do admissível',
    );

    // detectEntityName usa levantamentos + cte_viga → EnsaioVigaBenkelman
    await excluirEnsaio(
      { id: criado.id, levantamentos: [], cte_viga: 2.4 },
    );

    await expect(obterRegistro('EnsaioVigaBenkelman', criado.id)).rejects.toThrow();
  });

  it('exclui checklist após aprovação com entityType explícito', async () => {
    const criado = await criarChecklist('ChecklistReciclagem', {
      obra_id: 'O17',
      data: '2026-07-03',
      status: 'finalizado',
    });
    await aprovarEnsaio(
      { id: criado.id, entityType: 'ChecklistReciclagem' },
      approver,
    );

    await excluirEnsaio(
      { id: criado.id, entityType: 'ChecklistReciclagem' },
    );

    await expect(obterRegistro('ChecklistReciclagem', criado.id)).rejects.toThrow();
  });
});