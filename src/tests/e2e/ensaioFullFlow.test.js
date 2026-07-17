/**
 * tests/e2e/ensaioFullFlow.test.js
 *
 * Teste E2E do fluxo crítico completo em uma única execução ponta-a-ponta:
 *   criar ensaio (rascunho) → salvar progresso → finalizar → aprovar → assinar
 *   → gerar props de relatório
 *
 * Segue o padrão arquitetural de service-layer E2E contra store em memória
 * (browser-E2E com Playwright/Cypress exige binários de navegador + backend
 * autenticado, indisponível neste sandbox/CI — ver criticalFlows.test.js).
 *
 * Diferente dos testes de integração existentes que cobrem cada etapa isoladamente,
 * este teste valida a CADEIA COMPLETA em um único caso, detectando regressões
 * na transição de estado entre criar → salvar → finalizar → aprovar → assinar.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  criarEnsaio,
  atualizarEnsaio,
  aprovarEnsaio,
  reprovarEnsaio,
  assinarEnsaio,
  obterEnsaioById,
} from '@/services/ensaiosService';
import { obterRegistro } from '@/services/recordsService';
import { buildSignatureProps } from '@/utils/relatorioUtils';

// ── Store persistente em memória (mesmo padrão dos testes de integração) ──────
const { store, makeEntityApi, ENTITY_NAMES } = vi.hoisted(() => {
  const store = {};
  const makeEntityApi = (name) => {
    store[name] = {};
    let seq = 0;
    return {
      list: vi.fn(async () => Object.values(store[name])),
      filter: vi.fn(async (filtro = {}) => {
        const entries = Object.entries(filtro);
        return Object.values(store[name]).filter(r =>
          entries.every(([k, v]) => r[k] === v),
        );
      }),
      create: vi.fn(async (data) => {
        seq += 1;
        const id = `${name}-${seq}`;
        const record = {
          id,
          created_date: '2026-07-07T08:00:00.000Z',
          updated_date: '2026-07-07T08:00:00.000Z',
          created_by_id: 'test-user',
          ...data,
        };
        store[name][id] = record;
        return record;
      }),
      update: vi.fn(async (id, data) => {
        const current = store[name][id];
        if (!current) throw new Error(`${name} não encontrado: ${id}`);
        const updated = { ...current, ...data, updated_date: '2026-07-07T09:00:00.000Z' };
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
  const ENTITY_NAMES = ['EnsaioCAUQ'];
  return { store, makeEntityApi, ENTITY_NAMES };
});

vi.mock('@/api/base44Client', () => {
  const entities = {};
  for (const n of ENTITY_NAMES) entities[n] = makeEntityApi(n);
  return { base44: { entities } };
});

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
  // Espelha a backend function real gerenciarAprovacao (mesmo módulo stub
  // compartilhado por todos os @/functions/*): approve NÃO altera was_rejected
  // e limpa rejection_reason com null.
  gerenciarAprovacao: vi.fn(async ({ action, entityName, recordId, rejectionReason }) => {
    const { base44 } = await import('@/api/base44Client');
    const api = base44.entities[entityName];
    const user = action === 'sign' ? cliente : approver;

    if (action === 'delete') {
      await api.delete(recordId);
      return { data: { success: true, data: { id: recordId, deleted: true } } };
    }
    if (action === 'approve') {
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

beforeEach(() => {
  for (const n of ENTITY_NAMES) store[n] = {};
  vi.clearAllMocks();
});

const approver = {
  email: 'gestor@afirmaevias.com',
  full_name: 'Eng. Responsável',
  access_level: 'gestor_contrato',
  crea_number: 'CREA-12345',
};

const cliente = {
  email: 'cliente@construtora.com',
  full_name: 'Eng. Cliente',
  laboratorista_name: 'Eng. Cliente',
  crea_number: 'CREA-67890',
};

describe('E2E: fluxo completo criar → salvar → finalizar → aprovar → assinar → relatório', () => {
  it('percorre todo o ciclo de vida de um ensaio em uma única execução', async () => {
    // ── 1. Criar ensaio como rascunho (laboratorista inicia) ──────────────────
    const rascunho = await criarEnsaio('EnsaioCAUQ', {
      obra_id: 'obra-e2e',
      data_ensaio: '2026-07-07',
      laboratorista_name: 'Lab Teste',
      rodovia: 'BR-116',
      trecho: 'Km 100+200',
      status: 'rascunho',
      approved: null,
      corpos_prova_marshall: [{ numero: 1 }],
    });
    expect(rascunho.id).toBeTruthy();
    expect(rascunho.status).toBe('rascunho');
    expect(rascunho.approved).toBeNull();

    // ── 2. Salvar progresso (update mantém rascunho) ───────────────────────────
    const progresso = await atualizarEnsaio('EnsaioCAUQ', rascunho.id, {
      observacoes: 'Primeira medição registrada',
    });
    expect(progresso.status).toBe('rascunho');
    expect(progresso.observacoes).toBe('Primeira medição registrada');

    // ── 3. Finalizar (status → finalizado, pronto para revisão) ────────────────
    const finalizado = await atualizarEnsaio('EnsaioCAUQ', rascunho.id, {
      status: 'finalizado',
    });
    expect(finalizado.status).toBe('finalizado');
    expect(finalizado.approved).toBeNull();

    // ── 4. Aprovar (gestor aprova o ensaio finalizado) ──────────────────────────
    const aprovado = await aprovarEnsaio(
      { id: rascunho.id, entityType: 'EnsaioCAUQ' },
      approver,
    );
    expect(aprovado.approved).toBe(true);
    expect(aprovado.approved_by).toBe(approver.email);
    expect(aprovado.approved_date).toBeTruthy();
    expect(aprovado.approver_details).toMatchObject({
      name: approver.full_name,
      position: approver.access_level,
      crea_number: approver.crea_number,
    });
    expect(aprovado.status).toBe('finalizado');

    // ── 5. Assinar (cliente engenheiro assina o ensaio aprovado) ────────────────
    const assinado = await assinarEnsaio(
      { id: rascunho.id, entityType: 'EnsaioCAUQ' },
      cliente,
    );
    expect(assinado.approved).toBe(true);
    expect(assinado.client_signature).toMatchObject({
      signed_by: cliente.email,
      engineer_name: cliente.full_name,
      crea_number: cliente.crea_number,
    });
    expect(assinado.client_signature.signed_date).toBeTruthy();

    // ── 6. Persistência: ler de volta e confirmar estado final consolidado ─────
    const persisted = await obterEnsaioById('EnsaioCAUQ', rascunho.id);
    expect(persisted.status).toBe('finalizado');
    expect(persisted.approved).toBe(true);
    expect(persisted.approved_by).toBe(approver.email);
    expect(persisted.client_signature.signed_by).toBe(cliente.email);
    expect(persisted.observacoes).toBe('Primeira medição registrada');

    // ── 7. Geração de relatório: props de assinatura a partir do registro ──────
    const registro = await obterRegistro('EnsaioCAUQ', rascunho.id);
    const props = buildSignatureProps(registro, 'Laboratorista');
    expect(props.labName).toBe('Lab Teste');
    expect(props.labPosition).toBe('Laboratorista');
    expect(props.approverName).toBe(approver.full_name);
    expect(props.approverEmail).toBe(approver.email);
    expect(props.approverCREA).toBe(approver.crea_number);
    expect(props.approverPosition).toBe(approver.access_level);
    expect(props.clientName).toBe(cliente.full_name);
    expect(props.clientEmail).toBe(cliente.email);
    expect(props.clientCREA).toBe(cliente.crea_number);
  });

  it('rejeita ensaio e permite re-finalização resetando campos de aprovação', async () => {
    // 1. Criar e finalizar
    const criado = await criarEnsaio('EnsaioCAUQ', {
      obra_id: 'obra-e2e-2',
      data_ensaio: '2026-07-07',
      status: 'rascunho',
      approved: null,
    });
    await atualizarEnsaio('EnsaioCAUQ', criado.id, { status: 'finalizado' });

    // 2. Rejeitar
    const reprovado = await reprovarEnsaio(
      { id: criado.id, entityType: 'EnsaioCAUQ' },
      approver,
      'dados incompletos',
    );
    expect(reprovado.approved).toBe(false);
    expect(reprovado.was_rejected).toBe(true);
    expect(reprovado.rejection_reason).toBe('dados incompletos');

    // 3. Laboratorista corrige e re-finaliza — reset de aprovação aplicado
    const refinalizado = await atualizarEnsaio('EnsaioCAUQ', criado.id, {
      status: 'finalizado',
      approved: null,
      rejection_reason: null,
      approved_by: null,
      approved_date: null,
    });
    expect(refinalizado.approved).toBeNull();
    expect(refinalizado.status).toBe('finalizado');

    // 4. Reaprovar após correção
    const reaprovado = await aprovarEnsaio(
      { id: criado.id, entityType: 'EnsaioCAUQ' },
      approver,
    );
    expect(reaprovado.approved).toBe(true);
    expect(reaprovado.approved_by).toBe(approver.email);
  });
});