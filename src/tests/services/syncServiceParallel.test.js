/**
 * tests/services/syncServiceParallel.test.js
 * Cobre a sincronização em lotes paralelos da fila offline:
 * - ordem preservada entre itens do MESMO registro
 * - contagem correta de sucesso/falha/conflito em lote misto
 * - erros permanentes (4xx) marcam 'failed' sem retentar
 * - erros transitórios respeitam o máximo de 5 tentativas
 * - retryFailedItems zera tentativas e re-sincroniza
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { queueStore, conflictStore, callLog } = vi.hoisted(() => ({
  queueStore: new Map(),
  conflictStore: [],
  callLog: [],
}));

vi.mock('@/api/base44Client', () => ({ base44: { entities: {} } }));

vi.mock('@/functions/validarESalvarRegistro', () => ({
  validarESalvarRegistro: vi.fn(),
}));

// Implementação padrão de sucesso — reaplicada em cada teste (mockRejectedValue
// de um teste anterior não pode vazar para o seguinte).
const defaultSaveImpl = async ({ recordId, data }) => {
  callLog.push({ recordId: recordId || null, marker: data?.marker ?? null });
  // pequeno delay aleatório para expor problemas de ordenação em paralelo
  await new Promise(r => setTimeout(r, Math.random() * 10));
  return { data: { data: { id: recordId || `novo-${callLog.length}`, ...data } } };
};

vi.mock('@/services/offlineStorageService', () => ({
  addQueueItem: vi.fn(async (item) => { queueStore.set(item.id, item); return item.id; }),
  getQueueItem: vi.fn(async (id) => queueStore.get(id) || null),
  updateQueueItem: vi.fn(async (id, updates) => {
    const item = queueStore.get(id);
    if (item) queueStore.set(id, { ...item, ...updates });
  }),
  removeQueueItem: vi.fn(async (id) => { queueStore.delete(id); }),
  getQueueItemsByStatus: vi.fn(async (status) =>
    [...queueStore.values()].filter(i => i.status === status)),
  findDuplicateQueueItem: vi.fn(async () => null),
  addConflict: vi.fn(async (c) => { conflictStore.push(c); }),
  removeConflict: vi.fn(async () => {}),
}));

vi.mock('@/services/offlinePhotoService', () => ({
  resolverFotosOffline: vi.fn(async (payload) => payload),
}));

import { validarESalvarRegistro } from '@/functions/validarESalvarRegistro';
import { syncPendingItems, retryFailedItems } from '@/services/syncService';
import { createQueueItem } from '@/utils/offlineQueue';

function enqueue({ operation = 'create', entityType = 'EnsaioCAUQ', entityId = null, payload = {}, attempts = 0 }) {
  const item = createQueueItem({
    operation, entityType, entityId, payload,
    clientUpdatedAt: new Date().toISOString(),
  });
  item.attempts = attempts;
  queueStore.set(item.id, item);
  return item;
}

beforeEach(() => {
  vi.clearAllMocks();
  validarESalvarRegistro.mockImplementation(defaultSaveImpl);
  queueStore.clear();
  conflictStore.length = 0;
  callLog.length = 0;
});

describe('syncPendingItems — paralelismo com ordem por registro', () => {
  it('itens do MESMO registro sincronizam em ordem, mesmo com outros em paralelo', async () => {
    // 2 updates do mesmo registro + 8 registros distintos misturados
    enqueue({ operation: 'update', entityId: 'rec-A', payload: { marker: 'A-primeiro' } });
    for (let i = 0; i < 4; i++) enqueue({ payload: { marker: `outro-${i}` } });
    enqueue({ operation: 'update', entityId: 'rec-A', payload: { marker: 'A-segundo' } });
    for (let i = 4; i < 8; i++) enqueue({ payload: { marker: `outro-${i}` } });

    const r = await syncPendingItems();
    expect(r.synced).toBe(10);

    const chamadasRecA = callLog.filter(c => c.recordId === 'rec-A').map(c => c.marker);
    expect(chamadasRecA).toEqual(['A-primeiro', 'A-segundo']);
  });

  it('todos os itens ficam com status synced ao final', async () => {
    for (let i = 0; i < 12; i++) enqueue({ payload: { marker: `m-${i}` } });
    await syncPendingItems();
    const statuses = [...queueStore.values()].map(i => i.status);
    expect(statuses.every(s => s === 'synced')).toBe(true);
  });
});

describe('syncPendingItems — lote misto (sucesso + falha + conflito)', () => {
  it('conta corretamente e conflitos não entram como falha', async () => {
    const ok = enqueue({ payload: { marker: 'ok' } });
    const conflito = enqueue({ operation: 'update', entityId: 'rec-C', payload: { marker: 'conflito' } });
    const falha = enqueue({ payload: { marker: 'falha' } });

    validarESalvarRegistro.mockImplementation(async ({ data, recordId }) => {
      if (data?.marker === 'conflito') {
        const err = new Error('Conflito');
        err.response = {
          status: 409,
          data: { conflict: true, error: 'Conflito de sincronização', serverData: { id: 'rec-C' }, serverUpdatedDate: '2026-01-01T00:00:00Z' },
        };
        throw err;
      }
      if (data?.marker === 'falha') {
        const err = new Error('Request failed');
        err.response = { status: 400, data: { error: 'Obra não encontrada' } };
        throw err;
      }
      return { data: { data: { id: recordId || 'novo-1', ...data } } };
    });

    const r = await syncPendingItems();

    expect(r.synced).toBe(1);
    expect(r.failed).toBe(1);
    expect(r.errors[0]).toContain('Obra não encontrada');

    expect(queueStore.get(ok.id).status).toBe('synced');
    expect(queueStore.get(conflito.id).status).toBe('conflict');
    expect(queueStore.get(falha.id).status).toBe('failed');

    expect(conflictStore).toHaveLength(1);
    expect(conflictStore[0]).toMatchObject({ entityId: 'rec-C', status: 'pending' });
  });

  it('erro permanente 4xx marca failed já na 1ª tentativa (sem retentar infinito)', async () => {
    const item = enqueue({ payload: { marker: 'invalido' } });
    const err = new Error('Bad Request');
    err.response = { status: 422, data: { error: 'Dados inválidos' } };
    validarESalvarRegistro.mockRejectedValue(err);

    await syncPendingItems();

    const stored = queueStore.get(item.id);
    expect(stored.status).toBe('failed');
    expect(stored.attempts).toBe(1);
    expect(stored.lastError).toBe('Dados inválidos');
  });

  it('erro transitório 5xx mantém pending até 5 tentativas, depois failed', async () => {
    const err = new Error('Server error');
    err.response = { status: 500, data: {} };
    validarESalvarRegistro.mockRejectedValue(err);

    const jovem = enqueue({ payload: { marker: 't1' }, attempts: 0 });
    const esgotado = enqueue({ payload: { marker: 't2' }, attempts: 4 });

    await syncPendingItems();

    expect(queueStore.get(jovem.id).status).toBe('pending');
    expect(queueStore.get(jovem.id).attempts).toBe(1);
    expect(queueStore.get(esgotado.id).status).toBe('failed');
    expect(queueStore.get(esgotado.id).attempts).toBe(5);
  });
});

describe('retryFailedItems', () => {
  it('zera tentativas dos failed e sincroniza com sucesso', async () => {
    const a = enqueue({ payload: { marker: 'a' } });
    const b = enqueue({ payload: { marker: 'b' } });
    queueStore.set(a.id, { ...queueStore.get(a.id), status: 'failed', attempts: 5, lastError: 'x' });
    queueStore.set(b.id, { ...queueStore.get(b.id), status: 'failed', attempts: 3, lastError: 'y' });

    const r = await retryFailedItems();

    expect(r.synced).toBe(2);
    expect(queueStore.get(a.id).status).toBe('synced');
    expect(queueStore.get(b.id).status).toBe('synced');
  });
});