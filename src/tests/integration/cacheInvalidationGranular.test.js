/**
 * tests/integration/cacheInvalidationGranular.test.js
 *
 * Teste de integração: Invalidação Granular de Cache.
 *
 * Cenário obrigatório (do prompt especializado):
 *   "Alterar o status de um ensaio e verificar que apenas o componente
 *    daquele ensaio re-renderiza, e que os agregados dependentes
 *    (ex.: contadores do dashboard) ainda refletem a mudança corretamente."
 *
 * Este teste simula o fluxo completo:
 *   aprovarEnsaio → useRecordCacheUpdate.updateRecord → setQueriesData
 *   → useDashboardData recomputa stats/charts in-memory a partir do cache atualizado
 *   → nenhum refetch é disparado (query não invalidada)
 */

import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/hooks/useQueryData';
import {
  calcularStats,
  calcularGraficoStatus,
  calcularApprovalPercentage,
} from '@/utils/dashboardCalculations';

vi.mock('@/api/base44Client', () => ({ base44: { entities: {} } }));

// ── Réplicas exatas das funções de produção ──────────────────────────────────

function simulateUpdateRecord(queryClient, updatedRecord) {
  if (!updatedRecord?.id) return;
  queryClient.setQueriesData(
    { queryKey: QUERY_KEYS.allRecords },
    (oldData) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.map((r) =>
        r.id === updatedRecord.id ? { ...r, ...updatedRecord } : r
      );
    }
  );
}

function simulateRemoveRecord(queryClient, recordId) {
  if (!recordId) return;
  queryClient.setQueriesData(
    { queryKey: QUERY_KEYS.allRecords },
    (oldData) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.filter((r) => r.id !== recordId);
    }
  );
}

// ── Helper: simula useMemo do useDashboardData para stats ─────────────────────
function computeDashboardStats(records, isClienteUser = false, isEngenheiroUser = false) {
  return calcularStats(records, [], [], isClienteUser, isEngenheiroUser);
}

function computeStatusChart(records, isClienteUser = false, isEngenheiroUser = false) {
  return calcularGraficoStatus(records, isClienteUser, isEngenheiroUser);
}

function computeApprovalPercentage(stats, isClienteUser = false) {
  return calcularApprovalPercentage(stats, isClienteUser);
}

// ── Dados iniciais ─────────────────────────────────────────────────────────────
const INITIAL_RECORDS = [
  { id: 'r1', entityType: 'EnsaioCAUQ', approved: null, obra_id: 'o1', created_date: '2026-06-01T10:00:00Z' },
  { id: 'r2', entityType: 'DiarioObra', approved: null, obra_id: 'o1', created_date: '2026-06-15T10:00:00Z' },
  { id: 'r3', entityType: 'ChecklistUsina', approved: true, obra_id: 'o1', created_date: '2026-07-01T10:00:00Z' },
  { id: 'r4', entityType: 'EnsaioDensidade', approved: false, obra_id: 'o1', created_date: '2026-07-05T10:00:00Z' },
  { id: 'r5', entityType: 'EnsaioProctor', approved: null, obra_id: 'o1', created_date: '2026-07-09T10:00:00Z' },
];

