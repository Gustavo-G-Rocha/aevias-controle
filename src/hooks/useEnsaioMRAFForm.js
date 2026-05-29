import { useCallback, useEffect, useMemo } from "react";
import { PENEIRAS_CONFIG, filtrarPeneirasPorFaixa } from "@/constants/sieves";
import {
  calcExtracaoLigante,
  buildProjectPatch,
} from "@/utils/ensaioMRAFUtils";

/**
 * Gerencia handlers de formulário e cálculos derivados para EnsaioMRAF.
 */
export function useEnsaioMRAFForm({
  formData, setFormData,
  projects, faixas,
  projetosDisponiveis, obraSelecionada,
}) {
  // ── handlers básicos ──────────────────────────────────────────────────────
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const handleNestedChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }, [setFormData]);

  // ── cálculo automático extração de ligante ────────────────────────────────
  useEffect(() => {
    const ext = formData.extracao_ligante;
    const patches = calcExtracaoLigante(ext);
    if (Object.keys(patches).length === 0) return;
    setFormData(prev => ({
      ...prev,
      extracao_ligante: { ...prev.extracao_ligante, ...patches },
    }));
  }, [
    formData.extracao_ligante.amostra_umida,
    formData.extracao_ligante.amostra_seca,
    formData.extracao_ligante.amostra_com_ligante,
    formData.extracao_ligante.amostra_sem_ligante,
    formData.extracao_ligante.fator_correcao,
    formData.extracao_ligante.teor_ligante,
    formData.extracao_ligante.residuo_emulsao,
  ]);

  // ── seleção de projeto ────────────────────────────────────────────────────
  const handleProjectChange = useCallback((projectId) => {
    const patch = buildProjectPatch(projectId, projects, faixas);
    setFormData(prev => ({ ...prev, ...patch }));
  }, [projects, faixas, setFormData]);

  // ── derivados ─────────────────────────────────────────────────────────────
  const selectedProject = useMemo(
    () => projects.find(p => p.id === formData.project_id),
    [projects, formData.project_id]
  );

  const selectedFaixa = useMemo(() => {
    if (!selectedProject?.faixa_granulometrica_id) return null;
    return faixas.find(f => f.id === selectedProject.faixa_granulometrica_id);
  }, [selectedProject, faixas]);

  const peneirasDoProjecto = useMemo(
    () => filtrarPeneirasPorFaixa(selectedFaixa, PENEIRAS_CONFIG),
    [selectedFaixa]
  );

  const projetosMRAF = useMemo(
    () => projetosDisponiveis.filter(p => p.tipo_projeto === 'MRAF'),
    [projetosDisponiveis]
  );

  const usinasDisponiveis = useMemo(
    () => obraSelecionada?.usinas || [],
    [obraSelecionada]
  );

  const rodoviasDisponiveis = useMemo(
    () => obraSelecionada?.rodovias || [],
    [obraSelecionada]
  );

  return {
    handleChange,
    handleNestedChange,
    handleProjectChange,
    selectedProject,
    peneirasDoProjecto,
    projetosMRAF,
    usinasDisponiveis,
    rodoviasDisponiveis,
  };
}