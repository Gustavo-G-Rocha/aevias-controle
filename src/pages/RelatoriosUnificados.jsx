import React, { useMemo } from "react";
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

const parseDateValue = (text) => {
  const value = (text || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  let match = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!match) {
    const compact = value.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (compact) match = compact;
  }
  if (!match) return null;
  let first = Number(match[1]);
  let second = Number(match[2]);
  const year = Number(match[3]);
  if (year < 2000 || year > 2100) return null;
  const monthFirst = first <= 12 && second > 12;
  const day = monthFirst ? second : first;
  const month = monthFirst ? first : second;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

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
    let obra = obraSelecionada;
    let inicio = dataInicio;
    let fim = dataFim;

    // Fallback: leitura direta do DOM quando o estado React não foi
    // atualizado (ex.: automação preencheu os campos sem disparar os
    // eventos que React reconhece para text/select controlados).
    if (!obra) {
      const el = document.getElementById("relatorio-unificado-obra");
      if (el && el.value) obra = el.value;
    }
    if (!inicio) {
      const el = document.getElementById("relatorio-data-inicio");
      if (el && el.value) {
        const parsed = parseDateValue(el.value);
        if (parsed) inicio = parsed;
      }
    }
    if (!fim) {
      const el = document.getElementById("relatorio-data-fim");
      if (el && el.value) {
        const parsed = parseDateValue(el.value);
        if (parsed) fim = parsed;
      }
    }

    if (!obra || !inicio || !fim) return;

    // Sincroniza o estado para que hooks reativos (ex.: laboratoristas)
    // e a URL do relatório recebam os valores lidos do DOM.
    if (obra !== obraSelecionada) setObraSelecionada(obra);
    if (inicio !== dataInicio) setDataInicio(inicio);
    if (fim !== dataFim) setDataFim(fim);

    handleGerarRelatorio(
      obra,
      inicio,
      fim,
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
            Selecione a obra e o período. Todos os tipos e laboratoristas são incluídos por padrão.
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
          />
        </CardContent>
      </Card>
    </div>
  );
}