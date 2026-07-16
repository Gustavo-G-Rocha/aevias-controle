import { useCallback } from "react";
import { buildReportParams } from "@/utils/relatoriosUnificadosUtils";

export const useRelatoriosUnificadosActions = () => {

  const handleGerarRelatorio = useCallback(
    (
      obraSelecionada,
      dataInicio,
      dataFim,
      tipoRegistro,
      laboratoristasChecked,
      rodoviaSelecionada,
      empreiteiraSelecionada,
      usinaSelecionada
    ) => {
      const params = buildReportParams(
        obraSelecionada,
        dataInicio,
        dataFim,
        tipoRegistro,
        laboratoristasChecked,
        rodoviaSelecionada,
        empreiteiraSelecionada,
        usinaSelecionada
      );
      window.location.assign(`/RelatorioUnificado?${params.toString()}`);
    },
    []
  );

  return { handleGerarRelatorio };
};