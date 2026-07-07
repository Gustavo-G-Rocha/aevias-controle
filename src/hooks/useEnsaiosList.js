// useEnsaiosList.js — Hook de MeusEnsaios migrado para React Query
// Cache compartilhado com useDashboardData: mesma query key = zero recarregamentos ao navegar

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getUserAccessLevel } from '@/utils/accessControl';
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

  if (currentUserAccessLevel === 'sala_tecnica_afirmaevias') {
    const regionaisDoUsuario = regionaisData.filter(r =>
      (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === currentUser.email.toLowerCase())
    );
    const obrasIds = new Set(
      obrasData.filter(o => regionaisDoUsuario.some(r => r.id === o.regional_id)).map(o => o.id)
    );
    return combinedEnsaios.filter(e => obrasIds.has(e.obra_id));
  }

  if (currentUserAccessLevel === 'gestor_contrato') {
    const regionaisDoUsuario = regionaisData.filter(r => {
      const gestores = r.gestores_contrato_responsaveis || [];
      return (
        r.gestor_contrato_responsavel?.toLowerCase() === currentUser.email.toLowerCase() ||
        gestores.some(e => e.toLowerCase() === currentUser.email.toLowerCase())
      );
    });
    const obrasIds = new Set(
      obrasData.filter(o => regionaisDoUsuario.some(r => r.id === o.regional_id)).map(o => o.id)
    );
    return combinedEnsaios.filter(e => obrasIds.has(e.obra_id));
  }

  if (currentUserAccessLevel === 'cliente') {
    const regionaisDoUsuario = regionaisData.filter(r =>
      (r.clientes_responsaveis || []).some(e => e.toLowerCase() === currentUser.email.toLowerCase())
    );
    const obrasIds = new Set(
      obrasData.filter(o => regionaisDoUsuario.some(r => r.id === o.regional_id)).map(o => o.id)
    );
    return combinedEnsaios.filter(
      e => obrasIds.has(e.obra_id) && (e.approved === true || e.client_signature?.signed_by)
    );
  }

  // Laboratorista: próprios registros
  return combinedEnsaios.filter(e => {
    const emailMatch = e.created_by?.toLowerCase() === currentUser.email?.toLowerCase();
    const nameMatch =
      currentUser.laboratorista_name &&
      e.laboratorista_name?.toLowerCase() === currentUser.laboratorista_name?.toLowerCase();
    return emailMatch || nameMatch;
  });
}

export function useEnsaiosList(maxPages) {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true, needsUsers: true });
  const { data: allRecords, isLoading: loadingRecords } = useAllRecords('list', maxPages);

  // Invalida o cache de registros para forçar recarregamento após ações (aprovar/excluir)
  const reload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords });
  }, [queryClient]);

  const loading = loadingUser || loadingAux || loadingRecords;

  // Campos específicos que filtrarPorAcesso consome — referências estáveis do React Query
  const obras = auxData?.obras;
  const regionais = auxData?.regionais;
  const currentUserAccessLevel = user ? getUserAccessLevel(user) : null;

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