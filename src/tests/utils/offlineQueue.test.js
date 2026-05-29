/**
 * tests/utils/offlineQueue.test.js
 */

import { describe, it, expect } from 'vitest';
import {
  generatePayloadHash,
  createQueueItem,
  isValidQueueItem,
  areQueueItemsDuplicate,
} from '@/utils/offlineQueue';

describe('offlineQueue', () => {
  describe('generatePayloadHash', () => {
    it('deve gerar hash consistente', () => {
      const payload = { obra_id: 'X', data: '2026-05-29' };
      const hash1 = generatePayloadHash(payload);
      const hash2 = generatePayloadHash(payload);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('deve gerar hashes diferentes para payloads diferentes', () => {
      const payload1 = { obra_id: 'X' };
      const payload2 = { obra_id: 'Y' };

      const hash1 = generatePayloadHash(payload1);
      const hash2 = generatePayloadHash(payload2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createQueueItem', () => {
    it('deve criar item com valores padrão', () => {
      const item = createQueueItem();

      expect(item.id).toBeDefined();
      expect(item.timestamp).toBeGreaterThan(0);
      expect(item.operation).toBe('create');
      expect(item.status).toBe('pending');
      expect(item.attempts).toBe(0);
      expect(item.dataHash).toBeDefined();
    });

    it('deve criar item com valores customizados', () => {
      const payload = { obra_id: 'ABC', data: '2026-05-29' };
      const item = createQueueItem({
        operation: 'update',
        entityType: 'ChecklistTerraplanagem',
        entityId: 'checklist-123',
        payload,
      });

      expect(item.operation).toBe('update');
      expect(item.entityType).toBe('ChecklistTerraplanagem');
      expect(item.entityId).toBe('checklist-123');
      expect(item.payload).toEqual(payload);
    });
  });

  describe('isValidQueueItem', () => {
    it('deve validar item correto', () => {
      const item = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistMRAF',
        payload: { obra_id: 'X' },
      });

      expect(isValidQueueItem(item)).toBe(true);
    });

    it('deve rejeitar item sem id', () => {
      const item = createQueueItem();
      delete item.id;

      expect(isValidQueueItem(item)).toBe(false);
    });

    it('deve rejeitar item com status inválido', () => {
      const item = createQueueItem();
      item.status = 'invalid';

      expect(isValidQueueItem(item)).toBe(false);
    });

    it('deve rejeitar null/undefined', () => {
      expect(isValidQueueItem(null)).toBe(false);
      expect(isValidQueueItem(undefined)).toBe(false);
    });
  });

  describe('areQueueItemsDuplicate', () => {
    it('deve identificar duplicates', () => {
      const payload = { obra_id: 'X' };
      const item1 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload,
      });

      const item2 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload,
      });

      expect(areQueueItemsDuplicate(item1, item2)).toBe(true);
    });

    it('não deve identificar como duplicate se operation diferente', () => {
      const payload = { obra_id: 'X' };
      const item1 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload,
      });

      const item2 = createQueueItem({
        operation: 'update',
        entityType: 'ChecklistTerraplanagem',
        payload,
      });

      expect(areQueueItemsDuplicate(item1, item2)).toBe(false);
    });

    it('não deve identificar como duplicate se entityType diferente', () => {
      const payload = { obra_id: 'X' };
      const item1 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload,
      });

      const item2 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistMRAF',
        payload,
      });

      expect(areQueueItemsDuplicate(item1, item2)).toBe(false);
    });

    it('não deve identificar como duplicate se dataHash diferente', () => {
      const item1 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'X' },
      });

      const item2 = createQueueItem({
        operation: 'create',
        entityType: 'ChecklistTerraplanagem',
        payload: { obra_id: 'Y' },
      });

      expect(areQueueItemsDuplicate(item1, item2)).toBe(false);
    });
  });
});