// useQueryData.js — Hooks centralizados com React Query
// Cache compartilhado: Dashboard e MeusEnsaios reutilizam os mesmos dados em memória
// sem refazer chamadas ao banco enquanto os dados forem "frescos" (staleTime: 3min)

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { loadAllRecords, loadAuxData } from '@/services/recordsService';
import { saveDataCache, getDataCache } from '@/services/offlineStorageService';
import { useOfflineDetection } from './useOfflineDetection';
import { logger } from '@/utils/logger';

// ─── Query Keys canônicas ──────────────────────────────────────────────────────
export const QUERY_KEYS = {
  currentUser:   ['currentUser'],
  auxData:       (opts = {}) => ['auxData', opts],
  allRecords:    ['allRecords'],          // prefix para invalidação (invalida todos os modos)
  allRecordsFor: (mode) => ['allRecords', mode], // key específica por contexto
  recordsByObra: (obraId) => ['recordsByObra', obraId],
};

// ─── Usuário autenticado ───────────────────────────────────────────────────────
// Quando offline: lê do cache para manter a identidade e nível de acesso.
export function useCurrentUser() {
  const { isOnline } = useOfflineDetection();
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: async () => {
      if (!isOnline) {
        const cached = await getDataCache('currentUser');
        if (cached) {
          logger.log('[useQueryData] Offline — lendo usuário do cache');
          return cached.data;
        }
        throw new Error('Offline e sem cache de usuário');
      }
      try {
        const user = await base44.auth.me();
        saveDataCache('currentUser', user, 'auth').catch(() => {});
        return user;
      } catch (e) {
        // Erro de autenticação real: propaga. Falha de rede (navigator.onLine
        // mentiu — comum em mobile): usa o cache para não deslogar o usuário.
        if (e?.status === 401 || e?.status === 403) throw e;
        const cached = await getDataCache('currentUser');
        if (cached) {
          logger.warn('[useQueryData] Rede falhou — usando usuário do cache');
          return cached.data;
        }
        throw e;
      }
    },
    staleTime: 30 * 1000, // 30s — access_level pode mudar via admin; precisa estar fresco
    refetchOnMount: true,
  });
}

// ─── Dados auxiliares (Obras, Projetos, Regionais, Usuários) ──────────────────
// Quando online: busca do servidor e salva no cache offline (IndexedDB).
// Quando offline: lê do cache offline para visualização.
export function useAuxData({ needsRegionais = true, needsUsers = false } = {}) {
  const { isOnline } = useOfflineDetection();
  return useQuery({
    queryKey: QUERY_KEYS.auxData({ needsRegionais, needsUsers }),
    queryFn: async () => {
      const cacheKey = `auxData:${needsRegionais ? 'R' : ''}${needsUsers ? 'U' : ''}`;
      const readCache = () => getDataCache(cacheKey);
      if (!isOnline) {
        const cached = await readCache();
        if (cached) {
          logger.log('[useQueryData] Offline — lendo dados auxiliares do cache');
          return cached.data;
        }
        return { obras: [], projects: [], regionais: [], users: [] };
      }
      try {
        const data = await loadAuxData({ needsRegionais, needsUsers });
        const hasData = data.obras.length > 0 || data.regionais.length > 0 || data.projects.length > 0;
        if (hasData) {
          // Só sobrescreve o cache com dados reais — nunca com listas vazias
          // vindas de uma rede instável (loadAuxData engole falhas por entidade).
          saveDataCache(cacheKey, data, 'auxData').catch(() => {});
          saveDataCache('auxData:obras', data.obras, 'auxData').catch(() => {});
          saveDataCache('auxData:regionais', data.regionais, 'auxData').catch(() => {});
          saveDataCache('auxData:projects', data.projects, 'auxData').catch(() => {});
          return data;
        }
        // Tudo veio vazio (provável falha de rede silenciosa) — prefere o cache.
        const cached = await readCache();
        if (cached?.data && (cached.data.obras?.length || cached.data.regionais?.length)) {
          logger.warn('[useQueryData] Dados auxiliares vazios da rede — usando cache');
          return cached.data;
        }
        return data;
      } catch (e) {
        const cached = await readCache();
        if (cached) {
          logger.warn('[useQueryData] Rede falhou — dados auxiliares do cache');
          return cached.data;
        }
        throw e;
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// ─── Todos os registros — cache único compartilhado ───────────────────────────
// Quando online: busca do servidor e salva no cache offline (IndexedDB).
// Quando offline: lê do cache offline para visualização.
export function useAllRecords(mode = 'list') {
  const { isOnline } = useOfflineDetection();
  return useQuery({
    queryKey: QUERY_KEYS.allRecordsFor(mode),
    queryFn: async () => {
      if (!isOnline) {
        const cached = await getDataCache(`records:${mode}`);
        if (cached) {
          logger.log(`[useQueryData] Offline — lendo registros do cache (${mode})`);
          return cached.data;
        }
        return [];
      }
      try {
        const data = await loadAllRecords(mode);
        if (data.length > 0) {
          saveDataCache(`records:${mode}`, data, 'records').catch(() => {});
          return data;
        }
        // Zero registros pode ser falha de rede silenciosa — prefere o cache.
        const cached = await getDataCache(`records:${mode}`);
        if (cached?.data?.length) {
          logger.warn(`[useQueryData] Registros vazios da rede — usando cache (${mode})`);
          return cached.data;
        }
        return data;
      } catch (e) {
        const cached = await getDataCache(`records:${mode}`);
        if (cached) {
          logger.warn(`[useQueryData] Rede falhou — registros do cache (${mode})`);
          return cached.data;
        }
        throw e;
      }
    },
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

  // Snapshot/restore para atualizações OTIMISTAS: captura o estado atual dos
  // caches de registros antes de aplicar a mudança otimista; em caso de erro
  // da API, restaura o snapshot revertendo a UI.
  const snapshotRecords = useCallback(() => {
    return [
      ...queryClient.getQueriesData({ queryKey: QUERY_KEYS.allRecords }),
      ...queryClient.getQueriesData({ queryKey: ['supervisorRecords'] }),
    ];
  }, [queryClient]);

  const restoreRecords = useCallback((snapshot) => {
    if (!snapshot) return;
    snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
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

  return { updateRecord, removeRecord, snapshotRecords, restoreRecords };
}