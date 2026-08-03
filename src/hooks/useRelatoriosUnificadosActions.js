import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { buildReportParams } from "@/utils/relatoriosUnificadosUtils";

export const useRelatoriosUnificadosActions = () => {
  const navigate = useNavigate();

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
      navigate(`/RelatorioUnificado?${params.toString()}`);
    },
    [navigate]
  );

  return { handleGerarRelatorio };
};