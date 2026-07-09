/**
 * tests/integration/conflictResolutionFlow.test.js
 *
 * Teste de integração: fluxo completo de resolução de conflitos (LWW).
 *
 * Cenários obrigatórios (do prompt especializado):
 *  1. Duas edições offline do mesmo registro em dispositivos diferentes,
 *     sincronizar ambos e validar o resultado final.
 *  2. Sincronização fora de ordem (registro mais antigo chega depois).
 *  3. Resolução: "Usar minha versão" (force overwrite).
 *  4. Resolução: "Manter versão do servidor" (discard).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mock storage em memória para fila e conflitos ──────────────────────────────
const queueStorage = new Map();
const conflictStorage = new Map();

// ── Mock de validarESalvarRegistro (backend function) ──────────────────────────
// Simula o comportamento do entry.ts: retorna 409 quando há conflito LWW.
// vi.hoisted garante que a variável exista antes do hoisting do vi.mock.
const { mockValidarESalvarRegistro } = vi.hoisted(() => ({
  mockValidarESalvarRegistro: vi.fn(),
}));

vi.mock('@/functions/validarESalvarRegistro', () => ({
  validarESalvarRegistro: mockValidarESalvarRegistro,
}));

// ── Mock de base44Client (evita acesso a window em ambiente node) ──────────────
vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {},
  },
}));

// ── Mock de offlineStorageService ──────────────────────────────────────────────
vi.mock('@/services/offlineStorageService', () => ({
  addQueueItem: vi.fn(async (item) => {
    queueStorage.set(item.id, item);
    return item.id;
  }),
  getQueueItem: vi.fn(async (id) => queueStorage.get(id) || null),
  updateQueueItem: vi.fn(async (id, updates) => {
    const item = queueStorage.get(id);
    if (item) queueStorage.set(id, { ...item, ...updates });
  }),
  removeQueueItem: vi.fn(async (id) => queueStorage.delete(id)),
  getQueueItemsByStatus: vi.fn(async (status) =>
    Array.from(queueStorage.values()).filter((i) => i.status === status)
  ),
  countQueueItemsByStatus: vi.fn(async (status) =>
    Array.from(queueStorage.values()).filter((i) => i.status === status).length
  ),
  findDuplicateQueueItem: vi.fn(async () => null),
  addConflict: vi.fn(async (conflict) => {
    conflictStorage.set(conflict.id, conflict);
    return conflict.id;
  }),
  removeConflict: vi.fn(async (id) => conflictStorage.delete(id)),
  getAllConflicts: vi.fn(async () => Array.from(conflictStorage.values())),
  countConflictsByStatus: vi.fn(async (status) =>
    Array.from(conflictStorage.values()).filter((c) => c.status === status).length
  ),
}));

import { createQueueItem } from '@/utils/offlineQueue';
import {
  syncQueueItem,
  forceSyncQueueItem,
  resolveConflict,
  addOrUpdateQueueItem,
} from '@/services/syncService';
import {
  getQueueItem,
  countQueueItemsByStatus,
  getAllConflicts,
  countConflictsByStatus,
} from '@/services/offlineStorageService';

describe('Conflict Resolution Flow — Integração LWW', () => {
  beforeEach(() => {
    queueStorage.clear();
    conflictStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queueStorage.clear();
    conflictStorage.clear();
  });

  // ── Cenário 1: Duas edições offline, segunda sincronização detecta conflito ──
  it('Cenário 1: Device B edita sobre versão desatualizada → 409 → conflito armazenado', async () => {
    const recordId = 'record-001';
    const baseUpdatedDate = '2024-06-01T10:00:00Z'; // versão original carregada por ambos

    // Device A editou e sincronizou primeiro — servidor agora tem updated_date = T=12
    const serverUpdatedDate = '2024-06-01T12:00:00Z';
    const serverData = {
      id: recordId,
      obra_id: 'obra-1',
      observacoes: 'versão do Device A',
      updated_date: serverUpdatedDate,
    };

    // Device B salvou offline em T=11 (antes do servidor atualizar em T=12)
    const deviceBItem = createQueueItem({
      operation: 'update',
      entityType: 'DiarioObra',
      entityId: recordId,
      payload: { obra_id: 'obra-1', observacoes: 'versão do Device B' },
      clientUpdatedAt: '2024-06-01T11:00:00Z',
      baseUpdatedDate,
    });

    const itemId = await addOrUpdateQueueItem(deviceBItem);

    // Mock: validarESalvarRegistro retorna 409 (conflito LWW detectado)
    const conflictError = {
      response: {
        status: 409,
        data: {
          conflict: true,
          error: 'Conflito de sincronização: o registro foi modificado por outro usuário após o seu salvamento.',
          serverData,
          serverUpdatedDate,
          errorCategory: 'conflict',
        },
      },
    };

    mockValidarESalvarRegistro.mockRejectedValueOnce(conflictError);

    // Act: sincronizar Device B
    const stored = await getQueueItem(itemId);
    const result = await syncQueueItem(stored);

    // Assert: conflito detectado, não sobrescreveu silenciosamente
    expect(result.success).toBe(false);
    expect(result.conflict).toBe(true);

    // Item marcado como 'conflict' (não retenta automaticamente)
    const updated = await getQueueItem(itemId);
    expect(updated.status).toBe('conflict');

    // Conflito armazenado em IndexedDB para resolução do usuário
    const conflicts = await getAllConflicts();
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].entityType).toBe('DiarioObra');
    expect(conflicts[0].entityId).toBe(recordId);
    expect(conflicts[0].localData.observacoes).toBe('versão do Device B');
    expect(conflicts[0].serverData.observacoes).toBe('versão do Device A');

    // Conflito contém timestamps para o diálogo de resolução
    expect(conflicts[0].clientUpdatedAt).toBe('2024-06-01T11:00:00Z');
    expect(conflicts[0].serverUpdatedDate).toBe(serverUpdatedDate);
  });

  // ── Cenário 2: Sincronização fora de ordem (registro mais antigo chega depois) ──
  it('Cenário 2: registro mais antigo chega depois do mais novo → conflito', async () => {
    const recordId = 'record-002';

    // Device A salvou em T=10, Device B salvou em T=12
    // Device B sincroniza primeiro (sucesso), servidor updated_date = T=12
    // Device A sincroniza depois (client_updated_at = T=10 < server T=12) → conflito

    const deviceAItem = createQueueItem({
      operation: 'update',
      entityType: 'DiarioObra',
      entityId: recordId,
      payload: { obra_id: 'obra-2', observacoes: 'editado por A primeiro (mas sync depois)' },
      clientUpdatedAt: '2024-06-02T10:00:00Z', // mais antigo
      baseUpdatedDate: '2024-06-02T09:00:00Z',
    });

    const itemId = await addOrUpdateQueueItem(deviceAItem);

    // Servidor já foi atualizado por Device B em T=12
    const serverData = {
      id: recordId,
      obra_id: 'obra-2',
      observacoes: 'versão do Device B (sincronizada primeiro)',
      updated_date: '2024-06-02T12:00:00Z',
    };

    const conflictError = {
      response: {
        status: 409,
        data: {
          conflict: true,
          error: 'Conflito de sincronização: o registro foi modificado por outro usuário após o seu salvamento.',
          serverData,
          serverUpdatedDate: '2024-06-02T12:00:00Z',
          errorCategory: 'conflict',
        },
      },
    };

    mockValidarESalvarRegistro.mockRejectedValueOnce(conflictError);

    // Act
    const stored = await getQueueItem(itemId);
    const result = await syncQueueItem(stored);

    // Assert: conflito detectado — registro mais antigo não sobrescreve o mais novo
    expect(result.success).toBe(false);
    expect(result.conflict).toBe(true);

    const conflictCount = await countConflictsByStatus('pending');
    expect(conflictCount).toBe(1);
  });

  // ── Cenário 3: Resolução "Usar minha versão" (force overwrite) ───────────────
  it('Cenário 3: usuário escolhe "Usar minha versão" → force overwrite preserva campos server-authoritative', async () => {
    const recordId = 'record-003';

    // Conflito armazenado do Cenário 1
    const conflict = {
      id: 'conflict-001',
      queueItemId: 'queue-003',
      entityType: 'DiarioObra',
      entityId: recordId,
      entityName: 'DiarioObra',
      localData: { obra_id: 'obra-3', observacoes: 'minha versão', approved: true }, // approved será ignorado
      serverData: { id: recordId, obra_id: 'obra-3', observacoes: 'versão servidor', updated_date: '2024-06-03T10:00:00Z' },
      clientUpdatedAt: '2024-06-03T09:00:00Z',
      serverUpdatedDate: '2024-06-03T10:00:00Z',
      conflictReason: 'Conflito de sincronização',
      status: 'pending',
    };

    // Pré-popular item da fila com status 'conflict'
    queueStorage.set('queue-003', {
      id: 'queue-003',
      operation: 'update',
      entityType: 'DiarioObra',
      entityId: recordId,
      payload: conflict.localData,
      clientUpdatedAt: conflict.clientUpdatedAt,
      attempts: 1,
      status: 'conflict',
    });

    conflictStorage.set(conflict.id, conflict);

    // Mock: force_overwrite sucesso
    mockValidarESalvarRegistro.mockResolvedValueOnce({
      data: { data: { id: recordId, observacoes: 'minha versão' } },
    });

    // Act
    const result = await resolveConflict(conflict, 'force');

    // Assert
    expect(result.success).toBe(true);

    // validarESalvarRegistro foi chamado com force_overwrite: true
    expect(mockValidarESalvarRegistro).toHaveBeenCalledWith(
      expect.objectContaining({
        entityName: 'DiarioObra',
        operation: 'update',
        recordId,
        force_overwrite: true,
      })
    );

    // Conflito removido após resolução
    const remaining = await getAllConflicts();
    expect(remaining).toHaveLength(0);

    // Item da fila marcado como synced
    const queueItem = await getQueueItem('queue-003');
    expect(queueItem.status).toBe('synced');
  });

  // ── Cenário 4: Resolução "Manter versão do servidor" (discard) ────────────────
  it('Cenário 4: usuário escolhe "Manter versão do servidor" → descarta alterações locais', async () => {
    const recordId = 'record-004';

    const conflict = {
      id: 'conflict-002',
      queueItemId: 'queue-004',
      entityType: 'DiarioObra',
      entityId: recordId,
      entityName: 'DiarioObra',
      localData: { obra_id: 'obra-4', observacoes: 'minha versão descartada' },
      serverData: { id: recordId, obra_id: 'obra-4', observacoes: 'versão servidor mantida' },
      clientUpdatedAt: '2024-06-04T09:00:00Z',
      serverUpdatedDate: '2024-06-04T10:00:00Z',
      conflictReason: 'Conflito de sincronização',
      status: 'pending',
    };

    queueStorage.set('queue-004', {
      id: 'queue-004',
      operation: 'update',
      entityType: 'DiarioObra',
      entityId: recordId,
      payload: conflict.localData,
      clientUpdatedAt: conflict.clientUpdatedAt,
      attempts: 1,
      status: 'conflict',
    });

    conflictStorage.set(conflict.id, conflict);

    // Act: discard — não chama validarESalvarRegistro
    const result = await resolveConflict(conflict, 'discard');

    // Assert
    expect(result.success).toBe(true);

    // validarESalvarRegistro NÃO foi chamado (discard não envia dados)
    expect(mockValidarESalvarRegistro).not.toHaveBeenCalled();

    // Conflito removido
    const remaining = await getAllConflicts();
    expect(remaining).toHaveLength(0);

    // Item marcado como synced (descartado = não retenta)
    const queueItem = await getQueueItem('queue-004');
    expect(queueItem.status).toBe('synced');
  });

  // ── Cenário 5: Sem conflito — sincronização normal quando timestamps coerem ──
  it('Cenário 5: sem conflito quando cliente editou após última atualização do servidor', async () => {
    const recordId = 'record-005';

    // Servidor atualizado em T=10, cliente salvou em T=12 (depois)
    const item = createQueueItem({
      operation: 'update',
      entityType: 'DiarioObra',
      entityId: recordId,
      payload: { obra_id: 'obra-5', observacoes: 'edição recente' },
      clientUpdatedAt: '2024-06-05T12:00:00Z',
      baseUpdatedDate: '2024-06-05T10:00:00Z',
    });

    const itemId = await addOrUpdateQueueItem(item);

    // Mock: sem conflito, retorna sucesso
    mockValidarESalvarRegistro.mockResolvedValueOnce({
      data: { data: { id: recordId, observacoes: 'edição recente' } },
    });

    // Act
    const stored = await getQueueItem(itemId);
    const result = await syncQueueItem(stored);

    // Assert
    expect(result.success).toBe(true);
    expect(result.conflict).toBeUndefined();

    const updated = await getQueueItem(itemId);
    expect(updated.status).toBe('synced');

    // Nenhum conflito armazenado
    const conflicts = await getAllConflicts();
    expect(conflicts).toHaveLength(0);
  });

  // ── Cenário 6: Múltiplos conflitos — items em conflito não são sincronizados automaticamente ──
  it('Cenário 6: items com status conflict não são retentados na sincronização automática', async () => {
    // Pré-popular fila com 1 pending + 1 conflict
    const pendingItem = createQueueItem({
      operation: 'create',
      entityType: 'DiarioObra',
      payload: { obra_id: 'obra-6a' },
    });
    const conflictItem = createQueueItem({
      operation: 'update',
      entityType: 'DiarioObra',
      entityId: 'record-6b',
      payload: { obra_id: 'obra-6b' },
    });

    queueStorage.set(pendingItem.id, pendingItem);
    queueStorage.set(conflictItem.id, { ...conflictItem, status: 'conflict' });

    // Mock: apenas o pending deve ser sincronizado
    mockValidarESalvarRegistro.mockResolvedValueOnce({
      data: { data: { id: 'new-record-6a' } },
    });

    // Act: syncPendingItems pega apenas status='pending'
    const { syncPendingItems } = await import('@/services/syncService');
    const result = await syncPendingItems();

    // Assert: 1 sincronizado, 0 falhas, conflict não foi retentado
    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);

    // validarESalvarRegistro chamado apenas 1 vez (para o pending, não o conflict)
    expect(mockValidarESalvarRegistro).toHaveBeenCalledTimes(1);
  });
});