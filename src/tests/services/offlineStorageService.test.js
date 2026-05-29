/**
 * tests/services/offlineStorageService.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  addQueueItem,
  getQueueItem,
  updateQueueItem,
  removeQueueItem,
  getQueueItemsByStatus,
  findDuplicateQueueItem,
  getAllQueueItems,
  clearQueue,
  countQueueItemsByStatus,
} from '@/services/offlineStorageService';
import { createQueueItem } from '@/utils/offlineQueue';

describe('offlineStorageService', () => {
  beforeEach(async () => {
    // Limpar antes de cada teste
    await clearQueue();
  });

  afterEach(async () => {
    // Limpar após cada teste
    await clearQueue();
  });

  it('deve adicionar item à fila', async () => {
    const item = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload: { obra_id: 'X', data: '2026-05-29' },
    });

    const id = await addQueueItem(item);
    expect(id).toBe(item.id);

    const retrieved = await getQueueItem(id);
    expect(retrieved).toBeDefined();
    expect(retrieved.entityType).toBe('ChecklistTerraplanagem');
  });

  it('deve atualizar status de item', async () => {
    const item = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistMRAF',
      payload: { obra_id: 'Y' },
    });

    await addQueueItem(item);
    await updateQueueItem(item.id, { status: 'syncing' });

    const updated = await getQueueItem(item.id);
    expect(updated.status).toBe('syncing');
  });

  it('deve remover item da fila', async () => {
    const item = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistAplicacao',
      payload: { obra_id: 'Z' },
    });

    await addQueueItem(item);
    await removeQueueItem(item.id);

    const retrieved = await getQueueItem(item.id);
    expect(retrieved).toBeNull();
  });

  it('deve listar items por status', async () => {
    const item1 = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload: { obra_id: 'A' },
    });
    const item2 = createQueueItem({
      operation: 'create',
      entityType: 'DiarioObra',
      payload: { obra_id: 'B' },
    });

    await addQueueItem(item1);
    const item2updated = { ...item2, status: 'synced' };
    await addQueueItem(item2updated);

    const pending = await getQueueItemsByStatus('pending');
    const synced = await getQueueItemsByStatus('synced');

    expect(pending).toHaveLength(1);
    expect(synced).toHaveLength(1);
  });

  it('deve encontrar duplicate por entityType, operation, dataHash', async () => {
    const payload = { obra_id: 'TEST', data: '2026-05-29' };
    const item1 = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload,
    });

    await addQueueItem(item1);

    // Mesmo entityType, operation, payload (mesmo hash)
    const item2 = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload,
    });

    const duplicate = await findDuplicateQueueItem(
      item2.entityType,
      item2.operation,
      item2.dataHash
    );

    expect(duplicate).toBeDefined();
    expect(duplicate.id).toBe(item1.id);
  });

  it('não deve encontrar duplicate se status é synced', async () => {
    const payload = { obra_id: 'TEST' };
    const item1 = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload,
    });

    await addQueueItem(item1);
    await updateQueueItem(item1.id, { status: 'synced' });

    const duplicate = await findDuplicateQueueItem(
      item1.entityType,
      item1.operation,
      item1.dataHash
    );

    expect(duplicate).toBeNull();
  });

  it('deve contar items por status', async () => {
    const item1 = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload: { obra_id: 'A' },
    });
    const item2 = createQueueItem({
      operation: 'create',
      entityType: 'DiarioObra',
      payload: { obra_id: 'B' },
    });

    await addQueueItem(item1);
    const item2updated = { ...item2, status: 'failed' };
    await addQueueItem(item2updated);

    const pendingCount = await countQueueItemsByStatus('pending');
    const failedCount = await countQueueItemsByStatus('failed');

    expect(pendingCount).toBe(1);
    expect(failedCount).toBe(1);
  });

  it('deve listar todos os items', async () => {
    const item1 = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload: { obra_id: 'A' },
    });
    const item2 = createQueueItem({
      operation: 'create',
      entityType: 'DiarioObra',
      payload: { obra_id: 'B' },
    });

    await addQueueItem(item1);
    await addQueueItem(item2);

    const all = await getAllQueueItems();
    expect(all).toHaveLength(2);
  });

  it('deve limpar fila', async () => {
    const item = createQueueItem({
      operation: 'create',
      entityType: 'ChecklistTerraplanagem',
      payload: { obra_id: 'A' },
    });

    await addQueueItem(item);
    let all = await getAllQueueItems();
    expect(all.length).toBeGreaterThan(0);

    await clearQueue();
    all = await getAllQueueItems();
    expect(all).toHaveLength(0);
  });
});