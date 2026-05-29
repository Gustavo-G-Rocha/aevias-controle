/**
 * tests/integration/offlineWorkflow.test.js
 * Teste de integração: fluxo offline completo
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock offlineStorageService com storage em memória
const mockStorage = new Map();

vi.mock('@/services/offlineStorageService', () => ({
  addQueueItem: vi.fn(async (item) => {
    mockStorage.set(item.id, item);
    return item.id;
  }),
  getQueueItem: vi.fn(async (itemId) => mockStorage.get(itemId) || null),
  updateQueueItem: vi.fn(async (itemId, updates) => {
    const item = mockStorage.get(itemId);
    if (item) mockStorage.set(itemId, { ...item, ...updates });
  }),
  getQueueItemsByStatus: vi.fn(async (status) => {
    return Array.from(mockStorage.values()).filter(item => item.status === status);
  }),
  findDuplicateQueueItem: vi.fn(async (entityType, operation, dataHash) => {
    return Array.from(mockStorage.values()).find(
      (item) =>
        item.entityType === entityType &&
        item.operation === operation &&
        item.dataHash === dataHash &&
        item.status !== 'synced'
    ) || null;
  }),
  removeQueueItem: vi.fn(async (itemId) => {
    mockStorage.delete(itemId);
  }),
  clearQueue: vi.fn(async () => mockStorage.clear()),
}));
import { createQueueItem } from '@/utils/offlineQueue';
import { addOrUpdateQueueItem } from '@/services/syncService';
import { getQueueItem, countQueueItemsByStatus, clearQueue } from '@/services/offlineStorageService';
import { base44 } from '@/api/base44Client';

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      ChecklistTerraplanagem: {
        create: vi.fn(),
        update: vi.fn(),
      },
      DiarioObra: {
        create: vi.fn(),
      },
    },
  },
}));

describe('offlineWorkflow - Integração', () => {
  beforeEach(async () => {
    mockStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    mockStorage.clear();
  });

  it('fluxo completo: offline → criar → sync → online', async () => {
    // 1. Usuário offline cria checklist
    const checklistPayload = {
      obra_id: 'obra-123',
      data: '2026-05-29',
      rodovia: 'BR-101',
      status: 'rascunho',
    };

    const queueItem = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload: checklistPayload,
    });

    // 2. Adicionar à fila (offline)
    const itemId = await addOrUpdateQueueItem(queueItem);
    expect(itemId).toBeDefined();

    // 3. Verificar que foi adicionado com status pending
    let stored = await getQueueItem(itemId);
    expect(stored.status).toBe('pending');

    const pendingCount = await countQueueItemsByStatus('pending');
    expect(pendingCount).toBe(1);

    // 4. Simular sincronização
    base44.entities.ChecklistTerraplanagem.create.mockResolvedValue({
      id: 'checklist-uuid',
    });

    const { syncQueueItem } = await import('@/services/syncService');
    const result = await syncQueueItem(stored);

    expect(result.success).toBe(true);
    expect(base44.entities.ChecklistTerraplanagem.create).toHaveBeenCalledWith(checklistPayload);

    // 5. Verificar que foi marcado como synced
    stored = await getQueueItem(itemId);
    expect(stored.status).toBe('synced');
    expect(stored.entityId).toBe('checklist-uuid');

    const pendingCountAfter = await countQueueItemsByStatus('pending');
    expect(pendingCountAfter).toBe(0);

    const syncedCount = await countQueueItemsByStatus('synced');
    expect(syncedCount).toBe(1);
  });

  it('fluxo completo: deduplicação + atualização', async () => {
    const payload = {
      obra_id: 'obra-456',
      data: '2026-05-29',
    };

    // 1. Primeiro item
    const item1 = createQueueItem({
      operation: 'create',
      entityType: 'DiarioObra',
      payload,
    });

    const id1 = await addOrUpdateQueueItem(item1);

    // 2. Segundo item com mesmo payload (duplicate)
    const item2 = createQueueItem({
      operation: 'create',
      entityType: 'DiarioObra',
      payload,
    });

    const id2 = await addOrUpdateQueueItem(item2);

    // 3. IDs devem ser iguais (foi atualizado, não duplicado)
    expect(id2).toBe(id1);

    // 4. Verificar que existe apenas 1 item na fila
    const pendingCount = await countQueueItemsByStatus('pending');
    expect(pendingCount).toBe(1);

    // 5. Conteúdo deve ter sido atualizado
    const stored = await getQueueItem(id1);
    expect(stored.payload).toEqual(payload);
  });

  it('fluxo: múltiplos registros com falha parcial', async () => {
    base44.entities.ChecklistTerraplanagem.create
      .mockResolvedValueOnce({ id: 'id-1' })
      .mockRejectedValueOnce(new Error('Erro de conexão'))
      .mockResolvedValueOnce({ id: 'id-3' });

    // 3 registros
    const item1 = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload: { obra_id: 'A' },
    });
    const item2 = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload: { obra_id: 'B' },
    });
    const item3 = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload: { obra_id: 'C' },
    });

    const id1 = await addOrUpdateQueueItem(item1);
    const id2 = await addOrUpdateQueueItem(item2);
    const id3 = await addOrUpdateQueueItem(item3);

    // Sincronizar todos
    const { syncQueueItem } = await import('@/services/syncService');

    let stored1 = await getQueueItem(id1);
    let result1 = await syncQueueItem(stored1);
    expect(result1.success).toBe(true);

    let stored2 = await getQueueItem(id2);
    let result2 = await syncQueueItem(stored2);
    expect(result2.success).toBe(false); // Erro

    let stored3 = await getQueueItem(id3);
    let result3 = await syncQueueItem(stored3);
    expect(result3.success).toBe(true);

    // Verificar estados finais
    const syncedCount = await countQueueItemsByStatus('synced');
    const failedCount = await countQueueItemsByStatus('failed');

    expect(syncedCount).toBe(2);
    expect(failedCount).toBe(1);

    // Verificar que item2 tem lastError preenchido
    stored2 = await getQueueItem(id2);
    expect(stored2.lastError).toBeDefined();
  });
});