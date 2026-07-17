/**
 * tests/services/syncService.test.js
 *
 * O syncService roteia TODAS as operações através da backend function
 * `validarESalvarRegistro` (validação server-side + detecção de conflitos LWW).
 * Os testes mockam essa função e o storage offline em memória.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { validarESalvarRegistroMock } = vi.hoisted(() => ({
  validarESalvarRegistroMock: vi.fn(),
}));

vi.mock('@/functions/validarESalvarRegistro', () => ({
  validarESalvarRegistro: validarESalvarRegistroMock,
}));

// Fotos offline: passthrough (sem placeholders locais nos payloads dos testes)
vi.mock('@/services/offlinePhotoService', () => ({
  resolverFotosOffline: vi.fn(async (payload) => payload),
}));

// Mock operações de fila com storage em memória
const mockStorage = new Map();
const mockConflicts = new Map();

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
  removeQueueItem: vi.fn(async (itemId) => {
    mockStorage.delete(itemId);
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
  addConflict: vi.fn(async (conflict) => {
    const id = `conflict-${mockConflicts.size + 1}`;
    mockConflicts.set(id, { id, ...conflict });
    return id;
  }),
  removeConflict: vi.fn(async (id) => {
    mockConflicts.delete(id);
  }),
  clearQueue: vi.fn(async () => mockStorage.clear()),
}));

import { syncQueueItem, syncPendingItems, addOrUpdateQueueItem } from '@/services/syncService';
import { createQueueItem } from '@/utils/offlineQueue';
import { addQueueItem, getQueueItem } from '@/services/offlineStorageService';

const okResponse = (data = { id: 'server-id' }) => ({ data: { data }, status: 200 });

describe('syncService', () => {
  beforeEach(async () => {
    mockStorage.clear();
    mockConflicts.clear();
    vi.clearAllMocks();
    validarESalvarRegistroMock.mockResolvedValue(okResponse());
  });

  afterEach(async () => {
    mockStorage.clear();
  });

  describe('syncQueueItem', () => {
    it('deve sincronizar create com sucesso via validarESalvarRegistro', async () => {
      validarESalvarRegistroMock.mockResolvedValue(okResponse({ id: 'checklist-uuid-123' }));

      const item = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'X', data: '2026-05-29' },
      });
      await addQueueItem(item);

      const result = await syncQueueItem(item);

      expect(result.success).toBe(true);
      expect(validarESalvarRegistroMock).toHaveBeenCalledWith(
        expect.objectContaining({
          entityName: 'ChecklistTerraplanagem',
          operation: 'create',
          data: item.payload,
        })
      );
      // entityId do registro criado é armazenado no item da fila
      const stored = await getQueueItem(item.id);
      expect(stored.status).toBe('synced');
      expect(stored.entityId).toBe('checklist-uuid-123');
    });

    it('deve sincronizar update com sucesso passando recordId', async () => {
      const item = createQueueItem({
        operation: 'update',
        entityType: 'ChecklistTerraplanagem',
        entityId: 'existing-id',
        payload: { obra_id: 'X', data: '2026-05-29' },
      });
      await addQueueItem(item);

      const result = await syncQueueItem(item);

      expect(result.success).toBe(true);
      expect(validarESalvarRegistroMock).toHaveBeenCalledWith(
        expect.objectContaining({
          entityName: 'ChecklistTerraplanagem',
          operation: 'update',
          recordId: 'existing-id',
          data: item.payload,
        })
      );
    });

    it('deve marcar como failed após múltiplas tentativas', async () => {
      validarESalvarRegistroMock.mockRejectedValue(new Error('Network error'));

      const item = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'X' },
      });

      // Criar um item com 5 tentativas já
      const itemWithRetries = { ...item, id: 'item-retry', attempts: 5 };
      await addQueueItem(itemWithRetries);

      const result = await syncQueueItem(itemWithRetries);

      expect(result.success).toBe(false);
      const lastItem = await getQueueItem('item-retry');
      expect(lastItem.status).toBe('failed');
    });

    it('erro permanente (4xx) marca como failed imediatamente, sem retentar', async () => {
      const err = new Error('Operação desconhecida');
      err.response = { status: 400, data: { error: 'Operação desconhecida' } };
      validarESalvarRegistroMock.mockRejectedValue(err);

      const item = createQueueItem({
        operation: 'unknown',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'X' },
      });
      await addQueueItem(item);

      const result = await syncQueueItem(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('desconhecida');
      const stored = await getQueueItem(item.id);
      expect(stored.status).toBe('failed'); // 4xx = permanente, não volta a 'pending'
    });

    it('conflito (409) armazena conflito e marca item como conflict', async () => {
      const err = new Error('Conflict');
      err.response = {
        status: 409,
        data: { conflict: true, error: 'Conflito de sincronização', serverData: { id: 's1' } },
      };
      validarESalvarRegistroMock.mockRejectedValue(err);

      const item = createQueueItem({
        operation: 'update',
        entityType: 'ChecklistTerraplanagem',
        entityId: 's1',
        payload: { obra_id: 'X' },
      });
      await addQueueItem(item);

      const result = await syncQueueItem(item);

      expect(result.success).toBe(false);
      expect(result.conflict).toBe(true);
      const stored = await getQueueItem(item.id);
      expect(stored.status).toBe('conflict');
    });
  });

  describe('syncPendingItems', () => {
    it('deve sincronizar múltiplos items', async () => {
      const item1 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'A' },
      });
      const item2 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistMRAF',
        payload: { obra_id: 'B' },
      });

      await addQueueItem(item1);
      await addQueueItem(item2);

      const result = await syncPendingItems();

      expect(result.synced).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('deve retornar 0 se nenhum item pendente', async () => {
      const result = await syncPendingItems();

      expect(result.synced).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('deve contar falhas corretamente', async () => {
      validarESalvarRegistroMock.mockImplementation(async ({ entityName }) => {
        if (entityName === 'ChecklistTerraplanagem') throw new Error('Error 1');
        return okResponse({ id: 'id-2' });
      });

      const item1 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'A' },
      });
      const item2 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistMRAF',
        payload: { obra_id: 'B' },
      });

      await addQueueItem(item1);
      await addQueueItem(item2);

      const result = await syncPendingItems();

      expect(result.synced).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe('addOrUpdateQueueItem', () => {
    it('deve adicionar novo item se não existe duplicate', async () => {
      const item = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'X' },
      });

      const id = await addOrUpdateQueueItem(item);

      expect(id).toBe(item.id);
      const stored = await getQueueItem(id);
      expect(stored).toBeDefined();
    });

    it('deve atualizar item existente se duplicate detectado', async () => {
      const payload1 = { obra_id: 'X', data: '2026-05-29' };
      const item1 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: payload1,
      });

      const id1 = await addOrUpdateQueueItem(item1);

      const payload2 = { obra_id: 'X', data: '2026-05-29', extra: 'field' };
      const item2 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: payload2,
      });

      // Hashes diferentes → não é duplicate
      await addOrUpdateQueueItem(item2);

      // Payload EXATAMENTE igual ao item1 → duplicate
      const item3 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: payload1,
      });

      const id3 = await addOrUpdateQueueItem(item3);

      expect(id3).toBe(id1);

      const stored = await getQueueItem(id1);
      expect(stored).toBeDefined();
    });
  });
});