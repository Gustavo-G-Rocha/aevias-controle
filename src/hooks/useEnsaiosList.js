// useEnsaiosList.js — Hook de MeusEnsaios migrado para React Query
// Cache compartilhado com useDashboardData: mesma query key = zero recarregamentos ao navegar

import { useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserAccessLevel, getAccessibleObraIds } from '@/utils/accessControl';
import { useCurrentUser, useAuxData, useAllRecords, QUERY_KEYS } from '@/hooks/useQueryData';
import { getDataEnsaio } from '@/components/ensaios/ensaioMappers';
import { carregarRegistrosSupervisorService } from '@/services/supervisorRecordsService';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { saveDataCache, getDataCache, getQueueItemsByStatus } from '@/services/offlineStorageService';

// Itens da fila offline (pending/failed) transformados em registros para exibição.
// Garante que registros salvos offline apareçam em MeusEnsaios enquanto aguardam
// sincronização — confirma a persistência local para o usuário.
const QUEUE_RECORDS_KEY = ['offlineQueueRecords'];
function mapQueueItemToRecord(item) {
  const iso = item.clientUpdatedAt || (item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString());
  return {
    id: item.entityId || `offline-${item.id}`,
    ...item.payload,
    entityType: item.entityType,
    _offline: true,
    _queueId: item.id,
    created_date: item.payload?.created_date || iso,
    updated_date: iso,
  };
}
function useOfflineQueueRecords() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const handler = () => queryClient.invalidateQueries({ queryKey: QUEUE_RECORDS_KEY });
    window.addEventListener('offline-queue-updated', handler);
    return () => window.removeEventListener('offline-queue-updated', handler);
  }, [queryClient]);
  return useQuery({
    queryKey: QUEUE_RECORDS_KEY,
    queryFn: async () => {
      const [pending, failed] = await Promise.all([
        getQueueItemsByStatus('pending'),
        getQueueItemsByStatus('failed'),
      ]);
      return [...pending, ...failed].map(mapQueueItemToRecord);
    },
    staleTime: 5 * 1000,
  });
}

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

