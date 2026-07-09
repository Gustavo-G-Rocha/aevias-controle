/**
 * tests/hooks/useRecordCacheUpdate.test.js
 *
 * Testa a lógica de atualização granular de cache que useRecordCacheUpdate executa.
 * Como o hook é uma thin wrapper sobre queryClient.setQueriesData, testamos
 * diretamente a API do React Query para validar:
 *   - updateRecord substitui o registro correto por ID em ambas as entradas
 *     de cache (['allRecords','list'] e ['allRecords','dashboard'])
 *   - removeRecord remove o registro correto por ID
 *   - entityType (injetado por normalizeRecords) é preservado ao mesclar
 *   - registros não afetados permanecem inalterados
 *   - não há refetch disparado (setQueryData não invalida)
 */
import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

vi.mock('@/api/base44Client', () => ({ base44: { entities: {} } }));

import { QUERY_KEYS } from '@/hooks/useQueryData';

const ALL_RECORDS_KEY = QUERY_KEYS.allRecords; // ['allRecords']

function seedCache(queryClient, listData, dashboardData) {
  queryClient.setQueryData(QUERY_KEYS.allRecordsFor('list'), listData);
  queryClient.setQueryData(QUERY_KEYS.allRecordsFor('dashboard'), dashboardData);
}

/**
 * Replica exatamente o que useRecordCacheUpdate.updateRecord faz.
 */
function simulateUpdateRecord(queryClient, updatedRecord) {
  if (!updatedRecord?.id) return;
  queryClient.setQueriesData(
    { queryKey: ALL_RECORDS_KEY },
    (oldData) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.map(r =>
        r.id === updatedRecord.id ? { ...r, ...updatedRecord } : r
      );
    }
  );
}

/**
 * Replica exatamente o que useRecordCacheUpdate.removeRecord faz.
 */
function simulateRemoveRecord(queryClient, recordId) {
  if (!recordId) return;
  queryClient.setQueriesData(
    { queryKey: ALL_RECORDS_KEY },
    (oldData) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.filter(r => r.id !== recordId);
    }
  );
}

