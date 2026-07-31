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

// True se o cache auxiliar contém dados úteis (não vazio/poisoned).
const hasAuxContent = (d) => !!(d && (d.obras?.length || d.regionais?.length));

/**
 * Lê dados auxiliares do IndexedDB com cadeia de fallback:
 * 1. chave composta exata do consumidor (ex: 'auxData:R')
 * 2. variantes compostas mais completas ('auxData:RU', 'auxData:R') — um
 *    superset dos dados serve para qualquer consumidor
 * 3. montagem a partir das chaves individuais ('auxData:obras', etc.)
 * Evita que um formulário aberto offline fique sem obras só porque a SUA
 * chave composta específica nunca foi gravada (ex: Dashboard grava
 * 'auxData:' enquanto os formulários leem 'auxData:R').
 */
async function readAuxCacheWithFallback(cacheKey) {
  const keys = [cacheKey, 'auxData:RU', 'auxData:R'];
  for (const key of [...new Set(keys)]) {
    const cached = await getDataCache(key).catch(() => null);
    if (hasAuxContent(cached?.data)) return cached.data;
  }
  const [obras, regionais, projects] = await Promise.all([
    getDataCache('auxData:obras').catch(() => null),
    getDataCache('auxData:regionais').catch(() => null),
    getDataCache('auxData:projects').catch(() => null),
  ]);
  const assembled = {
    obras: obras?.data ?? [],
    regionais: regionais?.data ?? [],
    projects: projects?.data ?? [],
    users: [],
  };
  return hasAuxContent(assembled) ? assembled : null;
}

export function useAuxData({ needsRegionais = true, needsUsers = false } = {}) {
  const { isOnline } = useOfflineDetection();
  return useQuery({
    queryKey: QUERY_KEYS.auxData({ needsRegionais, needsUsers }),
    queryFn: async () => {
      const cacheKey = `auxData:${needsRegionais ? 'R' : ''}${needsUsers ? 'U' : ''}`;
      const readCache = () => readAuxCacheWithFallback(cacheKey);
      if (!isOnline) {
        const cached = await readCache();
        if (cached) {
          logger.log('[useQueryData] Offline — lendo dados auxiliares do cache');
          return cached;
        }
        return { obras: [], projects: [], regionais: [], users: [] };
      }
      try {
        const { _failures = [], ...data } = await loadAuxData({ needsRegionais, needsUsers });
        // Falha essencial: Obra ou Regional (quando pedida) rejeitou na rede.
        // Sem regionais, usuários não-admin ficam sem NENHUMA obra nos
        // formulários (ex: Diário de Obra) — não pode passar silenciosamente.
        const essentialFailed = _failures.includes('obras') || _failures.includes('regionais');
        const hasData = data.obras.length > 0 || data.regionais.length > 0 || data.projects.length > 0;

        // Salva no cache apenas as partes que vieram frescas — nunca listas
        // vazias de uma rede instável, e nunca a chave composta com dados
        // incompletos (poisoning do fallback offline).
        if (data.obras.length) saveDataCache('auxData:obras', data.obras, 'auxData').catch(() => {});
        if (needsRegionais && data.regionais.length) saveDataCache('auxData:regionais', data.regionais, 'auxData').catch(() => {});
        if (data.projects.length) saveDataCache('auxData:projects', data.projects, 'auxData').catch(() => {});

        if (hasData && !essentialFailed) {
          saveDataCache(cacheKey, data, 'auxData').catch(() => {});
          return data;
        }

        // Dados incompletos (falha parcial) ou tudo vazio — completa com cache.
        const cached = await readCache();
        if (cached) {
          if (!essentialFailed) {
            logger.warn('[useQueryData] Dados auxiliares vazios da rede — usando cache');
            return cached;
          }
          logger.warn(`[useQueryData] Falha parcial (${_failures.join(', ')}) — completando com cache`);
          return {
            ...data,
            obras: _failures.includes('obras') ? (cached.obras ?? []) : data.obras,
            regionais: _failures.includes('regionais') ? (cached.regionais ?? []) : data.regionais,
            projects: _failures.includes('projects') ? (cached.projects ?? []) : data.projects,
            users: _failures.includes('users') ? (cached.users ?? []) : data.users,
          };
        }
        // Falha essencial e sem cache — lança para o React Query re-tentar
        // automaticamente em vez de manter dropdowns vazios por 10 minutos.
        if (essentialFailed) {
          throw new Error('Falha ao carregar obras/regionais — tentando novamente');
        }
        return data;
      } catch (e) {
        const cached = await readCache();
        if (cached) {
          logger.warn('[useQueryData] Rede falhou — dados auxiliares do cache');
          return cached;
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
export function useAllRecords(mode = 'list', { createdBy = null, enabled = true } = {}) {
  const { isOnline } = useOfflineDetection();
  // Cache separado por autor: o conjunto filtrado (registros do próprio usuário)
  // não pode sobrescrever o cache global usado por admin/gestor.
  const cacheKey = createdBy ? `records:${mode}:${createdBy}` : `records:${mode}`;
  return useQuery({
    queryKey: createdBy ? [...QUERY_KEYS.allRecordsFor(mode), createdBy] : QUERY_KEYS.allRecordsFor(mode),
    enabled,
    queryFn: async () => {
      if (!isOnline) {
        const cached = await getDataCache(cacheKey);
        if (cached) {
          logger.log(`[useQueryData] Offline — lendo registros do cache (${mode})`);
          return cached.data;
        }
        return [];
      }
      try {
        const data = await loadAllRecords(mode, undefined, { createdBy });
        if (data.length > 0) {
          saveDataCache(cacheKey, data, 'records').catch(() => {});
          return data;
        }
        // Zero registros pode ser falha de rede silenciosa — prefere o cache.
        const cached = await getDataCache(cacheKey);
        if (cached?.data?.length) {
          logger.warn(`[useQueryData] Registros vazios da rede — usando cache (${mode})`);
          return cached.data;
        }
        return data;
      } catch (e) {
        const cached = await getDataCache(cacheKey);
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