export function filtrarPorAcesso(combinedEnsaios, currentUser, currentUserAccessLevel, obrasData, regionaisData, allUsers, backendSubordinateEmails = null) {
  if (currentUserAccessLevel === 'admin') return combinedEnsaios;

  // cliente_supervisor: vê TODOS os registros de suas obras (incl. pendentes)
  // + registros criados por seus funcionarios_cliente subordinados
  if (currentUserAccessLevel === 'cliente_supervisor') {
    // Com registros vindos do backend, o escopo já está resolvido lá (obras de
    // todas as regionais do cliente + subordinados). Aqui só ocultamos rascunhos
    // de terceiros — os demais lotes ficam visíveis em modo consulta.
    if (backendSubordinateEmails !== null) {
      const email = (currentUser.email || '').toLowerCase();
      return combinedEnsaios.filter(e =>
        e.status !== 'rascunho' || (e.created_by || '').toLowerCase() === email
      );
    }
    const obrasIds = getAccessibleObraIds(obrasData, regionaisData, currentUser);
    const userEmail = (currentUser.email || '').toLowerCase();
    // Emails dos subordinados: preferir a lista vinda do backend (asServiceRole),
    // pois o RLS do User impede que um cliente_supervisor liste outros usuários
    // no frontend — allUsers ficava só com o próprio usuário e os registros
    // pendentes dos subordinados sumiam da lista.
    const subordinateEmails = new Set(
      (backendSubordinateEmails && backendSubordinateEmails.length
        ? backendSubordinateEmails
        : (allUsers || [])
            .filter(u => u.access_level === 'funcionarios_cliente' && (u.supervisor_email || '').toLowerCase() === userEmail)
            .map(u => u.email)
      )
        .map(e => (e || '').toLowerCase())
        .filter(Boolean)
    );
    // Obras de regionais onde o usuário é SUPERVISOR (supervisores_responsaveis):
    // tem poder de aprovação, então precisa ver também os registros finalizados
    // pendentes dos inspetores dessas obras — antes ficavam ocultos e ele não
    // conseguia aprová-los.
    const regionaisSupervisor = (regionaisData || []).filter(r =>
      (r.supervisores_responsaveis || []).some(e => (e || '').toLowerCase() === userEmail)
    );
    const regionaisSupervisorIds = new Set(regionaisSupervisor.map(r => r.id));
    const supervisorObraIds = new Set(
      (obrasData || []).filter(o => regionaisSupervisorIds.has(o.regional_id)).map(o => o.id)
    );
    return combinedEnsaios.filter(e => {
      const isFromObra = obrasIds.has(e.obra_id);
      const isFromSubordinate = e.created_by && subordinateEmails.has(e.created_by.toLowerCase());
      const isApprovedOrSigned = e.approved === true || e.client_signature?.signed_by;
      // Finalizado (não-rascunho) de obra onde é supervisor → mostra (pode aprovar)
      const isFinalizadoDeObraSupervisionada =
        supervisorObraIds.has(e.obra_id) && e.status !== 'rascunho';
      // Aprovados/assinados das suas obras → mostra
      // Pendentes/reprovados → mostra se é supervisor da obra ou criado por subordinado
      return (isFromObra && isApprovedOrSigned) || isFinalizadoDeObraSupervisionada || isFromSubordinate;
    });
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
  const { isOnline } = useOfflineDetection();
  return useQuery({
    queryKey: ['supervisorRecords', user?.email],
    queryFn: async () => {
      if (!isOnline) {
        const cached = await getDataCache(`supervisorRecords:${user?.email}`);
        if (cached) {
          // Compatibilidade com cache antigo (array simples de registros)
          return Array.isArray(cached.data)
            ? { records: cached.data, subordinateEmails: [], truncated: false }
            : { ...cached.data, truncated: cached.data?.truncated ?? false };
        }
        return { records: [], subordinateEmails: [], truncated: false };
      }
        const data = await carregarRegistrosSupervisorService();
      saveDataCache(`supervisorRecords:${user?.email}`, data, 'records').catch(() => {});
      return data;
    },
    enabled,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
  });
}

export function useEnsaiosList() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true, needsUsers: true });

  const currentUserAccessLevel = user ? getUserAccessLevel(user) : null;
  // cliente e cliente_supervisor: usa backend function (asServiceRole) para contornar RLS
  const useBackendRecords = currentUserAccessLevel === 'cliente_supervisor' || currentUserAccessLevel === 'cliente';

  // Inspetor/laboratorista e funcionário do cliente só veem os PRÓPRIOS registros:
  // busca já filtrada no servidor por created_by. Antes o app baixava todas as
  // entidades por inteiro para descartar quase tudo no cliente — no celular isso
  // estourava/falhava e a lista ficava vazia mesmo com registros salvos.
  const ownRecordsOnly = currentUserAccessLevel === 'user' || currentUserAccessLevel === 'funcionarios_cliente';
  const { data: allRecords, isLoading: loadingRecords } = useAllRecords('list', {
    createdBy: ownRecordsOnly ? user?.email : null,
    enabled: !!user,
  });
  const { data: supervisorRecords, isLoading: loadingSupervisorRecords } = useSupervisorRecords(user, useBackendRecords);
  // Registros salvos offline (fila pendente/falha) — mesclados na lista para
  // ficarem visíveis enquanto aguardam sincronização.
  const { data: offlineQueueRecords = [] } = useOfflineQueueRecords();

  // Invalida ambos os caches para forçar recarregamento após ações (aprovar/excluir)
  const reload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords });
    queryClient.invalidateQueries({ queryKey: ['supervisorRecords'] });
  }, [queryClient]);

  const loading = loadingUser || loadingAux || (useBackendRecords ? loadingSupervisorRecords : loadingRecords);

  // Campos específicos que filtrarPorAcesso consome — referências estáveis do React Query
  const obras = auxData?.obras;
  const regionais = auxData?.regionais;
  const allUsers = auxData?.users ?? [];

  // Para supervisor: os registros já vêm filtrados do backend (obras + subordinados)
  // Para outros: usa filtrarPorAcesso no frontend
  const ensaios = useMemo(() => {
    if (!user || !obras) return [];

    const baseRecords = useBackendRecords ? (supervisorRecords?.records ?? []) : (allRecords ?? []);
    const records = [...baseRecords, ...(offlineQueueRecords ?? [])];
    if (!records.length) return [];

    // Supervisor: registros vêm do backend (bypass RLS), mas ainda precisam
    // do filtro de aprovacao do filtrarPorAcesso (aprovados/assinados das obras
    // + pendentes apenas de subordinados). Os emails dos subordinados também
    // vêm do backend, pois o RLS do User impede listá-los no frontend.
    const filtered = filtrarPorAcesso(
      records,
      user,
      currentUserAccessLevel,
      obras,
      regionais ?? [],
      allUsers,
      useBackendRecords ? (supervisorRecords?.subordinateEmails ?? []) : null
    );
    return sortByEnsaioDate(filtered);
  }, [user, currentUserAccessLevel, allRecords, supervisorRecords, offlineQueueRecords, obras, regionais, allUsers, useBackendRecords]);

  return {
    ensaios,
    obras: obras ?? [],
    projects: auxData?.projects ?? [],
    allUsers: auxData?.users ?? [],
    regionais: regionais ?? [],
    user,
    loading,
    truncated: useBackendRecords ? (supervisorRecords?.truncated ?? false) : false,
    // IDs aprováveis calculados no servidor (supervisor do cliente)
    approvableIds: supervisorRecords?.approvableIds ?? null,
    reload,
  };
}