/**
 * Hook de carregamento de dados para Dashboard.
 * Cache compartilhado com useEnsaiosList: dados não são recarregados ao navegar entre páginas.
 */
import { useMemo, useState, useCallback } from 'react';
import { subMonths } from 'date-fns';
import { getUserAccessLevel, filterRegionaisByUser, getAccessibleObraIds, isCliente, isEngenheiroCliente } from '@/utils/accessControl';
import {
  calcularStats,
  calcularGraficoMensal,
  calcularGraficoStatus,
  calcularGraficoPorObra,
  calcularGraficoPorTipo,
  calcularApprovalPercentage,
} from '@/utils/dashboardCalculations';
import { useCurrentUser, useAuxData, useAllRecords } from '@/hooks/useQueryData';

const DEFAULT_FILTERS = {
  obraId: null,
  status: null,
  tipoRegistro: null,
  periodo: '6meses',
};

export function useDashboardData() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const userAccessLevel = getUserAccessLevel(user);
  const needsRegionais = ['cliente', 'sala_tecnica_afirmaevias', 'gestor_contrato'].includes(userAccessLevel);

  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais });
  const { data: allRecords = [], isLoading: loadingRecords } = useAllRecords('dashboard');

  const loading = loadingUser || loadingAux || loadingRecords;

  // Aplicar filtros de acesso
  const { obras, projects, ensaios } = useMemo(() => {
    if (!user || !auxData || !allRecords?.length) {
      return { obras: auxData?.obras ?? [], projects: auxData?.projects ?? [], ensaios: [] };
    }

    const isClienteUser = isCliente(user);
    let filteredObras = auxData.obras;
    let filteredProjects = auxData.projects;
    let filteredEnsaios = allRecords;

    if (userAccessLevel === 'user') {
      filteredEnsaios = filteredEnsaios.filter(e => e.created_by === user.email);
    } else if (needsRegionais) {
      const obrasIds = getAccessibleObraIds(auxData.obras, auxData.regionais ?? [], user);
      filteredObras = auxData.obras.filter(o => obrasIds.has(o.id));

      const regionaisDoUsuario = filterRegionaisByUser(auxData.regionais ?? [], user);
      const projectIdsPermitidos = new Set(regionaisDoUsuario.flatMap(r => r.project_ids || []));
      filteredProjects = auxData.projects.filter(p => projectIdsPermitidos.has(p.id));

      filteredEnsaios = isClienteUser
        ? filteredEnsaios.filter(e => obrasIds.has(e.obra_id) && (e.approved === true || e.client_signature?.signed_by))
        : filteredEnsaios.filter(e => obrasIds.has(e.obra_id));
    }

    return { obras: filteredObras, projects: filteredProjects, ensaios: filteredEnsaios };
  }, [user, auxData, allRecords, userAccessLevel, needsRegionais]);

  // Filtrar ensaios de acordo com os filtros ativos
  const filteredEnsaios = useMemo(() => {
    const now = new Date();
    const startDate = filters.periodo === '1mes'
      ? subMonths(now, 1)
      : filters.periodo === '3meses'
        ? subMonths(now, 3)
        : subMonths(now, 6);

    let filtered = ensaios.filter(e => new Date(e.created_date) >= startDate);
    if (filters.obraId) filtered = filtered.filter(e => e.obra_id === filters.obraId);
    if (filters.status === 'approved') filtered = filtered.filter(e => e.approved === true);
    else if (filters.status === 'pending') filtered = filtered.filter(e => e.approved === null);
    else if (filters.status === 'rejected') filtered = filtered.filter(e => e.approved === false);
    if (filters.tipoRegistro) filtered = filtered.filter(e => e.entityType === filters.tipoRegistro);

    return filtered;
  }, [ensaios, filters]);

  const isClienteUser = useMemo(() => isCliente(user), [user]);
  const isEngenheiroUser = useMemo(() => isEngenheiroCliente(user), [user]);

  const stats = useMemo(
    () => calcularStats(filteredEnsaios, obras, projects, isClienteUser, isEngenheiroUser),
    [filteredEnsaios, obras, projects, isClienteUser, isEngenheiroUser]
  );

  const charts = useMemo(() => ({
    monthly: calcularGraficoMensal(filteredEnsaios, filters.periodo, isClienteUser),
    status: calcularGraficoStatus(filteredEnsaios, isClienteUser, isEngenheiroUser),
    porObra: calcularGraficoPorObra(filteredEnsaios, obras),
    porTipo: calcularGraficoPorTipo(filteredEnsaios),
  }), [filteredEnsaios, filters.periodo, obras, isClienteUser, isEngenheiroUser]);

  const approvalPercentage = useMemo(
    () => calcularApprovalPercentage(stats, isClienteUser),
    [stats, isClienteUser]
  );

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const hasActiveFilters = Boolean(filters.obraId || filters.status || filters.tipoRegistro);

  return {
    loading,
    user,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    stats,
    charts,
    approvalPercentage,
    obras,
    isClienteUser,
    isEngenheiroUser,
  };
}