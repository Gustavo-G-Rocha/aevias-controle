/**
 * tests/integration/ensaioLifecycle.test.js
 *
 * Teste de integração do fluxo completo de um registro:
 *   criar (rascunho) → finalizar → aprovar → rejeitar → editar após rejeição
 *
 * Liga os serviços ensaiosService + checklistsService + recordsService sobre um
 * mock persistente de base44.entities (store em memória), validando que o estado
 * transita corretamente entre as etapas e que detectEntityName roteia a entidade
 * correta nas ações de aprovação/reprovação.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Store persistente em memória, compartilhado entre mock e testes ───────────
// Tudo que o vi.mock factory precisa vive no vi.hoisted (o mock é hoisted ao topo).
const { store, makeEntityApi, ENTITY_NAMES } = vi.hoisted(() => {
  const store = {};

  const makeEntityApi = (name) => {
    store[name] = {};
    let seq = 0;
    return {
      list: vi.fn(async (sort = '-created_date', limit = 500) => {
        const rows = Object.values(store[name]);
        return rows.slice(0, limit);
      }),
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
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
          created_by_id: 'test-user',
          ...data,
        };
        store[name][id] = record;
        return record;
      }),
      update: vi.fn(async (id, data) => {
        const current = store[name][id];
        if (!current) throw new Error(`${name} não encontrado: ${id}`);
        const updated = { ...current, ...data, updated_date: new Date().toISOString() };
        store[name][id] = updated;
        return updated;
      }),
      read: vi.fn(async (id) => {
        const r = store[name][id];
        if (!r) throw new Error(`${name} não encontrado: ${id}`);
        return r;
      }),
      delete: vi.fn(async (id) => {
        delete store[name][id];
        return { ok: true };
      }),
      schema: vi.fn(async () => ({})),
    };
  };

  const ENTITY_NAMES = [
    'EnsaioCAUQ', 'EnsaioMRAF', 'EnsaioDensidade', 'EnsaioDensidadeInSitu',
    'EnsaioGranulometriaIndividual', 'EnsaioGranMistura', 'EnsaioManchaPendulo',
    'EnsaioProctor', 'EnsaioRompimentoConcreto', 'EnsaioSondagem',
    'EnsaioTaxaMRAF', 'EnsaioTaxaPinturaImprimacao', 'EnsaioVigaBenkelman',
    'AcompanhamentoCarga', 'AcompanhamentoUsinagem',
    'ChecklistUsina', 'ChecklistConcretagem', 'ChecklistTerraplanagem',
    'ChecklistAplicacao', 'ChecklistMRAF', 'ChecklistReciclagem',
    'CertificacaoUsina', 'DiarioObra', 'Obra', 'Project', 'Regional', 'User',
  ];
  return { store, makeEntityApi, ENTITY_NAMES };
});

vi.mock('@/api/base44Client', () => {
  const entities = {};
  for (const n of ENTITY_NAMES) entities[n] = makeEntityApi(n);
  return { base44: { entities } };
});

import {
  criarEnsaio, atualizarEnsaio, obterEnsaioById, aprovarEnsaio, reprovarEnsaio,
} from '@/services/ensaiosService';
import { criarChecklist, atualizarChecklist } from '@/services/checklistsService';
import { deduplicateRecords, normalizeRecords, obterRegistro } from '@/services/recordsService';

const approver = {
  email: 'sala@afirmaevias.com',
  full_name: 'Sala Técnica',
  access_level: 'sala_tecnica_afirmaevias',
  role: 'user',
  crea_number: 'CREA-999',
};

beforeEach(() => {
  for (const n of ENTITY_NAMES) store[n] = {};
  vi.clearAllMocks();
});

describe('Fluxo de integração: criar → finalizar → aprovar → rejeitar → editar', () => {
  it('percorre o ciclo de vida completo de um ensaio CAUQ', async () => {
    // 1. Criar (rascunho)
    const criado = await criarEnsaio('EnsaioCAUQ', {
      obra_id: 'O1',
      data_ensaio: '2026-07-03',
      status: 'rascunho',
      approved: null,
    });
    expect(criado.id).toBeTruthy();
    expect(criado.status).toBe('rascunho');
    expect(criado.approved).toBeNull();

    // 2. Finalizar (status -> finalizado via atualizarEnsaio)
    const finalizado = await atualizarEnsaio('EnsaioCAUQ', criado.id, { status: 'finalizado' });
    expect(finalizado.status).toBe('finalizado');

    // 3. Aprovar (detectEntityName roteia pelo entityType)
    const aprovado = await aprovarEnsaio(
      { id: criado.id, entityType: 'EnsaioCAUQ' },
      approver,
    );
    expect(aprovado.approved).toBe(true);
    expect(aprovado.approved_by).toBe(approver.email);
    expect(aprovado.approved_date).toBeTruthy();
    expect(aprovado.approver_details).toMatchObject({
      name: 'Sala Técnica',
      position: 'sala_tecnica_afirmaevias',
      crea_number: 'CREA-999',
    });
    // persistido no store
    const persisted = await obterEnsaioById('EnsaioCAUQ', criado.id);
    expect(persisted.approved).toBe(true);
    expect(persisted.status).toBe('finalizado');
  });

  it('rejeita um registro finalizado e permite edição posterior mantendo was_rejected', async () => {
    const criado = await criarEnsaio('EnsaioMRAF', {
      obra_id: 'O2',
      data_ensaio: '2026-07-03',
      status: 'rascunho',
    });
    await atualizarEnsaio('EnsaioMRAF', criado.id, { status: 'finalizado' });

    // 4. Rejeitar
    const reprovado = await reprovarEnsaio(
      { id: criado.id, entityType: 'EnsaioMRAF' },
      approver,
      'teor de ligante fora da faixa',
    );
    expect(reprovado.approved).toBe(false);
    expect(reprovado.was_rejected).toBe(true);
    expect(reprovado.rejection_reason).toBe('teor de ligante fora da faixa');
    expect(reprovado.approved_by).toBe(approver.email);

    // 5. Editar após rejeição — laboratorista corrige e reenvia
    const editado = await atualizarEnsaio('EnsaioMRAF', criado.id, {
      observacoes: 'corrigido após reprovação',
      status: 'finalizado',
    });
    expect(editado.observacoes).toBe('corrigido após reprovação');
    // was_rejected permanece true (não é limpo pelo update)
    expect(editado.was_rejected).toBe(true);
    // approved continua false até nova aprovação
    expect(editado.approved).toBe(false);
  });

  it('aprova registro cuja entidade é inferida por detectEntityName (sem entityType)', async () => {
    // Cria um ChecklistUsina (checklist) e aprova via ensaiosService — detectEntityName
    // deve inferir ChecklistUsina pela presença de rodadas_producao.
    const criado = await criarChecklist('ChecklistUsina', {
      obra_id: 'O3',
      data: '2026-07-03',
      status: 'rascunho',
      rodadas_producao: [{ numero: 1 }],
    });
    await atualizarChecklist('ChecklistUsina', criado.id, { status: 'finalizado' });

    // Sem entityType: detectEntityName usa rodadas_producao -> ChecklistUsina
    const aprovado = await aprovarEnsaio(
      { id: criado.id, rodadas_producao: [{ numero: 1 }] },
      approver,
    );
    expect(aprovado.approved).toBe(true);
    // Lê de volta via recordsService genérico (obterEnsaioId restringe a ensaios)
    const persisted = await obterRegistro('ChecklistUsina', criado.id);
    expect(persisted.approved).toBe(true);
  });
});

describe('Integração: normalização + deduplicação no fim do fluxo', () => {
  it('normaliza registros de múltiplas entidades marcando entityType e deduplica por id', () => {
    // Simula dois registros carregados de entidades distintas, um duplicado por id
    const results = [
      [{ id: 'a', obra_id: 'O1', status: 'finalizado' }],
      [{ id: 'a', obra_id: 'O1', status: 'finalizado' }, { id: 'b', obra_id: 'O2' }],
    ];
    const types = ['EnsaioCAUQ', 'EnsaioMRAF'];
    const normalized = normalizeRecords(results, types);
    expect(normalized).toHaveLength(3);
    expect(normalized.every(r => r.entityType)).toBe(true);

    const dedup = deduplicateRecords(normalized);
    expect(dedup).toHaveLength(2);
    expect(dedup.map(r => r.id).sort()).toEqual(['a', 'b']);
  });
});