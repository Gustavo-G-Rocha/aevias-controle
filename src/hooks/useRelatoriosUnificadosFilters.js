import { useState, useCallback, useEffect } from "react";
import { Obra } from "@/entities/Obra";
import { base44 } from "@/api/base44Client";
import {
  extractLaboratoristas,
  filterRecordsByDateRange,
} from "@/utils/relatoriosUnificadosUtils";

const ENTITY_KEYS = [
  "DiarioObra",
  "EnsaioCAUQ",
  "EnsaioMRAF",
  "EnsaioDensidade",
  "EnsaioDensidadeInSitu",
  "EnsaioTaxaPinturaImprimacao",
  "ChecklistUsina",
  "ChecklistAplicacao",
  "ChecklistMRAF",
  "ChecklistConcretagem",
  "ChecklistTerraplanagem",
  "ChecklistReciclagem",
  "EnsaioSondagem",
  "EnsaioGranulometriaIndividual",
  "AcompanhamentoUsinagem",
  "AcompanhamentoCarga",
  "EnsaioManchaPendulo",
  "EnsaioVigaBenkelman",
  "EnsaioTaxaMRAF",
  "BoletimSondagem",
  "BoletimSondagemTrado",
  "EnsaioProctor",
  "EnsaioRompimentoConcreto",
  "GranuMistura",
];

const getEntityInstance = (key) => {
  const map = {
    DiarioObra: base44.entities.DiarioObra,
    EnsaioCAUQ: base44.entities.EnsaioCAUQ,
    EnsaioMRAF: base44.entities.EnsaioMRAF,
    EnsaioDensidade: base44.entities.EnsaioDensidade,
    EnsaioDensidadeInSitu: base44.entities.EnsaioDensidadeInSitu,
    EnsaioTaxaPinturaImprimacao:
      base44.entities.EnsaioTaxaPinturaImprimacao,
    ChecklistUsina: base44.entities.ChecklistUsina,
    ChecklistAplicacao: base44.entities.ChecklistAplicacao,
    ChecklistMRAF: base44.entities.ChecklistMRAF,
    ChecklistConcretagem: base44.entities.ChecklistConcretagem,
    ChecklistTerraplanagem: base44.entities.ChecklistTerraplanagem,
    ChecklistReciclagem: base44.entities.ChecklistReciclagem,
    EnsaioSondagem: base44.entities.EnsaioSondagem,
    EnsaioGranulometriaIndividual:
      base44.entities.EnsaioGranulometriaIndividual,
    AcompanhamentoUsinagem: base44.entities.AcompanhamentoUsinagem,
    AcompanhamentoCarga: base44.entities.AcompanhamentoCarga,
    EnsaioManchaPendulo: base44.entities.EnsaioManchaPendulo,
    EnsaioVigaBenkelman: base44.entities.EnsaioVigaBenkelman,
    EnsaioTaxaMRAF: base44.entities.EnsaioTaxaMRAF,
    BoletimSondagem: base44.entities.BoletimSondagem,
    BoletimSondagemTrado: base44.entities.BoletimSondagemTrado,
    EnsaioProctor: base44.entities.EnsaioProctor,
    EnsaioRompimentoConcreto: base44.entities.EnsaioRompimentoConcreto,
    GranuMistura: base44.entities.GranuMistura,
  };
  return map[key];
};

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