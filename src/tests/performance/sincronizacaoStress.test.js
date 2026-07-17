/**
 * tests/performance/sincronizacaoStress.test.js
 *
 * Stress test de sincronização offline e paginação de dados com
 * latência simulada de 25ms por chamada de API.
 *
 * Objetivo: expor custos ARQUITETURAIS que crescem com o volume:
 * - syncPendingItems processa a fila SEQUENCIALMENTE (1 item por vez)
 *   → tempo total = nº de itens × RTT da rede.
 * - loadAllRecords pagina SEQUENCIALMENTE dentro de cada entidade
 *   (até 20 páginas de 500) → entidades com muitos registros dominam
 *   o tempo de carregamento da tela de listas.
 */
import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest';
import { createBenchSuite, generateRecords } from './benchUtils';

// Benchmarks longos (latência simulada × várias iterações)
vi.setConfig({ testTimeout: 60000 });

const API_LATENCY_MS = 25;

const { entities, delay, queueStore } = vi.hoisted(() => {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const make = () => ({ list: vi.fn(), filter: vi.fn() });
  const names = [
    'DiarioObra', 'EnsaioCAUQ', 'EnsaioMRAF', 'EnsaioDensidade',
    'EnsaioDensidadeInSitu', 'EnsaioTaxaPinturaImprimacao', 'ChecklistUsina',
    'ChecklistAplicacao', 'ChecklistMRAF', 'ChecklistConcretagem',
    'ChecklistTerraplanagem', 'ChecklistReciclagem', 'EnsaioSondagem',
    'EnsaioGranulometriaIndividual', 'AcompanhamentoUsinagem',
    'AcompanhamentoCarga', 'EnsaioManchaPendulo', 'EnsaioVigaBenkelman',
    'EnsaioTaxaMRAF', 'BoletimSondagem', 'BoletimSondagemTrado',
    'EnsaioProctor', 'EnsaioRompimentoConcreto', 'GranuMistura',
    'CertificacaoUsina', 'Obra', 'Project', 'Regional', 'User',
  ];
  const entities = {};
  for (const n of names) entities[n] = make();
  return { entities, delay, queueStore: new Map() };
});

vi.mock('@/api/base44Client', () => ({ base44: { entities } }));

vi.mock('@/functions/validarESalvarRegistro', () => ({
  validarESalvarRegistro: vi.fn(async ({ data, recordId }) => {
    await delay(API_LATENCY_MS);
    return { data: { success: true, data: { id: recordId || 'novo-id', ...data } } };
  }),
}));

// Fila offline em memória (IndexedDB fora do escopo — mede-se rede + orquestração)
vi.mock('@/services/offlineStorageService', () => ({
  addQueueItem: vi.fn(async (item) => { queueStore.set(item.id, item); }),
  getQueueItem: vi.fn(async (id) => queueStore.get(id) || null),
  updateQueueItem: vi.fn(async (id, updates) => {
    const item = queueStore.get(id);
    if (item) queueStore.set(id, { ...item, ...updates });
  }),
  removeQueueItem: vi.fn(async (id) => { queueStore.delete(id); }),
  getQueueItemsByStatus: vi.fn(async (status) =>
    [...queueStore.values()].filter(i => i.status === status)),
  findDuplicateQueueItem: vi.fn(async () => null),
  addConflict: vi.fn(async () => {}),
  removeConflict: vi.fn(async () => {}),
}));

vi.mock('@/services/offlinePhotoService', () => ({
  resolverFotosOffline: vi.fn(async (payload) => payload),
}));

import { syncPendingItems } from '@/services/syncService';
import { createQueueItem } from '@/utils/offlineQueue';
import { loadAllRecords, loadRecordsByObra } from '@/services/recordsService';

const { bench, printReport } = createBenchSuite('RELATÓRIO — STRESS DE SINCRONIZAÇÃO E PAGINAÇÃO (latência 25ms/chamada)');
afterAll(printReport);

function fillQueue(count) {
  queueStore.clear();
  for (let i = 0; i < count; i++) {
    const item = createQueueItem({
      operation: 'create',
      entityType: 'EnsaioCAUQ',
      entityId: null,
      payload: { obra_id: `obra-${i}`, data: '2026-01-01', idx: i },
      clientUpdatedAt: new Date(Date.now() + i).toISOString(),
    });
    queueStore.set(item.id, item);
  }
}

function setupDatasets(recordsPerEntity) {
  for (const n of Object.keys(entities)) {
    const dataset = generateRecords(recordsPerEntity, n);
    entities[n].list.mockImplementation(async (_s, limit = 500) => {
      await delay(API_LATENCY_MS);
      return dataset.slice(0, limit);
    });
    entities[n].filter.mockImplementation(async (query, _s, limit = 500, skip = 0) => {
      await delay(API_LATENCY_MS);
      const src = query?.obra_id ? dataset.filter(r => r.obra_id === query.obra_id) : dataset;
      return src.slice(skip, skip + limit);
    });
  }
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Stress — sincronização da fila offline (sequencial)', () => {
  it('fila com 10 itens pendentes', async () => {
    await bench('SYNC', 'syncPendingItems — 10 itens (10 × RTT sequencial)', 3, 1500, async () => {
      fillQueue(10);
      const r = await syncPendingItems();
      expect(r.synced).toBe(10);
    });
  });

  it('fila com 50 itens pendentes (ex.: um dia de campo sem sinal)', async () => {
    await bench('SYNC', 'syncPendingItems — 50 itens (50 × RTT sequencial)', 3, 4000, async () => {
      fillQueue(50);
      const r = await syncPendingItems();
      expect(r.synced).toBe(50);
    });
  });

  it('confirma crescimento LINEAR do tempo com o tamanho da fila', async () => {
    fillQueue(5);
    const t5start = performance.now();
    await syncPendingItems();
    const t5 = performance.now() - t5start;

    fillQueue(25);
    const t25start = performance.now();
    await syncPendingItems();
    const t25 = performance.now() - t25start;

    // 5× mais itens deve custar ~5× o tempo (sequencial) — se algum dia a
    // fila for paralelizada em lotes, esta razão cai e o teste documenta isso.
    expect(t25 / t5).toBeGreaterThan(2.5);
    expect(t25 / t5).toBeLessThan(12);
  });
});

describe('Stress — paginação de telas com alto volume', () => {
  it('lista completa com 2.000 registros/entidade (4 páginas sequenciais/entidade)', async () => {
    setupDatasets(2000);
    await bench('PAGINAÇÃO', 'loadAllRecords — 2.000/entidade (50.000 no total)', 3, 2000, async () => {
      const r = await loadAllRecords();
      expect(r.length).toBeGreaterThan(40000);
    });
  });

  it('lista completa com 10.000 registros/entidade — TETO de LIST_MAX_PAGES', async () => {
    setupDatasets(10000);
    await bench('PAGINAÇÃO', 'loadAllRecords — 10.000/entidade (teto: 20 pág. seq.)', 2, 8000, async () => {
      const r = await loadAllRecords();
      // 20 páginas × 500 = teto de 10.000 por entidade — registros além
      // desse limite são silenciosamente omitidos da tela de listas.
      expect(r.length).toBeLessThanOrEqual(29 * 10000);
    });
  });

  it('registros de uma obra com 5.000 registros/entidade', async () => {
    setupDatasets(5000);
    await bench('PAGINAÇÃO', 'loadRecordsByObra — 5.000/entidade', 3, 2500, async () => {
      const r = await loadRecordsByObra('obra-1');
      expect(r.length).toBeGreaterThan(0);
    });
  });
});