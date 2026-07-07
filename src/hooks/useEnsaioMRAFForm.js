import { useCallback, useMemo } from "react";
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

  // ── cálculo de extração de ligante inline no onChange ──────────────────────
  // Evita o ciclo effect → setFormData → re-render → effect a cada digitação.
  // O cálculo é feito no momento do onChange, atualizando campo + derivados em
  // uma única chamada de setFormData.
  const handleExtracaoLiganteChange = useCallback((field, value) => {
    setFormData(prev => {
      const updatedExt = { ...prev.extracao_ligante, [field]: value };
      const patches = calcExtracaoLigante(updatedExt);
      return {
        ...prev,
        extracao_ligante: { ...updatedExt, ...patches },
      };
    });
  }, [setFormData]);

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
    handleExtracaoLiganteChange,
    handleProjectChange,
    selectedProject,
    peneirasDoProjecto,
    projetosMRAF,
    usinasDisponiveis,
    rodoviasDisponiveis,
  };
}