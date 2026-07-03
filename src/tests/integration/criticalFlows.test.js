/**
 * Fluxos críticos de negócio (T6 — cobertura E2E de fluxo).
 *
 * Browser-E2E (Playwright/Cypress) exige binários de navegador + app autenticado
 * contra um backend descartável — indisponível neste sandbox/CI. Estes testes
 * exercitam os mesmos fluxos críticos (aprovação, assinatura, geração de
 * relatório) ponta-a-ponta na camada de serviços/utils, contra um store em
 * memória, de forma determinística e executável no gate `test:run`.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  criarEnsaio,
  aprovarEnsaio,
  reprovarEnsaio,
  assinarEnsaio,
  obterEnsaioById,
} from '@/services/ensaiosService';
import { obterRegistro } from '@/services/recordsService';
import {
  buildSignatureProps,
  formatDate,
  formatDateBrasilia,
} from '@/utils/relatorioUtils';

// ── Store persistente em memória (compartilhado entre mock e testes) ──────────
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
      read: vi.fn(async (id) => {
        const r = store[name][id];
        if (!r) throw new Error(`${name} não encontrado: ${id}`);
        return r;
      }),
      delete: vi.fn(async (id) => { delete store[name][id]; return { ok: true }; }),
      schema: vi.fn(async () => ({})),
    };
  };
  const ENTITY_NAMES = ['EnsaioCAUQ', 'EnsaioMRAF', 'ChecklistUsina', 'DiarioObra'];
  return { store, makeEntityApi, ENTITY_NAMES };
});

vi.mock('@/api/base44Client', () => {
  const entities = {};
  for (const n of ENTITY_NAMES) entities[n] = makeEntityApi(n);
  return { base44: { entities } };
});

beforeEach(() => {
  for (const n of ENTITY_NAMES) store[n] = {};
  vi.clearAllMocks();
});

const approver = {
  email: 'gestor@afirmaevias.com',
  full_name: 'Eng. Responsável',
  access_level: 'gestor_contrato',
  crea_number: '12345',
};

const cliente = {
  email: 'cliente@construtora.com',
  full_name: 'Eng. Cliente',
  laboratorista_name: 'Eng. Cliente',
  crea_number: '67890',
};

// ── Fluxo 1: Aprovação de ensaio ──────────────────────────────────────────────
describe('Fluxo crítico: aprovação de ensaio', () => {
  it('aprova ensaio finalizado e persiste approved + approver_details + datas', async () => {
    const criado = await criarEnsaio('EnsaioCAUQ', {
      obra_id: 'o1',
      status: 'finalizado',
      corpos_prova_marshall: [{ numero: 1 }],
    });

    const aprovado = await aprovarEnsaio(criado, approver);

    expect(aprovado.approved).toBe(true);
    expect(aprovado.approved_by).toBe(approver.email);
    expect(aprovado.approver_details).toMatchObject({
      name: approver.full_name,
      position: approver.access_level,
      crea_number: approver.crea_number,
    });
    expect(aprovado.approved_date).toBeTruthy();

    const persisted = await obterEnsaioById('EnsaioCAUQ', criado.id);
    expect(persisted.approved).toBe(true);
    expect(persisted.approver_details.name).toBe(approver.full_name);
  });

  it('reprova ensaio com motivo, marca was_rejected e zera approved', async () => {
    const criado = await criarEnsaio('EnsaioCAUQ', {
      obra_id: 'o1',
      status: 'finalizado',
      corpos_prova_marshall: [{ numero: 1 }],
    });

    const reprovado = await reprovarEnsaio(criado, approver, 'CP fora do limite');

    expect(reprovado.approved).toBe(false);
    expect(reprovado.was_rejected).toBe(true);
    expect(reprovado.rejection_reason).toBe('CP fora do limite');
    expect(reprovado.approver_details.name).toBe(approver.full_name);
  });

  it('reprovação sem id rejeita a operação', async () => {
    await expect(aprovarEnsaio({}, approver)).rejects.toThrow('Ensaio inválido');
    await expect(reprovarEnsaio({}, approver, 'x')).rejects.toThrow('Ensaio inválido');
  });
});

// ── Fluxo 2: Assinatura (client_signature) ────────────────────────────────────
describe('Fluxo crítico: assinatura do cliente', () => {
  it('assina ensaio aprovado e persiste client_signature completa', async () => {
    const criado = await criarEnsaio('EnsaioCAUQ', {
      obra_id: 'o1',
      status: 'finalizado',
      entityType: 'EnsaioCAUQ',
      corpos_prova_marshall: [{ numero: 1 }],
    });
    await aprovarEnsaio(criado, approver);

    const assinado = await assinarEnsaio(
      { id: criado.id, entityType: 'EnsaioCAUQ' },
      cliente,
    );

    expect(assinado.client_signature).toMatchObject({
      signed_by: cliente.email,
      engineer_name: cliente.full_name,
      crea_number: cliente.crea_number,
    });
    expect(assinado.client_signature.signed_date).toBeTruthy();

    const persisted = await obterEnsaioById('EnsaioCAUQ', criado.id);
    expect(persisted.client_signature.signed_by).toBe(cliente.email);
  });

  it('assinatura sem id rejeita a operação', async () => {
    await expect(assinarEnsaio({}, cliente)).rejects.toThrow('Ensaio inválido');
  });
});

// ── Fluxo 3: Geração de relatório (props de assinatura + datas) ───────────────
describe('Fluxo crítico: geração de relatório', () => {
  it('buildSignatureProps monta props de laboratorista + aprovador + cliente a partir do registro', async () => {
    const criado = await criarEnsaio('EnsaioCAUQ', {
      obra_id: 'o1',
      laboratorista_name: 'Lab A',
      status: 'finalizado',
      entityType: 'EnsaioCAUQ',
      corpos_prova_marshall: [{ numero: 1 }],
    });
    const aprovado = await aprovarEnsaio(criado, approver);
    await assinarEnsaio({ id: criado.id, entityType: 'EnsaioCAUQ' }, cliente);

    // Lê o registro consolidado (como faria a página de relatório)
    const registro = await obterRegistro('EnsaioCAUQ', criado.id);
    const props = buildSignatureProps(registro, 'Laboratorista');

    expect(props.labName).toBe('Lab A');
    expect(props.labPosition).toBe('Laboratorista');
    expect(props.approverName).toBe(approver.full_name);
    expect(props.approverEmail).toBe(approver.email);
    expect(props.approverCREA).toBe(approver.crea_number);
    expect(props.approverPosition).toBe(approver.access_level);
    expect(props.clientName).toBe(cliente.full_name);
    expect(props.clientEmail).toBe(cliente.email);
    expect(props.clientCREA).toBe(cliente.crea_number);
  });

  it('buildSignatureProps tolera registro vazio/nulo sem quebrar (fallbacks)', () => {
    const props = buildSignatureProps(null);
    expect(props.labName).toBeUndefined();
    expect(props.labPosition).toBe('Laboratorista');
    expect(props.approverName).toBeUndefined();
    expect(props.clientName).toBeUndefined();
  });

  it('formatDate formata data ISO em dd/mm/aaaa (UTC, sem desvio de fuso)', () => {
    expect(formatDate('2026-07-03T10:00:00.000Z')).toBe('03/07/2026');
    expect(formatDate('')).toBe('N/A');
    expect(formatDate(null)).toBe('N/A');
  });

  it('formatDateBrasilia normaliza string sem fuso e usa America/Sao_Paulo', () => {
    const out = formatDateBrasilia('2026-07-03T10:00:00.000Z');
    expect(out).toMatch(/03\/07\/2026/);
    expect(out).toMatch(/\d{2}:\d{2}:\d{2}/);
    expect(formatDateBrasilia('')).toBe('N/A');
  });

  it('relatório de registro não aprovado não exibe dados de aprovador/cliente', async () => {
    const criado = await criarEnsaio('EnsaioCAUQ', {
      obra_id: 'o1',
      laboratorista_name: 'Lab A',
      entityType: 'EnsaioCAUQ',
      corpos_prova_marshall: [{ numero: 1 }],
    });
    const registro = await obterRegistro('EnsaioCAUQ', criado.id);
    const props = buildSignatureProps(registro);
    expect(props.approverName).toBeUndefined();
    expect(props.clientName).toBeUndefined();
  });
});