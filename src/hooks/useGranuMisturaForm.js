import { useState, useEffect } from "react";
import { obterFaixaById } from "@/services/faixasService";
import {
  calcUmidade,
  calcEquivalenteMedicao,
  calcMediaEquivalente,
  calcTeorPulverulentos,
  recalcPassantesPeneiras,
  filtrarProjetosPorObra,
  syncPeneirasComFaixa,
} from "@/utils/granuMisturaUtils";

/**
 * Gerencia todo o estado derivado e os handlers de campo do formulário.
 */
export function useGranuMisturaForm({ formData, setFormData, obras, regionais, projects, faixasDisponiveis, editingId }) {
  const [selectedProject, setSelectedProject]   = useState(null);
  const [faixaGran, setFaixaGran]               = useState(null);
  const [faixaSelecionada, setFaixaSelecionada] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);

  // ── Filtra projetos por obra + material ───────────────────────────────────
  useEffect(() => {
    if (!formData.obra_id) { setFilteredProjects([]); return; }
    setFilteredProjects(
      filtrarProjetosPorObra(formData.obra_id, formData.material, obras, regionais, projects)
    );
  }, [formData.obra_id, formData.material, obras, regionais, projects, editingId]);

  // ── Sincroniza faixa / projeto selecionado ────────────────────────────────
  useEffect(() => {
    if (formData.material === "OUTRO") {
      setSelectedProject(null);
      setFaixaGran(null);
      if (formData.faixa) {
        const fx = faixasDisponiveis.find(f => f.id === formData.faixa);
        setFaixaSelecionada(fx || null);
        if (fx) {
          setFormData(prev => ({ ...prev, peneiras: syncPeneirasComFaixa(fx, prev.peneiras) }));
        }
      } else {
        setFaixaSelecionada(null);
      }
    } else {
      setFaixaSelecionada(null);
      if (!formData.numero_projeto) { setSelectedProject(null); setFaixaGran(null); return; }
      const proj = projects.find(p => p.id === formData.numero_projeto);
      setSelectedProject(proj || null);
      if (proj?.faixa_granulometrica_id) {
        obterFaixaById(proj.faixa_granulometrica_id)
          .then(f => {
            setFaixaGran(f);
            setFormData(prev => ({ ...prev, peneiras: syncPeneirasComFaixa(f, prev.peneiras) }));
          })
          .catch(() => setFaixaGran(null));
      } else {
        setFaixaGran(null);
      }
    }
  }, [formData.numero_projeto, formData.faixa, formData.material, projects, faixasDisponiveis, setFormData]);

  // ── Handlers de campo ─────────────────────────────────────────────────────

  const handleChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handlePeneiraChange = (idx, field, value) => {
    setFormData(prev => {
      const newPeneiras = [...prev.peneiras];
      newPeneiras[idx] = { ...newPeneiras[idx], [field]: value };
      if (field === "retido_g") {
        return { ...prev, peneiras: recalcPassantesPeneiras(newPeneiras, prev.peso_amostra) };
      }
      return { ...prev, peneiras: newPeneiras };
    });
  };

  const handlePesoAmostraChange = (value) => {
    setFormData(prev => ({
      ...prev,
      peso_amostra: value,
      peneiras: recalcPassantesPeneiras(prev.peneiras, value),
    }));
  };

  const handleUmidadeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      umidade: calcUmidade({ ...prev.umidade, [field]: value }),
    }));
  };

  const handleEAChange = (idx, field, value) => {
    setFormData(prev => {
      const medicoes = prev.equivalente_areia.medicoes.map((m, i) => {
        if (i !== idx) return m;
        return calcEquivalenteMedicao({ ...m, [field]: value });
      });
      return {
        ...prev,
        equivalente_areia: { medicoes, media: calcMediaEquivalente(medicoes) },
      };
    });
  };

  const handlePulvChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      materiais_pulverulentos: calcTeorPulverulentos({ ...prev.materiais_pulverulentos, [field]: value }),
    }));
  };

  return {
    selectedProject, faixaGran, faixaSelecionada, filteredProjects,
    handleChange, handlePeneiraChange, handlePesoAmostraChange,
    handleUmidadeChange, handleEAChange, handlePulvChange,
  };
}