// Hook customizado para gerenciar estado de filtros de tabela
import { useState, useCallback, useMemo } from 'react';
import { getDataEnsaio } from '@/components/ensaios/ensaioMappers';
import { getLocalInfo, getLaboratoristaInfo, getEmpreiteiraInfo } from '@/components/ensaios/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export function useTableFilters(ensaios, obras, projects, allUsers, applyCustomFilters = null, initialType = 'all') {
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
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Índices O(1) para evitar .find() dentro de useMemo/loops
  const obrasMap = useMemo(() => new Map(obras.map((o) => [o.id, o])), [obras]);
  const projectsMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  // Pré-computação de campos derivados — executada apenas quando ensaios/allUsers/obras/projects
  // mudam. Evita chamar getLaboratoristaInfo/getLocalInfo/getEmpreiteiraInfo/getDataEnsaio
  // (incluindo allUsers.find() O(n)) a cada tecla digitada nos filtros.
  const precomputedEnsaios = useMemo(() => {
    return ensaios.map((e) => {
      const dataEnsaio = getDataEnsaio(e);
      const dataRaw = dataEnsaio ? new Date(dataEnsaio) : null;
      const dataRawTs = dataRaw && !isNaN(dataRaw.getTime()) ? dataRaw.getTime() : NaN;
      let dataStartTs = NaN;
      if (!isNaN(dataRawTs)) {
        const ed = new Date(dataRaw);
        ed.setHours(0, 0, 0, 0);
        dataStartTs = ed.getTime();
      }
      const o = obrasMap.get(e.obra_id);
      const p = e.project_id ? projectsMap.get(e.project_id) : null;
      const li = getLocalInfo(e);
      return {
        record: e,
        laboratorista: getLaboratoristaInfo(e, allUsers).toLowerCase(),
        obraName: o?.name?.toLowerCase() ?? '',
        obraCode: o?.code?.toLowerCase() ?? '',
        projectName: p?.name?.toLowerCase() ?? '',
        localTipo: li?.tipo?.toLowerCase() ?? '',
        localDetalhes: li?.detalhes?.toLowerCase() ?? '',
        empreiteira: getEmpreiteiraInfo(e)?.toLowerCase() ?? '',
        dataStartTs,
        dataRawTs,
        entityType: e.entityType,
      };
    });
  }, [ensaios, allUsers, obrasMap, projectsMap]);

  // Mapa record → dataRawTs para ordenação sem chamar getDataEnsaio por comparação
  const recordTsMap = useMemo(() => {
    const m = new Map();
    for (const p of precomputedEnsaios) m.set(p.record, p.dataRawTs);
    return m;
  }, [precomputedEnsaios]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : prev === 'asc' ? null : 'desc'));
  }, []);

  const filteredEnsaios = useMemo(() => {
    let filtered = precomputedEnsaios;

    if (nomeFilterDebounced) {
      const q = nomeFilterDebounced.toLowerCase();
      filtered = filtered.filter((p) => p.laboratorista.includes(q));
    }
    if (obraFilterDebounced) {
      const q = obraFilterDebounced.toLowerCase();
      filtered = filtered.filter((p) => p.obraName.includes(q) || p.obraCode.includes(q));
    }
    if (projetoFilterDebounced) {
      const q = projetoFilterDebounced.toLowerCase();
      filtered = filtered.filter((p) => p.projectName.includes(q));
    }
    if (localFilterDebounced) {
      const q = localFilterDebounced.toLowerCase();
      filtered = filtered.filter((p) => p.localTipo.includes(q) || p.localDetalhes.includes(q));
    }
    if (empreiteiraFilterDebounced) {
      const q = empreiteiraFilterDebounced.toLowerCase();
      filtered = filtered.filter((p) => p.empreiteira.includes(q));
    }

    if (dataInicioFilter) {
      const d = new Date(dataInicioFilter);
      d.setHours(0, 0, 0, 0);
      const startTs = d.getTime();
      filtered = filtered.filter((p) => !isNaN(p.dataStartTs) && p.dataStartTs >= startTs);
    }

    if (dataFimFilter) {
      const d = new Date(dataFimFilter);
      d.setHours(23, 59, 59, 999);
      const endTs = d.getTime();
      filtered = filtered.filter((p) => !isNaN(p.dataStartTs) && p.dataStartTs <= endTs);
    }

    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter((p) => p.entityType === typeFilter);
    }

    let resultRecords = filtered.map((p) => p.record);
    if (applyCustomFilters) resultRecords = applyCustomFilters(resultRecords);

    if (sortOrder) {
      resultRecords = [...resultRecords].sort((a, b) => {
        const tsA = recordTsMap.get(a);
        const tsB = recordTsMap.get(b);
        if (isNaN(tsA) || isNaN(tsB)) return 0;
        return sortOrder === 'asc' ? tsA - tsB : tsB - tsA;
      });
    }

    return resultRecords;
  }, [precomputedEnsaios, recordTsMap, nomeFilterDebounced, obraFilterDebounced, projetoFilterDebounced, localFilterDebounced, empreiteiraFilterDebounced, dataInicioFilter, dataFimFilter, typeFilter, sortOrder, applyCustomFilters]);

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