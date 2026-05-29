/**
 * tests/services/syncService.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncQueueItem, syncPendingItems, addOrUpdateQueueItem } from '@/services/syncService';
import { createQueueItem } from '@/utils/offlineQueue';
import { addQueueItem, getQueueItem, clearQueue } from '@/services/offlineStorageService';
import { base44 } from '@/api/base44Client';

// Mock base44
vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      ChecklistTerraplanagem: {
        create: vi.fn(),
        update: vi.fn(),
      },
      ChecklistMRAF: {
        create: vi.fn(),
      },
      DiarioObra: {
        create: vi.fn(),
      },
    },
  },
}));

// Mock operações de fila com storage em memória
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
  clearQueue: vi.fn(async () => mockStorage.clear()),
}));

describe('syncService', () => {
  beforeEach(async () => {
    mockStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    mockStorage.clear();
  });

  describe('syncQueueItem', () => {
    it('deve sincronizar create com sucesso', async () => {
      const mockCreatedId = 'checklist-uuid-123';
      base44.entities.ChecklistTerraplanagem.create.mockResolvedValue({ id: mockCreatedId });

      const item = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'X', data: '2026-05-29' },
      });

      const result = await syncQueueItem(item);

      expect(result.success).toBe(true);
      expect(base44.entities.ChecklistTerraplanagem.create).toHaveBeenCalledWith(item.payload);
    });

    it('deve sincronizar update com sucesso', async () => {
      base44.entities.ChecklistTerraplanagem.update.mockResolvedValue({});

      const item = createQueueItem({
        operation: 'update',
        entityType: 'ChecklistTerraplanagem',
        entityId: 'existing-id',
        payload: { obra_id: 'X', data: '2026-05-29' },
      });

      const result = await syncQueueItem(item);

      expect(result.success).toBe(true);
      expect(base44.entities.ChecklistTerraplanagem.update).toHaveBeenCalledWith('existing-id', item.payload);
    });

    it('deve marcar como failed após múltiplas tentativas', async () => {
      base44.entities.ChecklistTerraplanagem.create.mockRejectedValue(new Error('Network error'));

      const item = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'X' },
      });

      // Criar um item com 5 tentativas já
      const itemWithRetries = { ...item, id: 'item-retry', attempts: 5 };
      await addQueueItem(itemWithRetries);

      // Sincronizar (deve falhar e ser marcado como failed)
      const result = await syncQueueItem(itemWithRetries);

      // Item deve ser marcado como failed após atingir 5 tentativas
      expect(result.success).toBe(false);
      const lastItem = await getQueueItem('item-retry');
      expect(lastItem.status).toBe('failed');
    });

    it('deve rejeitar operação desconhecida', async () => {
      const item = createQueueItem({
        operation: 'unknown',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'X' },
      });

      const result = await syncQueueItem(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('desconhecida');
    });
  });

  describe('syncPendingItems', () => {
    it('deve sincronizar múltiplos items', async () => {
      base44.entities.ChecklistTerraplanagem.create.mockResolvedValue({ id: 'id-1' });
      base44.entities.ChecklistMRAF.create.mockResolvedValue({ id: 'id-2' });

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
      base44.entities.ChecklistTerraplanagem.create.mockRejectedValue(new Error('Error 1'));
      base44.entities.ChecklistMRAF.create.mockResolvedValue({ id: 'id-2' });

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

      // Mesmo entityType, operation, payload hash similar
      // (na verdade hashes diferentes, então não é duplicate)
      const id2 = await addOrUpdateQueueItem(item2);

      // Quando payloads são EXATAMENTE iguais
      const item3 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: payload1, // Mesmo payload
      });

      const id3 = await addOrUpdateQueueItem(item3);

      // item3 deve ter mesmo ID que item1 (duplicate)
      expect(id3).toBe(id1);

      const stored = await getQueueItem(id1);
      expect(stored).toBeDefined();
    });
  });
});