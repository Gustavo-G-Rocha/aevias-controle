// useEnsaiosList.js — Hook de MeusEnsaios migrado para React Query
// Cache compartilhado com useDashboardData: mesma query key = zero recarregamentos ao navegar

import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserAccessLevel, getAccessibleObraIds } from '@/utils/accessControl';
import { useCurrentUser, useAuxData, useAllRecords, QUERY_KEYS } from '@/hooks/useQueryData';
import { getDataEnsaio } from '@/components/ensaios/ensaioMappers';
import { carregarRegistrosSupervisorService } from '@/services/supervisorRecordsService';

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

export function filtrarPorAcesso(combinedEnsaios, currentUser, currentUserAccessLevel, obrasData, regionaisData, allUsers) {
  if (currentUserAccessLevel === 'admin') return combinedEnsaios;

  // cliente_supervisor: vê TODOS os registros de suas obras (incl. pendentes)
  // + registros criados por seus funcionarios_cliente subordinados
  if (currentUserAccessLevel === 'cliente_supervisor') {
    const obrasIds = getAccessibleObraIds(obrasData, regionaisData, currentUser);
    const userEmail = (currentUser.email || '').toLowerCase();
    const subordinateEmails = new Set(
      (allUsers || [])
        .filter(u => u.access_level === 'funcionarios_cliente' && (u.supervisor_email || '').toLowerCase() === userEmail)
        .map(u => (u.email || '').toLowerCase())
        .filter(Boolean)
    );
    return combinedEnsaios.filter(e =>
      obrasIds.has(e.obra_id) ||
      (e.created_by && subordinateEmails.has(e.created_by.toLowerCase()))
    );
  }

  // Normaliza para nível efetivo (funcionarios_cliente→user)
  const effectiveLevel = currentUserAccessLevel === 'funcionarios_cliente' ? 'user'
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

// Hook específico para cliente_supervisor: busca registros via backend function
// que usa asServiceRole, contornando o RLS que não retorna registros de subordinados
function useSupervisorRecords(user, enabled) {
  return useQuery({
    queryKey: ['supervisorRecords', user?.email],
    queryFn: () => carregarRegistrosSupervisorService(),
    enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useEnsaiosList() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true, needsUsers: true });

  const currentUserAccessLevel = user ? getUserAccessLevel(user) : null;
  const isSupervisor = currentUserAccessLevel === 'cliente_supervisor';

  // Para cliente_supervisor: usa backend function (asServiceRole) em vez de SDK direto
  const { data: allRecords, isLoading: loadingRecords } = useAllRecords('list');
  const { data: supervisorRecords, isLoading: loadingSupervisorRecords } = useSupervisorRecords(user, isSupervisor);

  // Invalida ambos os caches para forçar recarregamento após ações (aprovar/excluir)
  const reload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords });
    queryClient.invalidateQueries({ queryKey: ['supervisorRecords'] });
  }, [queryClient]);

  const loading = loadingUser || loadingAux || (isSupervisor ? loadingSupervisorRecords : loadingRecords);

  // Campos específicos que filtrarPorAcesso consome — referências estáveis do React Query
  const obras = auxData?.obras;
  const regionais = auxData?.regionais;
  const allUsers = auxData?.users ?? [];

  // Para supervisor: os registros já vêm filtrados do backend (obras + subordinados)
  // Para outros: usa filtrarPorAcesso no frontend
  const ensaios = useMemo(() => {
    if (!user || !obras) return [];

    const records = isSupervisor ? (supervisorRecords ?? []) : (allRecords ?? []);
    if (!records.length) return [];

    // Supervisor: registros já vêm filtrados do backend, só ordenar
    if (isSupervisor) {
      return sortByEnsaioDate(records);
    }

    const filtered = filtrarPorAcesso(
      records,
      user,
      currentUserAccessLevel,
      obras,
      regionais ?? [],
      allUsers
    );
    return sortByEnsaioDate(filtered);
  }, [user, currentUserAccessLevel, allRecords, supervisorRecords, obras, regionais, allUsers, isSupervisor]);

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