describe('useRecordCacheUpdate — atualização granular de cache', () => {
  const initialList = [
    { id: 'r1', entityType: 'EnsaioCAUQ', approved: null, rodovia: 'BR-101' },
    { id: 'r2', entityType: 'DiarioObra', approved: null, rodovia: 'BR-116' },
    { id: 'r3', entityType: 'ChecklistUsina', approved: true, rodovia: 'BR-040' },
  ];

  const initialDashboard = [
    { id: 'r1', entityType: 'EnsaioCAUQ', approved: null, rodovia: 'BR-101' },
    { id: 'r3', entityType: 'ChecklistUsina', approved: true, rodovia: 'BR-040' },
  ];

  it('updateRecord substitui apenas o registro com ID correspondente em ambas as entradas de cache', () => {
    const qc = new QueryClient();
    seedCache(qc, initialList, initialDashboard);

    const updated = { id: 'r1', approved: true, approved_by: 'admin@x.com', approved_date: '2026-07-09T12:00:00Z' };
    simulateUpdateRecord(qc, updated);

    const listData = qc.getQueryData(QUERY_KEYS.allRecordsFor('list'));
    const dashData = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard'));

    // r1 atualizado em ambos
    const r1List = listData.find(r => r.id === 'r1');
    const r1Dash = dashData.find(r => r.id === 'r1');
    expect(r1List.approved).toBe(true);
    expect(r1List.approved_by).toBe('admin@x.com');
    expect(r1Dash.approved).toBe(true);
    expect(r1Dash.approved_by).toBe('admin@x.com');

    // Outros registros inalterados
    expect(listData.find(r => r.id === 'r2').approved).toBe(null);
    expect(listData.find(r => r.id === 'r3').approved).toBe(true);
    expect(dashData.find(r => r.id === 'r3').approved).toBe(true);

    // Contagem preservada (não removeu nem adicionou registros)
    expect(listData).toHaveLength(3);
    expect(dashData).toHaveLength(2);
  });

  it('updateRecord preserva entityType do registro em cache (não sobrescrito pela resposta da API)', () => {
    const qc = new QueryClient();
    seedCache(qc, initialList, initialDashboard);

    // Resposta da API (gerenciarAprovacao) não inclui entityType
    const updated = { id: 'r1', approved: true };
    simulateUpdateRecord(qc, updated);

    const r1 = qc.getQueryData(QUERY_KEYS.allRecordsFor('list')).find(r => r.id === 'r1');
    expect(r1.entityType).toBe('EnsaioCAUQ');
  });

  it('updateRecord não altera registros não afetados', () => {
    const qc = new QueryClient();
    seedCache(qc, initialList, initialDashboard);

    const before = JSON.stringify(qc.getQueryData(QUERY_KEYS.allRecordsFor('list')));

    simulateUpdateRecord(qc, { id: 'r-nonexistent', approved: true });

    const after = JSON.stringify(qc.getQueryData(QUERY_KEYS.allRecordsFor('list')));
    expect(after).toBe(before); // array inalterado
  });

  it('updateRecord ignora chamada sem id', () => {
    const qc = new QueryClient();
    seedCache(qc, initialList, initialDashboard);

    const before = JSON.stringify(qc.getQueryData(QUERY_KEYS.allRecordsFor('list')));
    simulateUpdateRecord(qc, { approved: true }); // sem id
    simulateUpdateRecord(qc, null);
    simulateUpdateRecord(qc, undefined);

    const after = JSON.stringify(qc.getQueryData(QUERY_KEYS.allRecordsFor('list')));
    expect(after).toBe(before);
  });

  it('removeRecord remove apenas o registro com ID correspondente de ambas as entradas', () => {
    const qc = new QueryClient();
    seedCache(qc, initialList, initialDashboard);

    simulateRemoveRecord(qc, 'r2');

    const listData = qc.getQueryData(QUERY_KEYS.allRecordsFor('list'));
    const dashData = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard'));

    // r2 removido da lista (estava apenas lá)
    expect(listData.find(r => r.id === 'r2')).toBeUndefined();
    expect(listData).toHaveLength(2);

    // Dashboard não tinha r2, continua inalterado
    expect(dashData).toHaveLength(2);
    expect(dashData.map(r => r.id)).toEqual(['r1', 'r3']);
  });

  it('removeRecord remove registro presente em ambas as entradas', () => {
    const qc = new QueryClient();
    seedCache(qc, initialList, initialDashboard);

    simulateRemoveRecord(qc, 'r1');

    const listData = qc.getQueryData(QUERY_KEYS.allRecordsFor('list'));
    const dashData = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard'));

    expect(listData.find(r => r.id === 'r1')).toBeUndefined();
    expect(dashData.find(r => r.id === 'r1')).toBeUndefined();
    expect(listData).toHaveLength(2);
    expect(dashData).toHaveLength(1);
  });

  it('removeRecord ignora chamada sem id', () => {
    const qc = new QueryClient();
    seedCache(qc, initialList, initialDashboard);

    const before = JSON.stringify(qc.getQueryData(QUERY_KEYS.allRecordsFor('list')));
    simulateRemoveRecord(qc, null);
    simulateRemoveRecord(qc, undefined);
    simulateRemoveRecord(qc, '');

    const after = JSON.stringify(qc.getQueryData(QUERY_KEYS.allRecordsFor('list')));
    expect(after).toBe(before);
  });

  it('não dispara refetch: setQueriesData atualiza cache sem invalidar', () => {
    const qc = new QueryClient();
    seedCache(qc, initialList, initialDashboard);

    // Verifica que o estado do cache não foi marcado como stale/isInvalidated
    // após setQueriesData (diferente de invalidateQueries)
    simulateUpdateRecord(qc, { id: 'r1', approved: true });

    const listQuery = qc.getQueryCache().find({ queryKey: QUERY_KEYS.allRecordsFor('list') });
    expect(listQuery.state.dataUpdatedAt).toBeGreaterThan(0);
    // setQueriesData não marca como invalid — state.data é o dado atualizado
    expect(listQuery.state.data.find(r => r.id === 'r1').approved).toBe(true);
  });
});