// Hook customizado para gerenciar estado de filtros de tabela
// Filtros são aplicados apenas ao clicar o botão "Filtrar" (deferred filtering).
// Valores digitados (draft) atualizam os inputs instantaneamente para UX responsiva,
// mas a lista só é re-filtrada quando applyFilters() é chamado.
import { useState, useCallback, useMemo } from 'react';
import { getDataEnsaio } from '@/components/ensaios/ensaioMappers';
import { getLocalInfo, getLaboratoristaInfo, getEmpireiteiraInfo } from '@/components/ensaios/utils';

const EMPTY_FILTERS = {
  nome: '', obra: '', projeto: '', local: '', empreiteira: '',
  dataInicio: '', dataFim: '', type: 'all',
};

export function useTableFilters(ensaios, obras, projects, allUsers, applyCustomFilters = null) {
  // Draft state — valores digitados pelo usuário (inputs responsivos)
  const [nomeFilter, setNomeFilter] = useState('');
  const [obraFilter, setObraFilter] = useState('');
  const [projetoFilter, setProjetoFilter] = useState('');
  const [localFilter, setLocalFilter] = useState('');
  const [empreiteiraFilter, setEmpreiteiraFilter] = useState('');
  const [dataInicioFilter, setDataInicioFilter] = useState('');
  const [dataFimFilter, setDataFimFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Applied state — snapshot usado para filtrar a lista. Só muda ao clicar "Filtrar".
  const [applied, setApplied] = useState(EMPTY_FILTERS);

  // Índices O(1) para evitar .find() dentro de useMemo/loops
  const obrasMap = useMemo(() => new Map(obras.map((o) => [o.id, o])), [obras]);
  const projectsMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : prev === 'asc' ? null : 'desc'));
  }, []);

  // Aplica todos os filtros draft → applied (chamado ao clicar o botão "Filtrar")
  const applyFilters = useCallback(() => {
    setApplied({
      nome: nomeFilter,
      obra: obraFilter,
      projeto: projetoFilter,
      local: localFilter,
      empreiteira: empreiteiraFilter,
      dataInicio: dataInicioFilter,
      dataFim: dataFimFilter,
      type: typeFilter,
    });
    setCurrentPage(1);
  }, [nomeFilter, obraFilter, projetoFilter, localFilter, empreiteiraFilter, dataInicioFilter, dataFimFilter, typeFilter]);

  const filteredEnsaios = useMemo(() => {
    let filtered = ensaios;

    // Nome: filtro AO VIVO (digita → filtra instantaneamente)
    if (nomeFilter) filtered = filtered.filter((e) => getLaboratoristaInfo(e, allUsers).toLowerCase().includes(nomeFilter.toLowerCase()));
    if (applied.obra) filtered = filtered.filter((e) => {
      const o = obrasMap.get(e.obra_id);
      return o?.name?.toLowerCase().includes(applied.obra.toLowerCase()) || o?.code?.toLowerCase().includes(applied.obra.toLowerCase());
    });
    if (applied.projeto) filtered = filtered.filter((e) => {
      if (!e.project_id) return false;
      const p = projectsMap.get(e.project_id);
      return p?.name?.toLowerCase().includes(applied.projeto.toLowerCase());
    });
    if (applied.local) filtered = filtered.filter((e) => {
      const li = getLocalInfo(e);
      return li.tipo?.toLowerCase().includes(applied.local.toLowerCase()) || li.detalhes?.toLowerCase().includes(applied.local.toLowerCase());
    });
    if (applied.empreiteira) filtered = filtered.filter((e) => getEmpireiteiraInfo(e)?.toLowerCase().includes(applied.empreiteira.toLowerCase()) ?? false);

    if (applied.dataInicio) {
      const d = new Date(applied.dataInicio);
      d.setHours(0, 0, 0, 0);
      filtered = filtered.filter((e) => {
        const de = getDataEnsaio(e);
        if (!de) return false;
        const ed = new Date(de);
        ed.setHours(0, 0, 0, 0);
        return ed >= d;
      });
    }

    if (applied.dataFim) {
      const d = new Date(applied.dataFim);
      d.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => {
        const de = getDataEnsaio(e);
        if (!de) return false;
        const ed = new Date(de);
        ed.setHours(0, 0, 0, 0);
        return ed <= d;
      });
    }

    if (applied.type && applied.type !== 'all') filtered = filtered.filter((e) => e.entityType === applied.type);

    if (applyCustomFilters) filtered = applyCustomFilters(filtered);

    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const dA = new Date(getDataEnsaio(a)), dB = new Date(getDataEnsaio(b));
        if (isNaN(dA) || isNaN(dB)) return 0;
        return sortOrder === 'asc' ? dA - dB : dB - dA;
      });
    }

    return filtered;
  }, [ensaios, applied, obrasMap, projectsMap, sortOrder, allUsers, applyCustomFilters]);

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
    setApplied(EMPTY_FILTERS);
  }, []);

  // Nome é ao vivo, então não conta como "pendente"
  const isAnyFilterActive = !!(nomeFilter || applied.obra || applied.projeto || applied.local || applied.empreiteira || applied.dataInicio || applied.dataFim || applied.type !== 'all');

  // Detecta se há valores digitados ainda não aplicados (para destacar o botão)
  // Nome não entra aqui pois é aplicado em tempo real
  const hasPendingChanges =
    obraFilter !== applied.obra ||
    projetoFilter !== applied.projeto ||
    localFilter !== applied.local ||
    empreiteiraFilter !== applied.empreiteira ||
    dataInicioFilter !== applied.dataInicio ||
    dataFimFilter !== applied.dataFim ||
    typeFilter !== applied.type;

  const totalPages = Math.ceil(filteredEnsaios.length / itemsPerPage);
  const paginatedEnsaios = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEnsaios.slice(start, start + itemsPerPage);
  }, [filteredEnsaios, currentPage]);

  return {
    // State (draft — valores digitados nos inputs)
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
    hasPendingChanges,
    // Methods
    applyFilters,
    toggleSortOrder,
    clearFilters,
  };
}