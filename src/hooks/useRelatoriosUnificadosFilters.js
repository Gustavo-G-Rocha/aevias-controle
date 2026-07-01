import { useState, useCallback, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  extractLaboratoristas,
  filterRecordsByDateRange,
} from "@/utils/relatoriosUnificadosUtils";
import { resolveUserIdentity } from "@/utils/userIdentityResolver";
import { loadRecordsByObra } from "@/services/recordsService";

export const useRelatoriosUnificadosFilters = () => {
  const [obraSelecionada, setObraSelecionada] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tipoRegistro, setTipoRegistro] = useState([]); // array de tipos selecionados

  const [laboratoristasDisponiveis, setLaboratoristasDisponiveis] = useState([]);
  const [laboratoristasChecked, setLaboratoristasChecked] = useState([]);
  const [loadingLaboratoristas, setLoadingLaboratoristas] = useState(false);

  const [rodoviasDisponiveis, setRodoviasDisponiveis] = useState([]);
  const [empreiteirasDisponiveis, setEmpreiteirasDisponiveis] = useState([]);
  const [usinasDisponiveis, setUsinasDisponiveis] = useState([]);
  const [rodoviaSelecionada, setRodoviaSelecionada] = useState("");
  const [empreiteiraSelecionada, setEmpreiteiraSelecionada] = useState("");
  const [usinaSelecionada, setUsinaSelecionada] = useState("");

  const loadFiltrosObra = useCallback(async (obraId) => {
    try {
      const obraData = await base44.entities.Obra.get(obraId);
      setRodoviasDisponiveis(obraData?.rodovias || []);
      setEmpreiteirasDisponiveis(obraData?.empreiteiras || []);
      setUsinasDisponiveis(obraData?.usinas || []);
    } catch (err) {
      console.warn('[RelatoriosUnificados] Filtros da obra não carregados:', err?.message || err);
      setRodoviasDisponiveis([]);
      setEmpreiteirasDisponiveis([]);
      setUsinasDisponiveis([]);
    }
  }, []);

  const loadLaboratoristas = useCallback(async (obraId, inicio, fim) => {
    setLoadingLaboratoristas(true);
    try {
      const allRecords = await loadRecordsByObra(obraId);
      const filtered = filterRecordsByDateRange(allRecords, inicio, fim);
      const labs = extractLaboratoristas(filtered);
      setLaboratoristasDisponiveis(labs);
      setLaboratoristasChecked(labs);
    } catch (err) {
      console.error(
        "[RelatoriosUnificados] Erro ao carregar laboratoristas:",
        err?.message || err
      );
    } finally {
      setLoadingLaboratoristas(false);
    }
  }, []);

  useEffect(() => {
    if (obraSelecionada && dataInicio && dataFim) {
      loadLaboratoristas(obraSelecionada, dataInicio, dataFim);
      loadFiltrosObra(obraSelecionada);
    } else {
      setLaboratoristasDisponiveis([]);
      setLaboratoristasChecked([]);
      setRodoviasDisponiveis([]);
      setEmpreiteirasDisponiveis([]);
      setUsinasDisponiveis([]);
    }
  }, [obraSelecionada, dataInicio, dataFim, loadLaboratoristas, loadFiltrosObra]);

  // Lista "resolvida": agrupa registros duplicados da mesma pessoa
  // (nome + email com nome nulo, variação de domínio) em um único item.
  const laboratoristasResolvidos = useMemo(
    () => resolveUserIdentity(laboratoristasDisponiveis),
    [laboratoristasDisponiveis]
  );

  // Alterna um GRUPO de identidade: marca/desmarca todos os seus identificadores.
  const toggleLaboratorista = useCallback((identifiers) => {
    const ids = Array.isArray(identifiers) ? identifiers : [identifiers];
    setLaboratoristasChecked((prev) => {
      const allChecked = ids.every((id) => prev.includes(id));
      if (allChecked) {
        return prev.filter((l) => !ids.includes(l));
      }
      return Array.from(new Set([...prev, ...ids]));
    });
  }, []);

  const clearFilters = useCallback(() => {
    setDataInicio("");
    setDataFim("");
    setTipoRegistro([]);
    setLaboratoristasDisponiveis([]);
    setLaboratoristasChecked([]);
    setRodoviasDisponiveis([]);
    setEmpreiteirasDisponiveis([]);
    setUsinasDisponiveis([]);
    setRodoviaSelecionada("");
    setEmpreiteiraSelecionada("");
    setUsinaSelecionada("");
  }, []);

  return {
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
  };
};