// Hook customizado para gerenciar estado de filtros de tabela
import { useState, useCallback, useMemo } from 'react';
import { getDataEnsaio } from '@/components/ensaios/ensaioMappers';
import { getLocalInfo, getLaboratoristaInfo, getEmpireiteiraInfo } from '@/components/ensaios/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export function useTableFilters(ensaios, obras, projects, allUsers, applyCustomFilters = null) {
  const [nomeFilter, setNomeFilter] = useState('');
  const [obraFilter, setObraFilter] = useState('');
  const [projetoFilter, setProjetoFilter] = useState('');
  const [localFilter, setLocalFilter] = useState('');
  const [empreiteiraFilter, setEmpreiteiraFilter] = useState('');

  // Debounce dos filtros de texto para evitar recálculo a cada tecla
  const nomeFilterDebounced = useDebouncedValue(nomeFilter, 250);
  const obraFilterDebounced = useDebouncedValue(obraFilter, 250);
  const projetoFilterDebounced = useDebouncedValue(projetoFilter, 250);
  const localFilterDebounced = useDebouncedValue(localFilter, 250);
  const empreiteiraFilterDebounced = useDebouncedValue(empreiteiraFilter, 250);
  const [dataInicioFilter, setDataInicioFilter] = useState('');
  const [dataFimFilter, setDataFimFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Índices O(1) para evitar .find() dentro de useMemo/loops
  const obrasMap = useMemo(() => new Map(obras.map((o) => [o.id, o])), [obras]);
  const projectsMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : prev === 'asc' ? null : 'desc'));
  }, []);

  const filteredEnsaios = useMemo(() => {
    let filtered = ensaios;
    
    if (nomeFilterDebounced) filtered = filtered.filter((e) => getLaboratoristaInfo(e, allUsers).toLowerCase().includes(nomeFilterDebounced.toLowerCase()));
    if (obraFilterDebounced) filtered = filtered.filter((e) => {
      const o = obrasMap.get(e.obra_id);
      return o?.name?.toLowerCase().includes(obraFilterDebounced.toLowerCase()) || o?.code?.toLowerCase().includes(obraFilterDebounced.toLowerCase());
    });
    if (projetoFilterDebounced) filtered = filtered.filter((e) => {
      if (!e.project_id) return false;
      const p = projectsMap.get(e.project_id);
      return p?.name?.toLowerCase().includes(projetoFilterDebounced.toLowerCase());
    });
    if (localFilterDebounced) filtered = filtered.filter((e) => {
      const li = getLocalInfo(e);
      return li.tipo?.toLowerCase().includes(localFilterDebounced.toLowerCase()) || li.detalhes?.toLowerCase().includes(localFilterDebounced.toLowerCase());
    });
    if (empreiteiraFilterDebounced) filtered = filtered.filter((e) => getEmpireiteiraInfo(e)?.toLowerCase().includes(empreiteiraFilterDebounced.toLowerCase()) ?? false);
    
    if (dataInicioFilter) {
      const d = new Date(dataInicioFilter);
      d.setHours(0, 0, 0, 0);
      filtered = filtered.filter((e) => {
        const de = getDataEnsaio(e);
        if (!de) return false;
        const ed = new Date(de);
        ed.setHours(0, 0, 0, 0);
        return ed >= d;
      });
    }
    
    if (dataFimFilter) {
      const d = new Date(dataFimFilter);
      d.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => {
        const de = getDataEnsaio(e);
        if (!de) return false;
        const ed = new Date(de);
        ed.setHours(0, 0, 0, 0);
        return ed <= d;
      });
    }

    if (typeFilter && typeFilter !== 'all') filtered = filtered.filter((e) => e.entityType === typeFilter);
    
    if (applyCustomFilters) filtered = applyCustomFilters(filtered);
    
    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const dA = new Date(getDataEnsaio(a)), dB = new Date(getDataEnsaio(b));
        if (isNaN(dA) || isNaN(dB)) return 0;
        return sortOrder === 'asc' ? dA - dB : dB - dA;
      });
    }
    
    return filtered;
  }, [ensaios, nomeFilterDebounced, obraFilterDebounced, projetoFilterDebounced, localFilterDebounced, empreiteiraFilterDebounced, dataInicioFilter, dataFimFilter, typeFilter, obrasMap, projectsMap, sortOrder, allUsers, applyCustomFilters]);

  const clearFilters = useCallback(() => {
    setNomeFilter('');
    setObraFilter('');
    setProjetoFilter('');
    setLocalFilter('');
    setEmpreiteiraFilter('');
    setDataInicioFilter('');
    setDataFimFilter('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSortOrder('desc');
    setCurrentPage(1);
  }, []);

  const isAnyFilterActive = !!(nomeFilter || obraFilter || projetoFilter || localFilter || empreiteiraFilter || dataInicioFilter || dataFimFilter || typeFilter !== 'all');

  const totalPages = Math.ceil(filteredEnsaios.length / itemsPerPage);
  const paginatedEnsaios = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEnsaios.slice(start, start + itemsPerPage);
  }, [filteredEnsaios, currentPage]);

  return {
    // State
    nomeFilter, setNomeFilter,
    obraFilter, setObraFilter,
    projetoFilter, setProjetoFilter,
    localFilter, setLocalFilter,
    empreiteiraFilter, setEmpreiteiraFilter,
    dataInicioFilter, setDataInicioFilter,
    dataFimFilter, setDataFimFilter,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    sortOrder, setSortOrder,
    currentPage, setCurrentPage,
    // Computed
    filteredEnsaios,
    paginatedEnsaios,
    totalPages,
    isAnyFilterActive,
    // Methods
    toggleSortOrder,
    clearFilters,
  };
}