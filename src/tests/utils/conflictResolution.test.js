import { describe, it, expect } from 'vitest';
import {
  detectConflict,
  detectBaseConflict,
  isSensitiveField,
  compareFields,
  SERVER_AUTHORITATIVE_FIELDS,
} from '@/utils/conflictResolution';

describe('conflictResolution', () => {
  describe('detectConflict', () => {
    it('detects conflict when client saved before server update', () => {
      const result = detectConflict('2024-01-01T10:00:00Z', '2024-01-01T11:00:00Z');
      expect(result.conflict).toBe(true);
      expect(result.reason).toBeDefined();
    });

    it('no conflict when client saved after server update', () => {
      const result = detectConflict('2024-01-01T12:00:00Z', '2024-01-01T11:00:00Z');
      expect(result.conflict).toBe(false);
    });

    it('no conflict when timestamps are equal', () => {
      const result = detectConflict('2024-01-01T11:00:00Z', '2024-01-01T11:00:00Z');
      expect(result.conflict).toBe(false);
    });

    it('no conflict when either timestamp is missing', () => {
      expect(detectConflict(null, '2024-01-01T11:00:00Z').conflict).toBe(false);
      expect(detectConflict('2024-01-01T11:00:00Z', null).conflict).toBe(false);
    });

    it('handles out-of-order sync: older edit arrives after newer one', () => {
      // Device A saved at T=10, Device B saved at T=12
      // Device B syncs first (server updated_date = T=12)
      // Device A syncs after (client_updated_at = T=10 < T=12) -> conflict
      const result = detectConflict('2024-01-01T10:00:00Z', '2024-01-01T12:00:00Z');
      expect(result.conflict).toBe(true);
    });
  });

  describe('detectBaseConflict', () => {
    it('detects conflict when base and server timestamps differ', () => {
      const result = detectBaseConflict('2024-01-01T10:00:00Z', '2024-01-01T11:00:00Z');
      expect(result.conflict).toBe(true);
    });

    it('no conflict when base and server timestamps match', () => {
      const result = detectBaseConflict('2024-01-01T10:00:00Z', '2024-01-01T10:00:00Z');
      expect(result.conflict).toBe(false);
    });

    it('no conflict when either timestamp is missing', () => {
      expect(detectBaseConflict(null, '2024-01-01T10:00:00Z').conflict).toBe(false);
      expect(detectBaseConflict('2024-01-01T10:00:00Z', null).conflict).toBe(false);
    });
  });

  describe('isSensitiveField', () => {
    it('identifies sensitive fields for EnsaioCAUQ', () => {
      expect(isSensitiveField('EnsaioCAUQ', 'corpos_prova_marshall')).toBe(true);
      expect(isSensitiveField('EnsaioCAUQ', 'extracao_ligante')).toBe(true);
      expect(isSensitiveField('EnsaioCAUQ', 'observacoes')).toBe(false);
    });

    it('identifies sensitive fields for EnsaioProctor', () => {
      expect(isSensitiveField('EnsaioProctor', 'densidade_maxima_seca')).toBe(true);
      expect(isSensitiveField('EnsaioProctor', 'umidade_otima')).toBe(true);
    });

    it('returns false for unknown entity', () => {
      expect(isSensitiveField('UnknownEntity', 'any_field')).toBe(false);
    });
  });

  describe('compareFields', () => {
    it('returns differences between local and server data', () => {
      const localData = {
        obra_id: '123',
        rodovia: 'BR-116',
        observacoes: 'local edit',
        approved: true,
      };
      const serverData = {
        obra_id: '123',
        rodovia: 'BR-116',
        observacoes: 'server edit',
        approved: false,
      };
      const diffs = compareFields('DiarioObra', localData, serverData);
      expect(diffs).toHaveLength(1);
      expect(diffs[0].field).toBe('observacoes');
    });

    it('marks sensitive fields', () => {
      const localData = { corpos_prova_marshall: [1, 2, 3] };
      const serverData = { corpos_prova_marshall: [1, 2, 4] };
      const diffs = compareFields('EnsaioCAUQ', localData, serverData);
      expect(diffs).toHaveLength(1);
      expect(diffs[0].sensitive).toBe(true);
    });

    it('returns empty array when data is identical', () => {
      const data = { obra_id: '123', rodovia: 'BR-116' };
      const diffs = compareFields('DiarioObra', data, { ...data });
      expect(diffs).toHaveLength(0);
    });

    it('ignores built-in and server-authoritative fields', () => {
      const localData = {
        id: '123',
        created_date: '2024-01-01',
        updated_date: '2024-01-01',
        approved: true,
        approved_by: 'admin@test.com',
        observacoes: 'local',
      };
      const serverData = {
        id: '123',
        created_date: '2024-01-01',
        updated_date: '2024-01-02',
        approved: false,
        approved_by: 'other@test.com',
        observacoes: 'server',
      };
      const diffs = compareFields('DiarioObra', localData, serverData);
      expect(diffs).toHaveLength(1);
      expect(diffs[0].field).toBe('observacoes');
    });
  });

  describe('SERVER_AUTHORITATIVE_FIELDS', () => {
    it('includes all approval and signature fields', () => {
      expect(SERVER_AUTHORITATIVE_FIELDS).toContain('approved');
      expect(SERVER_AUTHORITATIVE_FIELDS).toContain('approved_by');
      expect(SERVER_AUTHORITATIVE_FIELDS).toContain('approved_date');
      expect(SERVER_AUTHORITATIVE_FIELDS).toContain('approver_details');
      expect(SERVER_AUTHORITATIVE_FIELDS).toContain('rejection_reason');
      expect(SERVER_AUTHORITATIVE_FIELDS).toContain('was_rejected');
      expect(SERVER_AUTHORITATIVE_FIELDS).toContain('client_signature');
      expect(SERVER_AUTHORITATIVE_FIELDS).toContain('manager_signature');
    });
  });
});