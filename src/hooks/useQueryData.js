// useQueryData.js — Hooks centralizados com React Query
// Cache compartilhado: Dashboard e MeusEnsaios reutilizam os mesmos dados em memória
// sem refazer chamadas ao banco enquanto os dados forem "frescos" (staleTime: 3min)

import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { loadAllRecords, loadAuxData } from '@/services/recordsService';

// ─── Query Keys canônicas ──────────────────────────────────────────────────────
export const QUERY_KEYS = {
  currentUser:   ['currentUser'],
  auxData:       (opts = {}) => ['auxData', opts],
  allRecords:    ['allRecords'],          // prefix para invalidação (invalida todos os modos)
  allRecordsFor: (mode) => ['allRecords', mode], // key específica por contexto (dashboard vs list)
  recordsByObra: (obraId) => ['recordsByObra', obraId],
};

// ─── Usuário autenticado ───────────────────────────────────────────────────────
export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000, // usuário muda pouco — 5 min
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