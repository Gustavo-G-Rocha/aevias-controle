// useEnsaiosList.js — Hook de MeusEnsaios migrado para React Query
// Cache compartilhado com useDashboardData: mesma query key = zero recarregamentos ao navegar

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getUserAccessLevel, getEffectiveAccessLevel, getAccessibleObraIds } from '@/utils/accessControl';
import { useCurrentUser, useAuxData, useAllRecords, QUERY_KEYS } from '@/hooks/useQueryData';
import { getDataEnsaio } from '@/components/ensaios/ensaioMappers';

export function sortByEnsaioDate(records) {
  return [...records].sort((a, b) => {
    const dateA = new Date(getDataEnsaio(a));
    const dateB = new Date(getDataEnsaio(b));
    const aValid = !isNaN(dateA.getTime());
    const bValid = !isNaN(dateB.getTime());
    if (aValid && bValid) {
      const diff = dateB.getTime() - dateA.getTime();
      return diff !== 0 ? diff : new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime();
    }
    return aValid ? -1 : 1;
  });
}

export function filtrarPorAcesso(combinedEnsaios, currentUser, currentUserAccessLevel, obrasData, regionaisData) {
  if (currentUserAccessLevel === 'admin') return combinedEnsaios;

  // Normaliza para nível efetivo (cliente_supervisor→cliente, funcionarios_cliente→user)
  const effectiveLevel = currentUserAccessLevel === 'cliente_supervisor' ? 'cliente'
    : currentUserAccessLevel === 'funcionarios_cliente' ? 'user'
    : currentUserAccessLevel;

  if (['cliente', 'sala_tecnica_afirmaevias', 'gestor_contrato'].includes(effectiveLevel)) {
    const obrasIds = getAccessibleObraIds(obrasData, regionaisData, currentUser);
    return effectiveLevel === 'cliente'
      ? combinedEnsaios.filter(e => obrasIds.has(e.obra_id) && (e.approved === true || e.client_signature?.signed_by))
      : combinedEnsaios.filter(e => obrasIds.has(e.obra_id));
  }

  // Laboratorista: próprios registros
  // Garantia simétrica: se currentUser.email for undefined/null, emailMatch é false
  // (evita que undefined === undefined retorne true e mostre registros de terceiros).
  return combinedEnsaios.filter(e => {
    const emailMatch =
      currentUser.email != null &&
      e.created_by != null &&
      e.created_by.toLowerCase() === currentUser.email.toLowerCase();
    const nameMatch =
      currentUser.laboratorista_name &&
      e.laboratorista_name?.toLowerCase() === currentUser.laboratorista_name?.toLowerCase();
    return emailMatch || nameMatch;
  });
}

export function useEnsaiosList() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true, needsUsers: true });
  const { data: allRecords, isLoading: loadingRecords } = useAllRecords('list');

  // Invalida o cache de registros para forçar recarregamento após ações (aprovar/excluir)
  const reload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords });
  }, [queryClient]);

  const loading = loadingUser || loadingAux || loadingRecords;

  // Campos específicos que filtrarPorAcesso consome — referências estáveis do React Query
  const obras = auxData?.obras;
  const regionais = auxData?.regionais;
  const currentUserAccessLevel = user ? getEffectiveAccessLevel(user) : null;

  // Memoização com dependências reais: só recalcula a cascata regionais→obras→ensaios
  // quando user, accessLevel, allRecords, obras ou regionais mudam de referência.
  const ensaios = useMemo(() => {
    if (!user || !obras || !allRecords) return [];

    const filtered = filtrarPorAcesso(
      allRecords,
      user,
      currentUserAccessLevel,
      obras,
      regionais ?? []
    );
    return sortByEnsaioDate(filtered);
  }, [user, currentUserAccessLevel, allRecords, obras, regionais]);

  return {
    ensaios,
    obras: obras ?? [],
    projects: auxData?.projects ?? [],
    allUsers: auxData?.users ?? [],
    regionais: regionais ?? [],
    user,
    loading,
    reload,
  };
}