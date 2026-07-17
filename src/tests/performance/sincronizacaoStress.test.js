/**
 * tests/performance/sincronizacaoStress.test.js
 *
 * Stress test de sincronização offline e paginação de dados com
 * latência simulada de 25ms por chamada de API.
 *
 * Objetivo: proteger as otimizações arquiteturais contra regressões:
 * - syncPendingItems sincroniza registros distintos em PARALELO (lotes
 *   de 5), mantendo ordem sequencial só entre itens do mesmo registro
 *   → tempo total ≈ (nº de itens / 5) × RTT da rede.
 * - loadAllRecords pagina sequencialmente dentro de cada entidade (até
 *   40 páginas de 500, com parada antecipada) e AVISA o usuário quando
 *   o teto é atingido em vez de omitir registros silenciosamente.
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

describe('Stress — sincronização da fila offline (lotes paralelos de 5)', () => {
  it('fila com 10 itens pendentes', async () => {
    await bench('SYNC', 'syncPendingItems — 10 itens (2 rodadas de 5 em paralelo)', 3, 1000, async () => {
      fillQueue(10);
      const r = await syncPendingItems();
      expect(r.synced).toBe(10);
    });
  });

  it('fila com 50 itens pendentes (ex.: um dia de campo sem sinal)', async () => {
    await bench('SYNC', 'syncPendingItems — 50 itens (10 rodadas de 5 em paralelo)', 3, 2000, async () => {
      fillQueue(50);
      const r = await syncPendingItems();
      expect(r.synced).toBe(50);
    });
  });

  it('paralelização em lotes: 25 itens custam MUITO menos que 25 × RTT', async () => {
    fillQueue(25);
    const start = performance.now();
    const r = await syncPendingItems();
    const elapsed = performance.now() - start;

    expect(r.synced).toBe(25);
    // Sequencial seria ≥ 25 × 25ms = 625ms. Com lotes de 5 em paralelo,
    // esperado ~5 rodadas ≈ 125-250ms. Regressão para sequencial falha aqui.
    expect(elapsed).toBeLessThan(500);
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

  it('lista completa com 10.000 registros/entidade — abaixo do teto de 20.000', async () => {
    setupDatasets(10000);
    await bench('PAGINAÇÃO', 'loadAllRecords — 10.000/entidade (21 pág. seq./entidade)', 2, 8000, async () => {
      const r = await loadAllRecords();
      // Teto agora é 40 páginas × 500 = 20.000/entidade — os 10.000 de cada
      // entidade carregam integralmente (parada antecipada na página vazia).
      expect(r.length).toBeGreaterThanOrEqual(25 * 10000);
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