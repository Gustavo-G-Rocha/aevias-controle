import { useState, useMemo, useCallback } from "react";
import { applyRncFilters, applyCncFilters } from "@/utils/naoConformidadesUtils";

/**
 * Gerencia todos os estados de filtro e os dados derivados (opções de dropdown,
 * dados filtrados para cada gráfico, KPIs e tabela resumo).
 */
export function useNaoConformidadesFilters(obras, rncs, checklistNCs) {
  const [filtroStatus, setFiltroStatus] = useState(null);
  const [filtroParametro, setFiltroParametro] = useState(null);
  const [filtroObraId, setFiltroObraId] = useState(null);
  const [filtroEmpreiteira, setFiltroEmpreiteira] = useState(null);
  const [filtroRodovia, setFiltroRodovia] = useState(null);
  const [filtroUsina, setFiltroUsina] = useState(null);
  const [filtroDataInicial, setFiltroDataInicial] = useState(null);
  const [filtroDataFinal, setFiltroDataFinal] = useState(null);

  const clearFilters = useCallback(() => {
    setFiltroStatus(null); setFiltroParametro(null); setFiltroObraId(null);
    setFiltroEmpreiteira(null); setFiltroRodovia(null); setFiltroUsina(null);
    setFiltroDataInicial(null); setFiltroDataFinal(null);
  }, []);

  const hasActiveFilter = !!(filtroStatus || filtroParametro || filtroObraId || filtroEmpreiteira || filtroRodovia || filtroUsina || filtroDataInicial || filtroDataFinal);

  // Objeto de filtros consolidado
  const f = useMemo(() => ({
    status: filtroStatus, parametro: filtroParametro, obraId: filtroObraId,
    empreiteira: filtroEmpreiteira, rodovia: filtroRodovia, usina: filtroUsina,
    dataInicial: filtroDataInicial, dataFinal: filtroDataFinal
  }), [filtroStatus, filtroParametro, filtroObraId, filtroEmpreiteira, filtroRodovia, filtroUsina, filtroDataInicial, filtroDataFinal]);

  // ---- Opções de dropdown ----
  const opcoesEmpreiteira = useMemo(() => {
    const s = new Set([...checklistNCs.map(nc => nc.empreiteira), ...rncs.map(r => r.executora || '')].filter(Boolean));
    return [...s].sort();
  }, [checklistNCs, rncs]);

  const opcoesRodovia = useMemo(() => {
    const s = new Set([...checklistNCs.map(nc => nc.rodovia), ...rncs.map(r => r.rodovia || '')].filter(Boolean));
    return [...s].sort();
  }, [checklistNCs, rncs]);

  const opcoesUsina = useMemo(() => {
    const s = new Set(checklistNCs.map(nc => nc.usina).filter(Boolean));
    return [...s].sort();
  }, [checklistNCs]);

  // ---- KPIs ----
  const rncsVisiveis = useMemo(() => applyRncFilters(rncs, checklistNCs, f), [rncs, checklistNCs, f]);
  const cncsVisiveis = useMemo(() => applyCncFilters(checklistNCs, rncs, f), [checklistNCs, rncs, f]);

  return {
    // estados dos filtros (para bind de UI)
    filtroStatus, setFiltroStatus,
    filtroParametro, setFiltroParametro,
    filtroObraId, setFiltroObraId,
    filtroEmpreiteira, setFiltroEmpreiteira,
    filtroRodovia, setFiltroRodovia,
    filtroUsina, setFiltroUsina,
    filtroDataInicial, setFiltroDataInicial,
    filtroDataFinal, setFiltroDataFinal,
    // derivados
    f, hasActiveFilter, clearFilters,
    opcoesEmpreiteira, opcoesRodovia, opcoesUsina,
    rncsVisiveis, cncsVisiveis,
  };
}