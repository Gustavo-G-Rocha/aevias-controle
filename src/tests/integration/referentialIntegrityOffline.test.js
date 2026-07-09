/**
 * tests/integration/referentialIntegrityOffline.test.js
 *
 * Teste de integração: Integridade Referencial em operações Offline.
 *
 * Cenário obrigatório (do prompt especializado):
 *   "Tentar criar um registro dependente offline referenciando uma
 *    entidade pai não sincronizada localmente e verificar que o sistema
 *    bloqueia/avisa antes de tentar salvar."
 *
 * Este teste simula o fluxo completo do hook de formulário offline:
 *   validateForm → buildDataToSave → validateReferentialIntegrity → createQueueItem
 *
 * Se a validação referencial falhar, o item NÃO deve ser enfileirado.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateReferentialIntegrity } from '@/utils/referentialIntegrity';
import { createQueueItem } from '@/utils/offlineQueue';

// ── Mock do cache local (simula dados sincronizados no dispositivo) ──────────
const LOCAL_CACHE = {
  obras: [
    { id: 'obra-1', nome: 'Obra Alpha', regional_id: 'reg-1' },
    { id: 'obra-2', nome: 'Obra Beta', regional_id: 'reg-1' },
  ],
  projects: [
    { id: 'proj-1', nome: 'Projeto X', obra_id: 'obra-1' },
    { id: 'proj-2', nome: 'Projeto Y', obra_id: 'obra-2' },
  ],
};

/**
 * Simula o fluxo de salvamento offline do useChecklistMRAFForm / useChecklistTerraplanagemForm.
 * Retorna { blocked: boolean, errorMessage?: string, queueItem?: object }.
 */
function simulateOfflineSave(dataToSave, localCache, { entityType = 'ChecklistMRAF', editingId = null } = {}) {
  // Passo 1: Validar integridade referencial antes de enfileirar
  const refCheck = validateReferentialIntegrity(dataToSave, localCache);

  if (!refCheck.valid) {
    // Bloquear — não enfileirar, mostrar toast ao usuário
    return { blocked: true, errorMessage: refCheck.errorMessage, queueItem: null };
  }

  // Passo 2: Criar item da fila offline
  const queueItem = createQueueItem({
    operation: editingId ? 'update' : 'create',
    entityType,
    entityId: editingId || null,
    payload: dataToSave,
    clientUpdatedAt: new Date().toISOString(),
    baseUpdatedDate: null,
  });

  return { blocked: false, errorMessage: null, queueItem };
}

