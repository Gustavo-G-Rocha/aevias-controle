import React, { useCallback } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useNaoConformidadesData } from "@/hooks/useNaoConformidadesData";
import { useNaoConformidadesFilters } from "@/hooks/useNaoConformidadesFilters";
import { useNaoConformidadesChartData } from "@/hooks/useNaoConformidadesChartData";

import NaoConformidadesFilters from "@/components/nc/NaoConformidadesFilters";
import NaoConformidadesKpis from "@/components/nc/NaoConformidadesKpis";
import NaoConformidadesCharts from "@/components/nc/NaoConformidadesCharts";
import NaoConformidadesTable from "@/components/nc/NaoConformidadesTable";

export default function NaoConformidadesPage() {
  const { loading, obras, rncs, checklistNCs } = useNaoConformidadesData();

  const {
    filtroStatus, setFiltroStatus,
    filtroParametro, setFiltroParametro,
    filtroObraId, setFiltroObraId,
    filtroEmpreiteira, setFiltroEmpreiteira,
    filtroRodovia, setFiltroRodovia,
    filtroUsina, setFiltroUsina,
    filtroDataInicial, setFiltroDataInicial,
    filtroDataFinal, setFiltroDataFinal,
    f, hasActiveFilter, clearFilters,
    opcoesEmpreiteira, opcoesRodovia, opcoesUsina,
    rncsVisiveis, cncsVisiveis,
  } = useNaoConformidadesFilters(obras, rncs, checklistNCs);

  const {
    dadosStatusRNC, dadosParametros, dadosPorObra,
    dadosPorEmpreiteira, dadosPorRodovia, dadosPorUsina,
    dadosTemporais, tabelaResumo,
  } = useNaoConformidadesChartData(obras, rncs, checklistNCs, f);

  // Chart click handlers — toggle filter on/off
  const handleStatusClick = useCallback((d) => setFiltroStatus(p => p === d.statusKey ? null : d.statusKey), [setFiltroStatus]);
  const handleParametroClick = useCallback((d) => setFiltroParametro(p => p === d.name ? null : d.name), [setFiltroParametro]);
  const handleObraClick = useCallback((d) => setFiltroObraId(p => p === d.obraId ? null : d.obraId), [setFiltroObraId]);
  const handleEmpreiteiraClick = useCallback((d) => setFiltroEmpreiteira(p => p === d.name ? null : d.name), [setFiltroEmpreiteira]);
  const handleRodoviaClick = useCallback((d) => setFiltroRodovia(p => p === d.name ? null : d.name), [setFiltroRodovia]);
  const handleUsinaClick = useCallback((d) => setFiltroUsina(p => p === d.name ? null : d.name), [setFiltroUsina]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-destructive" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard de Não Conformidades</h1>
              <p className="text-muted-foreground text-sm mt-1">Visão geral de todas as obras</p>
            </div>
          </div>
          {hasActiveFilter && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="text-foreground gap-2">
              <X className="w-4 h-4" /> Limpar Filtros
            </Button>
          )}
        </div>

        <NaoConformidadesFilters
          filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus}
          filtroParametro={filtroParametro} setFiltroParametro={setFiltroParametro}
          filtroObraId={filtroObraId} setFiltroObraId={setFiltroObraId}
          filtroEmpreiteira={filtroEmpreiteira} setFiltroEmpreiteira={setFiltroEmpreiteira}
          filtroRodovia={filtroRodovia} setFiltroRodovia={setFiltroRodovia}
          filtroUsina={filtroUsina} setFiltroUsina={setFiltroUsina}
          filtroDataInicial={filtroDataInicial} setFiltroDataInicial={setFiltroDataInicial}
          filtroDataFinal={filtroDataFinal} setFiltroDataFinal={setFiltroDataFinal}
          opcoesEmpreiteira={opcoesEmpreiteira}
          opcoesRodovia={opcoesRodovia}
          opcoesUsina={opcoesUsina}
          obras={obras}
          hasActiveFilter={hasActiveFilter}
        />

        <NaoConformidadesKpis rncsVisiveis={rncsVisiveis} cncsVisiveis={cncsVisiveis} />

        <NaoConformidadesCharts
          dadosStatusRNC={dadosStatusRNC}
          dadosParametros={dadosParametros}
          dadosPorObra={dadosPorObra}
          dadosPorEmpreiteira={dadosPorEmpreiteira}
          dadosPorRodovia={dadosPorRodovia}
          dadosPorUsina={dadosPorUsina}
          dadosTemporais={dadosTemporais}
          filtroStatus={filtroStatus}
          filtroParametro={filtroParametro}
          filtroObraId={filtroObraId}
          filtroEmpreiteira={filtroEmpreiteira}
          filtroRodovia={filtroRodovia}
          filtroUsina={filtroUsina}
          onStatusClick={handleStatusClick}
          onParametroClick={handleParametroClick}
          onObraClick={handleObraClick}
          onEmpreiteiraClick={handleEmpreiteiraClick}
          onRodoviaClick={handleRodoviaClick}
          onUsinaClick={handleUsinaClick}
          hasDateFilter={!!(f.dataInicial || f.dataFinal)}
        />

        <NaoConformidadesTable
          rncsVisiveis={rncsVisiveis}
          cncsVisiveis={cncsVisiveis}
          tabelaResumo={tabelaResumo}
          filtroObraId={filtroObraId}
          hasActiveFilter={hasActiveFilter}
          onObraClick={handleObraClick}
        />

      </div>
    </div>
  );
}