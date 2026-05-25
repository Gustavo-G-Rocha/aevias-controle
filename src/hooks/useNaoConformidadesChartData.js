import { useMemo } from "react";
import {
  applyRncFilters,
  applyCncFilters,
  STATUS_LABELS,
  STATUS_COLORS,
  PARAM_COLORS,
  CHART_COLORS,
  TIMELINE_COLORS,
} from "@/utils/naoConformidadesUtils";

/**
 * Calcula todos os dados derivados para os gráficos da página de NCs.
 * Separado do hook de filtros para manter cada hook focado.
 */
export function useNaoConformidadesChartData(obras, rncs, checklistNCs, f) {
  const supervisaoIds = useMemo(
    () => new Set(obras.filter(o => o.tipo_obra === 'supervisao').map(o => o.id)),
    [obras]
  );

  const dadosStatusRNC = useMemo(() => {
    const filtered = applyRncFilters(rncs, checklistNCs, f, 'status');
    const counts = { aberta: 0, em_tratativa: 0, encerrada: 0, cancelada: 0 };
    filtered.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
    return Object.entries(counts).filter(([,v]) => v > 0)
      .map(([status, value]) => ({ name: STATUS_LABELS[status], statusKey: status, value, color: STATUS_COLORS[status] }));
  }, [rncs, checklistNCs, f]);

  const dadosParametros = useMemo(() => {
    const filtered = applyCncFilters(checklistNCs, rncs, f, 'parametro');
    const count = {};
    filtered.forEach(nc => { count[nc.parametro] = (count[nc.parametro] || 0) + 1; });
    return Object.entries(count).sort((a,b) => b[1]-a[1]).slice(0,10)
      .map(([name, value], i) => ({ name, value, color: PARAM_COLORS[i % PARAM_COLORS.length] }));
  }, [checklistNCs, rncs, f]);

  const dadosPorObra = useMemo(() => {
    const filteredR = applyRncFilters(rncs, checklistNCs, f, 'obraId');
    const filteredC = applyCncFilters(checklistNCs, rncs, f, 'obraId');
    const count = {};
    filteredR.forEach(r => { count[r.obra_id] = (count[r.obra_id] || 0) + 1; });
    filteredC.forEach(nc => { count[nc.obra_id] = (count[nc.obra_id] || 0) + 1; });
    return Object.entries(count)
      .map(([obraId, value], i) => ({ name: obras.find(o => o.id === obraId)?.name || obraId, obraId, value, color: CHART_COLORS[i % CHART_COLORS.length] }))
      .sort((a,b) => b.value - a.value);
  }, [rncs, checklistNCs, obras, f]);

  const dadosPorEmpreiteira = useMemo(() => {
    const filteredC = applyCncFilters(checklistNCs, rncs, f, 'empreiteira').filter(nc => supervisaoIds.has(nc.obra_id));
    const filteredR = applyRncFilters(rncs, checklistNCs, f, 'empreiteira').filter(r => supervisaoIds.has(r.obra_id));
    const count = {};
    filteredC.forEach(nc => { if (nc.empreiteira) count[nc.empreiteira] = (count[nc.empreiteira] || 0) + 1; });
    filteredR.forEach(r => { if (r.executora) count[r.executora] = (count[r.executora] || 0) + 1; });
    return Object.entries(count).sort((a,b) => b[1]-a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [checklistNCs, rncs, supervisaoIds, f]);

  const dadosPorRodovia = useMemo(() => {
    const filteredC = applyCncFilters(checklistNCs, rncs, f, 'rodovia');
    const filteredR = applyRncFilters(rncs, checklistNCs, f, 'rodovia');
    const count = {};
    filteredC.forEach(nc => { if (nc.rodovia) count[nc.rodovia] = (count[nc.rodovia] || 0) + 1; });
    filteredR.forEach(r => { if (r.rodovia) count[r.rodovia] = (count[r.rodovia] || 0) + 1; });
    return Object.entries(count).sort((a,b) => b[1]-a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [checklistNCs, rncs, f]);

  const dadosPorUsina = useMemo(() => {
    const filtered = applyCncFilters(checklistNCs, rncs, f, 'usina');
    const count = {};
    filtered.forEach(nc => { if (nc.usina) count[nc.usina] = (count[nc.usina] || 0) + 1; });
    return Object.entries(count).sort((a,b) => b[1]-a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [checklistNCs, rncs, f]);

  const dadosTemporais = useMemo(() => {
    let filteredR = applyRncFilters(rncs, checklistNCs, { ...f, dataInicial: null, dataFinal: null }, null);
    let filteredC = applyCncFilters(checklistNCs, rncs, { ...f, dataInicial: null, dataFinal: null }, null);

    if (f.dataInicial || f.dataFinal) {
      filteredR = filteredR.filter(r => {
        if (!r.data_nc) return false;
        const dataRnc = new Date(r.data_nc);
        if (f.dataInicial && dataRnc < f.dataInicial) return false;
        if (f.dataFinal) {
          const dataFinalMidnight = new Date(f.dataFinal);
          dataFinalMidnight.setHours(23, 59, 59, 999);
          if (dataRnc > dataFinalMidnight) return false;
        }
        return true;
      });
      filteredC = filteredC.filter(nc => {
        if (!nc.data) return false;
        const dataNc = new Date(nc.data);
        if (f.dataInicial && dataNc < f.dataInicial) return false;
        if (f.dataFinal) {
          const dataFinalMidnight = new Date(f.dataFinal);
          dataFinalMidnight.setHours(23, 59, 59, 999);
          if (dataNc > dataFinalMidnight) return false;
        }
        return true;
      });
    }

    const allDates = new Set();
    filteredR.forEach(r => { if (r.data_nc) allDates.add(r.data_nc); });
    filteredC.forEach(nc => { if (nc.data) allDates.add(nc.data); });

    if (allDates.size === 0) return { data: [], maxValue: 0 };

    const sortedDates = [...allDates].sort();

    const obraCount = {};
    filteredR.forEach(r => { obraCount[r.obra_id] = (obraCount[r.obra_id] || 0) + 1; });
    filteredC.forEach(nc => { obraCount[nc.obra_id] = (obraCount[nc.obra_id] || 0) + 1; });
    const topObras = Object.entries(obraCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => id);

    let maxValue = 0;
    const data = sortedDates
      .filter(date => {
        try {
          const d = new Date(date + 'T12:00:00');
          return !isNaN(d.getTime());
        } catch {
          return false;
        }
      })
      .map(date => {
        const point = { date: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) };
        let totalForDate = 0;
        topObras.forEach(obraId => {
          const obraNome = obras.find(o => o.id === obraId)?.name || obraId;
          const count = filteredR.filter(r => r.obra_id === obraId && r.data_nc === date).length +
                        filteredC.filter(nc => nc.obra_id === obraId && nc.data === date).length;
          point[obraNome] = count;
          totalForDate += count;
        });
        if (totalForDate > maxValue) maxValue = totalForDate;
        return point;
      });
    return { data, maxValue, timelineColors: TIMELINE_COLORS };
  }, [rncs, checklistNCs, obras, f]);

  const tabelaResumo = useMemo(() => {
    return obras.map(obra => {
      if (f.obraId && obra.id !== f.obraId) return null;

      let rncsObra = rncs.filter(r => r.obra_id === obra.id);
      if (f.status) rncsObra = rncsObra.filter(r => r.status === f.status);
      if (f.empreiteira) rncsObra = rncsObra.filter(r => (r.executora || '') === f.empreiteira);
      if (f.rodovia) rncsObra = rncsObra.filter(r => (r.rodovia || '') === f.rodovia);
      if (f.parametro) {
        if (!checklistNCs.some(nc => nc.parametro === f.parametro && nc.obra_id === obra.id)) rncsObra = [];
      }

      let cncsObra = checklistNCs.filter(nc => nc.obra_id === obra.id);
      if (f.parametro) cncsObra = cncsObra.filter(nc => nc.parametro === f.parametro);
      if (f.empreiteira) cncsObra = cncsObra.filter(nc => (nc.empreiteira || '') === f.empreiteira);
      if (f.rodovia) cncsObra = cncsObra.filter(nc => (nc.rodovia || '') === f.rodovia);
      if (f.usina) cncsObra = cncsObra.filter(nc => (nc.usina || '') === f.usina);
      if (f.status) {
        if (!rncs.some(r => r.obra_id === obra.id && r.status === f.status)) cncsObra = [];
      }

      const totalRnc = rncsObra.length;
      const paramChecklist = cncsObra.length;
      if (totalRnc === 0 && paramChecklist === 0) return null;

      return {
        obra, totalRnc, paramChecklist,
        abertas: rncsObra.filter(r => r.status === 'aberta').length,
        emTratativa: rncsObra.filter(r => r.status === 'em_tratativa').length,
        finalizadas: rncsObra.filter(r => r.status === 'encerrada').length,
        canceladas: rncsObra.filter(r => r.status === 'cancelada').length,
      };
    }).filter(Boolean);
  }, [obras, rncs, checklistNCs, f]);

  return {
    dadosStatusRNC, dadosParametros, dadosPorObra,
    dadosPorEmpreiteira, dadosPorRodovia, dadosPorUsina,
    dadosTemporais, tabelaResumo,
  };
}