describe('Integridade Referencial Offline — Fluxo de salvamento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Cenário 1: obra_id existe no cache → salva com sucesso ──────────────────
  it('permite salvar offline quando obra_id existe no cache local', () => {
    const dataToSave = {
      obra_id: 'obra-1',
      data: '2026-07-09',
      rodovia: 'BR-116',
      status: 'finalizado',
    };

    const result = simulateOfflineSave(dataToSave, LOCAL_CACHE);

    expect(result.blocked).toBe(false);
    expect(result.errorMessage).toBeNull();
    expect(result.queueItem).not.toBeNull();
    expect(result.queueItem.operation).toBe('create');
    expect(result.queueItem.entityType).toBe('ChecklistMRAF');
    expect(result.queueItem.payload).toEqual(dataToSave);
  });

  // ── Cenário 2: obra_id NÃO existe no cache → bloqueia (registro órfão) ─────
  it('BLOQUEIA salvamento offline quando obra_id não existe no cache local', () => {
    const dataToSave = {
      obra_id: 'obra-fantasma', // não está no cache do dispositivo
      data: '2026-07-09',
      rodovia: 'BR-116',
      status: 'finalizado',
    };

    const result = simulateOfflineSave(dataToSave, LOCAL_CACHE);

    expect(result.blocked).toBe(true);
    expect(result.errorMessage).not.toBeNull();
    expect(result.errorMessage).toContain('obra');
    expect(result.errorMessage).toContain('cache local');
    expect(result.errorMessage).toContain('internet');
    expect(result.queueItem).toBeNull();
  });

  // ── Cenário 3: project_id não existe → bloqueia (mesmo com obra válida) ────
  it('BLOQUEIA salvamento offline quando project_id não existe no cache local', () => {
    const dataToSave = {
      obra_id: 'obra-1', // válida
      project_id: 'proj-fantasma', // não está no cache
      data: '2026-07-09',
      status: 'finalizado',
    };

    const result = simulateOfflineSave(dataToSave, LOCAL_CACHE);

    expect(result.blocked).toBe(true);
    expect(result.errorMessage).toContain('projeto');
    expect(result.queueItem).toBeNull();
  });

  // ── Cenário 4: ambas as referências inválidas → bloqueia com 2 campos ──────
  it('BLOQUEIA quando obra_id E project_id são inexistentes', () => {
    const dataToSave = {
      obra_id: 'obra-fantasma',
      project_id: 'proj-fantasma',
      data: '2026-07-09',
    };

    const result = simulateOfflineSave(dataToSave, LOCAL_CACHE);

    expect(result.blocked).toBe(true);
    expect(result.queueItem).toBeNull();
  });

  // ── Cenário 5: project_id vazio (opcional) → salva com sucesso ─────────────
  it('permite salvar offline quando project_id está vazio (opcional)', () => {
    const dataToSave = {
      obra_id: 'obra-1',
      project_id: '', // vazio é OK — campo opcional
      data: '2026-07-09',
    };

    const result = simulateOfflineSave(dataToSave, LOCAL_CACHE);

    expect(result.blocked).toBe(false);
    expect(result.queueItem).not.toBeNull();
  });

  // ── Cenário 6: cache vazio + obra_id com valor → bloqueia ──────────────────
  it('BLOQUEIA quando cache local está vazio mas obra_id tem valor', () => {
    const dataToSave = {
      obra_id: 'obra-1',
      data: '2026-07-09',
    };

    const result = simulateOfflineSave(dataToSave, { obras: [], projects: [] });

    expect(result.blocked).toBe(true);
    expect(result.errorMessage).not.toBeNull();
    expect(result.queueItem).toBeNull();
  });

  // ── Cenário 7: update offline de registro existente com referências válidas ─
  it('permite update offline quando referências são válidas e editingId existe', () => {
    const dataToSave = {
      obra_id: 'obra-2',
      project_id: 'proj-2',
      data: '2026-07-09',
      status: 'finalizado',
      observacoes: 'Editado offline',
    };

    const result = simulateOfflineSave(dataToSave, LOCAL_CACHE, {
      entityType: 'ChecklistTerraplanagem',
      editingId: 'existing-record-id',
    });

    expect(result.blocked).toBe(false);
    expect(result.queueItem).not.toBeNull();
    expect(result.queueItem.operation).toBe('update');
    expect(result.queueItem.entityId).toBe('existing-record-id');
    expect(result.queueItem.entityType).toBe('ChecklistTerraplanagem');
  });

  // ── Cenário 8: update offline com obra_id alterada para inexistente → bloqueia ─
  it('BLOQUEIA update offline quando obra_id é alterada para valor inexistente no cache', () => {
    // Usuário selecionou uma obra que não está sincronizada no dispositivo
    const dataToSave = {
      obra_id: 'obra-removida-do-servidor',
      data: '2026-07-09',
      status: 'finalizado',
    };

    const result = simulateOfflineSave(dataToSave, LOCAL_CACHE, {
      entityType: 'ChecklistTerraplanagem',
      editingId: 'existing-record-id',
    });

    expect(result.blocked).toBe(true);
    expect(result.queueItem).toBeNull();
  });

  // ── Cenário 9: registro sem obra_id (campo vazio) → passa (validação de form pega) ─
  it('passa validação referencial quando obra_id está vazia (validação de formulário captura)', () => {
    // Nota: a validação de formulário (validateForm) deve pegar obra_id vazia ANTES
    // deste ponto. Mas se chegar aqui, a integridade referencial não bloqueia.
    const dataToSave = {
      obra_id: '',
      data: '2026-07-09',
    };

    const result = simulateOfflineSave(dataToSave, LOCAL_CACHE);

    // Não bloqueia aqui — obra_id vazia é responsabilidade do validateForm
    expect(result.blocked).toBe(false);
  });

  // ── Cenário 10: mensagem de erro é clara e acionável ────────────────────────
  it('mensagem de erro orienta o usuário a se conectar à internet', () => {
    const dataToSave = {
      obra_id: 'obra-inexistente',
      data: '2026-07-09',
    };

    const result = simulateOfflineSave(dataToSave, LOCAL_CACHE);

    expect(result.blocked).toBe(true);
    expect(result.errorMessage).toContain('internet');
    expect(result.errorMessage).toContain('sincronizar');
    // Mensagem não é um erro genérico — é específica sobre o problema
    expect(result.errorMessage).not.toBe('Erro ao salvar');
  });

  // ── Cenário 11: queue item NÃO é criado quando validação falha ──────────────
  it('item da fila NÃO é criado quando validação referencial falha', () => {
    const dataToSave = {
      obra_id: 'obra-fantasma',
      data: '2026-07-09',
    };

    const result = simulateOfflineSave(dataToSave, LOCAL_CACHE);

    // Verificar que NENHUM item foi enfileirado
    expect(result.blocked).toBe(true);
    expect(result.queueItem).toBeNull();
    // O queueItem seria null, portanto addOrUpdateQueueItem nunca seria chamado
  });

  // ── Cenário 12: múltiplas tentativas com referências diferentes ─────────────
  it('múltiplas tentativas: primeira falha, segunda com referência correta passa', () => {
    // Primeira tentativa: obra inválida
    const data1 = { obra_id: 'obra-fantasma', data: '2026-07-09' };
    const result1 = simulateOfflineSave(data1, LOCAL_CACHE);
    expect(result1.blocked).toBe(true);
    expect(result1.queueItem).toBeNull();

    // Segunda tentativa: obra válida (usuário corrigiu)
    const data2 = { obra_id: 'obra-1', data: '2026-07-09' };
    const result2 = simulateOfflineSave(data2, LOCAL_CACHE);
    expect(result2.blocked).toBe(false);
    expect(result2.queueItem).not.toBeNull();
  });
});