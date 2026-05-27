import { useState, useCallback, useEffect } from "react";
import { Obra } from "@/entities/Obra";
import {
  ENTITY_KEYS,
  getEntityInstance,
  extractLaboratoristas,
  filterRecordsByDateRange,
} from "@/utils/relatoriosUnificadosUtils";

export const useRelatoriosUnificadosFilters = () => {
  const [obraSelecionada, setObraSelecionada] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tipoRegistro, setTipoRegistro] = useState("");

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
      const obraData = await Obra.get(obraId);
      if (obraData) {
        setRodoviasDisponiveis(obraData.rodovias || []);
        setEmpreiteirasDisponiveis(obraData.empreiteiras || []);
        setUsinasDisponiveis(obraData.usinas || []);
      }
    } catch {
      setRodoviasDisponiveis([]);
      setEmpreiteirasDisponiveis([]);
      setUsinasDisponiveis([]);
    }
  }, []);

  const loadLaboratoristas = useCallback(async (obraId, inicio, fim) => {
    setLoadingLaboratoristas(true);
    try {
      const allRecords = [];
      await Promise.all(
        ENTITY_KEYS.map(async (key) => {
          try {
            const entity = getEntityInstance(key);
            const records = await entity.filter(
              { obra_id: obraId },
              "-created_date",
              1000
            );
            records.forEach((r) => {
              allRecords.push({ ...r, entityType: key });
            });
          } catch (e) {
            console.warn(`Falha ao carregar ${key}:`, e?.message || e);
          }
        })
      );

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

  const toggleLaboratorista = useCallback((lab) => {
    setLaboratoristasChecked((prev) =>
      prev.includes(lab) ? prev.filter((l) => l !== lab) : [...prev, lab]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setDataInicio("");
    setDataFim("");
    setTipoRegistro("");
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