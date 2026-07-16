import React from "react";
import { Label } from "@/components/ui/label";
import ReportDateInput from "@/components/relatorios-unificados/ReportDateInput";

export default function RelatoriosUnificadosPeriodo({
  dataInicio,
  setDataInicio,
  dataFim,
  setDataFim,
}) {
  const handleDataInicio = (val) => {
    setDataInicio(val);
    // Usa a mesma data como fim até o usuário escolher um período maior.
    if (val && (!dataFim || val > dataFim)) {
      setDataFim(val);
    }
  };

  const handleDataFim = (val) => {
    // Não permite data fim menor que data início
    if (dataInicio && val && val < dataInicio) return;
    setDataFim(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="relatorio-data-inicio">Data Início *</Label>
        <ReportDateInput
          id="relatorio-data-inicio"
          name="data_inicio"
          aria-label="Data Início"
          value={dataInicio}
          onValueChange={handleDataInicio}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="relatorio-data-fim">Data Fim *</Label>
        <ReportDateInput
          id="relatorio-data-fim"
          name="data_fim"
          aria-label="Data Fim"
          value={dataFim}
          onValueChange={handleDataFim}
        />
      </div>
    </div>
  );
}