// useQueryData.js — Hooks centralizados com React Query
// Cache compartilhado: Dashboard e MeusEnsaios reutilizam os mesmos dados em memória
// sem refazer chamadas ao banco enquanto os dados forem "frescos" (staleTime: 3min)

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { loadAllRecords, loadAuxData } from '@/services/recordsService';

// ─── Query Keys canônicas ──────────────────────────────────────────────────────
export const QUERY_KEYS = {
  currentUser:   ['currentUser'],
  auxData:       (opts = {}) => ['auxData', opts],
  allRecords:    ['allRecords'],          // prefix para invalidação (invalida todos os modos)
  allRecordsFor: (mode) => ['allRecords', mode], // key específica por contexto
  recordsByObra: (obraId) => ['recordsByObra', obraId],
};

// ─── Usuário autenticado ───────────────────────────────────────────────────────
export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 1000, // 30s — access_level pode mudar via admin; precisa estar fresco
    refetchOnMount: true,
  });
}

// ─── Dados auxiliares (Obras, Projetos, Regionais, Usuários) ──────────────────
export function useAuxData({ needsRegionais = true, needsUsers = false } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.auxData({ needsRegionais, needsUsers }),
    queryFn: () => loadAuxData({ needsRegionais, needsUsers }),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// ─── Todos os registros — cache único compartilhado ───────────────────────────
export function useAllRecords(mode = 'list') {
  return useQuery({
    queryKey: QUERY_KEYS.allRecordsFor(mode),
    queryFn: () => loadAllRecords(mode),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// ─── Atualização granular de cache ─────────────────────────────────────────────
// Substitui/remove um único registro em TODAS as entradas de cache allRecords
// (['allRecords','list'] e ['allRecords','dashboard']) via setQueriesData,
// sem disparar refetch da coleção inteira.
//
// Uso: após aprovar/reprovar/excluir um ensaio, chamar updateRecord(updatedRecord)
// ou removeRecord(id) — a UI re-renderiza apenas o item afetado, e agregados
// derivados (dashboard stats/charts) recomputam in-memory a partir do cache atualizado.
export function useRecordCacheUpdate() {
  const queryClient = useQueryClient();

  const updateRecord = useCallback((updatedRecord) => {
    if (!updatedRecord?.id) return;
    // Atualiza cache allRecords (admin, gestor, sala_tecnica, laboratorista)
    queryClient.setQueriesData(
      { queryKey: QUERY_KEYS.allRecords },
      (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(r =>
          r.id === updatedRecord.id ? { ...r, ...updatedRecord } : r
        );
      }
    );
    // Atualiza cache supervisorRecords (cliente_supervisor)
    queryClient.setQueriesData(
      { queryKey: ['supervisorRecords'] },
      (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(r =>
          r.id === updatedRecord.id ? { ...r, ...updatedRecord } : r
        );
      }
    );
  }, [queryClient]);

  const removeRecord = useCallback((recordId) => {
    if (!recordId) return;
    queryClient.setQueriesData(
      { queryKey: QUERY_KEYS.allRecords },
      (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter(r => r.id !== recordId);
      }
    );
    queryClient.setQueriesData(
      { queryKey: ['supervisorRecords'] },
      (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter(r => r.id !== recordId);
      }
    );
  }, [queryClient]);

  return { updateRecord, removeRecord };
}