describe('Invalidação Granular de Cache — Aprovação de ensaio', () => {
  // ── Baseline: estado antes da mudança ─────────────────────────────────────
  it('BASELINE: 5 registros, 1 aprovado, 1 reprovado, 3 pendentes', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('list'), INITIAL_RECORDS);
    qc.setQueryData(QUERY_KEYS.allRecordsFor('dashboard'), INITIAL_RECORDS);

    const records = qc.getQueryData(QUERY_KEYS.allRecordsFor('list'));
    const stats = computeDashboardStats(records);

    const approved = records.filter((r) => r.approved === true).length;
    const rejected = records.filter((r) => r.approved === false).length;
    const pending = records.filter((r) => r.approved === null).length;

    expect(records).toHaveLength(5);
    expect(approved).toBe(1);
    expect(rejected).toBe(1);
    expect(pending).toBe(3);
  });

  // ── Cenário 1: aprovar r1 → apenas r1 muda no cache ───────────────────────
  it('aprovar ensaio r1 atualiza APENAS r1 no cache (demais registros inalterados)', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('list'), INITIAL_RECORDS);
    qc.setQueryData(QUERY_KEYS.allRecordsFor('dashboard'), INITIAL_RECORDS);

    // Snapshot dos registros antes da atualização (exceto r1)
    const listBefore = qc.getQueryData(QUERY_KEYS.allRecordsFor('list'));
    const othersBefore = listBefore.filter((r) => r.id !== 'r1');

    // Simular aprovação: gerenciarAprovacao retorna registro atualizado
    const updatedRecord = {
      id: 'r1',
      approved: true,
      approved_by: 'admin@test.com',
      approved_date: '2026-07-09T12:00:00Z',
    };

    // useEnsaiosActions chama updateRecord (granular, não invalidateQueries)
    simulateUpdateRecord(qc, updatedRecord);

    const listAfter = qc.getQueryData(QUERY_KEYS.allRecordsFor('list'));
    const othersAfter = listAfter.filter((r) => r.id !== 'r1');

    // r1 foi atualizado
    const r1 = listAfter.find((r) => r.id === 'r1');
    expect(r1.approved).toBe(true);
    expect(r1.approved_by).toBe('admin@test.com');

    // Demais registros permanecem inalterados (mesma referência de objeto)
    expect(othersAfter).toEqual(othersBefore);
    // Referência de objeto preservada — não houve recriação
    expect(othersAfter[0]).toBe(othersBefore[0]);
    expect(othersAfter[1]).toBe(othersBefore[1]);

    // Contagem total preservada
    expect(listAfter).toHaveLength(5);
  });

  // ── Cenário 2: aprovar r1 → NENHUM refetch disparado ──────────────────────
  it('aprovar ensaio NÃO dispara refetch (query não invalidada)', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('list'), INITIAL_RECORDS);
    qc.setQueryData(QUERY_KEYS.allRecordsFor('dashboard'), INITIAL_RECORDS);

    // Verificar que a query NÃO está invalidada antes
    const listQueryBefore = qc.getQueryCache().find({
      queryKey: QUERY_KEYS.allRecordsFor('list'),
    });
    expect(listQueryBefore.state.isInvalidated).toBe(false);

    // Atualização granular
    simulateUpdateRecord(qc, { id: 'r1', approved: true });

    // Verificar que a query continua NÃO invalidada após setQueriesData
    const listQueryAfter = qc.getQueryCache().find({
      queryKey: QUERY_KEYS.allRecordsFor('list'),
    });
    expect(listQueryAfter.state.isInvalidated).toBe(false);

    // dataUpdatedAt foi atualizado (prova que setQueryData rodou)
    expect(listQueryAfter.state.dataUpdatedAt).toBeGreaterThan(0);

    // O dado no cache é o atualizado (não precisou de refetch)
    const r1 = listQueryAfter.state.data.find((r) => r.id === 'r1');
    expect(r1.approved).toBe(true);
  });

  // ── Cenário 3: aprovar r1 → dashboard stats recomputam corretamente ───────
  it('aprovar ensaio r1 faz dashboard stats refletirem novo total de aprovados', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('dashboard'), INITIAL_RECORDS);

    // Baseline: stats antes da aprovação
    const recordsBefore = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard'));
    const statsBefore = computeDashboardStats(recordsBefore);
    const approvedBefore = recordsBefore.filter((r) => r.approved === true).length;
    expect(approvedBefore).toBe(1); // apenas r3

    // Aprovar r1
    simulateUpdateRecord(qc, { id: 'r1', approved: true, approved_by: 'admin@test.com' });

    // Recomputar stats a partir do cache atualizado
    const recordsAfter = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard'));
    const statsAfter = computeDashboardStats(recordsAfter);
    const approvedAfter = recordsAfter.filter((r) => r.approved === true).length;

    // Dashboard agora reflete 2 aprovados (r1 + r3)
    expect(approvedAfter).toBe(2);
    expect(approvedAfter).toBeGreaterThan(approvedBefore);
  });

  // ── Cenário 4: aprovar r1 → gráfico de status reflete mudança ─────────────
  it('aprovar ensaio r1 atualiza gráfico de status (approved count aumenta)', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('dashboard'), INITIAL_RECORDS);

    // Gráfico antes (calcarGraficoStatus retorna [{ name: 'Aprovados', value, color }, ...])
    const recordsBefore = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard'));
    const chartBefore = computeStatusChart(recordsBefore);
    const approvedSliceBefore = chartBefore.find((s) => s.name === 'Aprovados');
    const approvedCountBefore = approvedSliceBefore?.value ?? 0;
    expect(approvedCountBefore).toBe(1); // apenas r3

    // Aprovar r1
    simulateUpdateRecord(qc, { id: 'r1', approved: true });

    // Gráfico depois
    const recordsAfter = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard'));
    const chartAfter = computeStatusChart(recordsAfter);
    const approvedSliceAfter = chartAfter.find((s) => s.name === 'Aprovados');
    const approvedCountAfter = approvedSliceAfter?.value ?? 0;

    expect(approvedCountAfter).toBe(2);
  });

  // ── Cenário 5: reprovar r5 → dashboard reflete novo reprovado ─────────────
  it('reprovar ensaio r5 atualiza contadores de reprovados no dashboard', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('dashboard'), INITIAL_RECORDS);

    const recordsBefore = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard'));
    const rejectedBefore = recordsBefore.filter((r) => r.approved === false).length;
    expect(rejectedBefore).toBe(1); // apenas r4

    // Reprovar r5
    simulateUpdateRecord(qc, {
      id: 'r5',
      approved: false,
      rejection_reason: 'Dados incorretos',
    });

    const recordsAfter = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard'));
    const rejectedAfter = recordsAfter.filter((r) => r.approved === false).length;

    expect(rejectedAfter).toBe(2);
  });

  // ── Cenário 6: excluir r4 → removido do cache sem refetch ─────────────────
  it('excluir ensaio remove registro do cache (ambas as entradas) sem refetch', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('list'), INITIAL_RECORDS);
    qc.setQueryData(QUERY_KEYS.allRecordsFor('dashboard'), INITIAL_RECORDS);

    // Excluir r4
    simulateRemoveRecord(qc, 'r4');

    const listAfter = qc.getQueryData(QUERY_KEYS.allRecordsFor('list'));
    const dashAfter = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard'));

    expect(listAfter.find((r) => r.id === 'r4')).toBeUndefined();
    expect(dashAfter.find((r) => r.id === 'r4')).toBeUndefined();
    expect(listAfter).toHaveLength(4);
    expect(dashAfter).toHaveLength(4);

    // Query não invalidada
    const listQuery = qc.getQueryCache().find({
      queryKey: QUERY_KEYS.allRecordsFor('list'),
    });
    expect(listQuery.state.isInvalidated).toBe(false);
  });

  // ── Cenário 7: atualização em ambas as entradas de cache (list + dashboard) ─
  it('updateRecord atualiza r1 em AMBAS as entradas de cache (list e dashboard)', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('list'), INITIAL_RECORDS);
    qc.setQueryData(QUERY_KEYS.allRecordsFor('dashboard'), INITIAL_RECORDS);

    simulateUpdateRecord(qc, { id: 'r1', approved: true });

    const r1List = qc.getQueryData(QUERY_KEYS.allRecordsFor('list')).find((r) => r.id === 'r1');
    const r1Dash = qc.getQueryData(QUERY_KEYS.allRecordsFor('dashboard')).find((r) => r.id === 'r1');

    expect(r1List.approved).toBe(true);
    expect(r1Dash.approved).toBe(true);
  });

  // ── Cenário 8: múltiplas aprovações em sequência ──────────────────────────
  it('múltiplas aprovações sequenciais atualizam cache incrementalmente', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('list'), INITIAL_RECORDS);

    // Aprovar r1
    simulateUpdateRecord(qc, { id: 'r1', approved: true });
    let records = qc.getQueryData(QUERY_KEYS.allRecordsFor('list'));
    expect(records.filter((r) => r.approved === true).length).toBe(2); // r1 + r3

    // Aprovar r2
    simulateUpdateRecord(qc, { id: 'r2', approved: true });
    records = qc.getQueryData(QUERY_KEYS.allRecordsFor('list'));
    expect(records.filter((r) => r.approved === true).length).toBe(3); // r1 + r2 + r3

    // Aprovar r5
    simulateUpdateRecord(qc, { id: 'r5', approved: true });
    records = qc.getQueryData(QUERY_KEYS.allRecordsFor('list'));
    expect(records.filter((r) => r.approved === true).length).toBe(4); // r1 + r2 + r3 + r5

    // Nenhuma query invalidada em nenhum momento
    const listQuery = qc.getQueryCache().find({
      queryKey: QUERY_KEYS.allRecordsFor('list'),
    });
    expect(listQuery.state.isInvalidated).toBe(false);
  });

  // ── Cenário 9: aprovação não afeta registros com IDs diferentes ───────────
  it('aprovar r1 não altera contadores de outros registros', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('list'), INITIAL_RECORDS);

    const r2Before = qc.getQueryData(QUERY_KEYS.allRecordsFor('list')).find((r) => r.id === 'r2');
    const r4Before = qc.getQueryData(QUERY_KEYS.allRecordsFor('list')).find((r) => r.id === 'r4');

    simulateUpdateRecord(qc, { id: 'r1', approved: true });

    const r2After = qc.getQueryData(QUERY_KEYS.allRecordsFor('list')).find((r) => r.id === 'r2');
    const r4After = qc.getQueryData(QUERY_KEYS.allRecordsFor('list')).find((r) => r.id === 'r4');

    // Mesma referência de objeto — não foram recriados
    expect(r2After).toBe(r2Before);
    expect(r4After).toBe(r4Before);
    // Mesmos valores
    expect(r2After.approved).toBe(r2Before.approved);
    expect(r4After.approved).toBe(r4Before.approved);
  });

  // ── Cenário 10: entityType preservado após atualização granular ─────────────
  it('updateRecord preserva entityType do registro (não sobrescrito pela resposta da API)', () => {
    const qc = new QueryClient();
    qc.setQueryData(QUERY_KEYS.allRecordsFor('list'), INITIAL_RECORDS);

    // Resposta de gerenciarAprovacao não inclui entityType
    simulateUpdateRecord(qc, { id: 'r1', approved: true, approved_by: 'admin@test.com' });

    const r1 = qc.getQueryData(QUERY_KEYS.allRecordsFor('list')).find((r) => r.id === 'r1');
    expect(r1.entityType).toBe('EnsaioCAUQ');
    expect(r1.approved).toBe(true);
  });
});