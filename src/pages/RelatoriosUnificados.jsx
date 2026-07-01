import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { useRelatoriosUnificadosData } from "@/hooks/useRelatoriosUnificadosData";
import { useRelatoriosUnificadosFilters } from "@/hooks/useRelatoriosUnificadosFilters";
import { useRelatoriosUnificadosActions } from "@/hooks/useRelatoriosUnificadosActions";
import { isFormValid } from "@/utils/relatoriosUnificadosUtils";

import RelatoriosUnificadosHeader from "@/components/relatorios-unificados/RelatoriosUnificadosHeader";
import RelatoriosUnificadosPeriodo from "@/components/relatorios-unificados/RelatoriosUnificadosPeriodo";
import RelatoriosUnificadosObra from "@/components/relatorios-unificados/RelatoriosUnificadosObra";
import RelatoriosUnificadosTipo from "@/components/relatorios-unificados/RelatoriosUnificadosTipo";
import RelatoriosUnificadosFiltrosAdicionais from "@/components/relatorios-unificados/RelatoriosUnificadosFiltrosAdicionais";
import RelatoriosUnificadosLaboratoristas from "@/components/relatorios-unificados/RelatoriosUnificadosLaboratoristas";
import RelatoriosUnificadosBotoes from "@/components/relatorios-unificados/RelatoriosUnificadosBotoes";

export default function RelatoriosUnificados() {
  const { loading, obras, regionais } = useRelatoriosUnificadosData();
  const {
    obraSelecionada,
    setObraSelecionada,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    tipoRegistro,
    setTipoRegistro,
    laboratoristasDisponiveis,
    laboratoristasResolvidos,
    laboratoristasChecked,
    setLaboratoristasChecked,
    loadingLaboratoristas,
    rodoviasDisponiveis,
    empreiteirasDisponiveis,
    usinasDisponiveis,
    rodoviaSelecionada,
    setRodoviaSelecionada,
    empreiteiraSelecionada,
    setEmpreiteiraSelecionada,
    usinaSelecionada,
    setUsinaSelecionada,
    toggleLaboratorista,
    clearFilters,
  } = useRelatoriosUnificadosFilters();
  const { handleGerarRelatorio } = useRelatoriosUnificadosActions();
  const [generating] = useState(false);

  const obraSelecionadaObj = useMemo(
    () => obras.find((o) => o.id === obraSelecionada),
    [obras, obraSelecionada]
  );
  const regionalSelecionada = useMemo(
    () =>
      obraSelecionadaObj
        ? regionais.find((r) => r.id === obraSelecionadaObj.regional_id)
        : null,
    [obraSelecionadaObj, regionais]
  );

  const formIsValid = isFormValid(
    dataInicio,
    dataFim,
    obraSelecionada,
    laboratoristasChecked,
    tipoRegistro
  );

  const handleGerar = () => {
    if (!obraSelecionada) return;
    handleGerarRelatorio(
      obraSelecionada,
      dataInicio,
      dataFim,
      tipoRegistro,
      laboratoristasChecked,
      rodoviaSelecionada,
      empreiteiraSelecionada,
      usinaSelecionada
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <RelatoriosUnificadosHeader />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>
            Todos os campos são obrigatórios para gerar o relatório.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <RelatoriosUnificadosPeriodo
            dataInicio={dataInicio}
            setDataInicio={setDataInicio}
            dataFim={dataFim}
            setDataFim={setDataFim}
          />

          <RelatoriosUnificadosObra
            obraSelecionada={obraSelecionada}
            setObraSelecionada={setObraSelecionada}
            obras={obras}
            regionais={regionais}
            regionalSelecionada={regionalSelecionada}
          />

          <RelatoriosUnificadosTipo
            tipoRegistro={tipoRegistro}
            setTipoRegistro={setTipoRegistro}
          />

          <RelatoriosUnificadosFiltrosAdicionais
            rodoviaSelecionada={rodoviaSelecionada}
            setRodoviaSelecionada={setRodoviaSelecionada}
            rodoviasDisponiveis={rodoviasDisponiveis}
            empreiteiraSelecionada={empreiteiraSelecionada}
            setEmpreiteiraSelecionada={setEmpreiteiraSelecionada}
            empreiteirasDisponiveis={empreiteirasDisponiveis}
            usinaSelecionada={usinaSelecionada}
            setUsinaSelecionada={setUsinaSelecionada}
            usinasDisponiveis={usinasDisponiveis}
          />

          <RelatoriosUnificadosLaboratoristas
            obraSelecionada={obraSelecionada}
            dataInicio={dataInicio}
            dataFim={dataFim}
            loadingLaboratoristas={loadingLaboratoristas}
            laboratoristasDisponiveis={laboratoristasDisponiveis}
            laboratoristasResolvidos={laboratoristasResolvidos}
            laboratoristasChecked={laboratoristasChecked}
            setLaboratoristasChecked={setLaboratoristasChecked}
            toggleLaboratorista={toggleLaboratorista}
          />

          <RelatoriosUnificadosBotoes
            onLimpar={clearFilters}
            onGerar={handleGerar}
            isFormValid={formIsValid}
            generating={generating}
          />
        </CardContent>
      </Card>
    </div>
  );
}