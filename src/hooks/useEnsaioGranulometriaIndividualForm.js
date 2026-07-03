import { useState, useEffect, useMemo } from "react";
import { obterFaixaById } from "@/services/faixasService";
import { filtrarPeneirasPorFaixa, PENEIRAS_CONFIG } from "@/constants/sieves";
import {
  AGREGADO_VAZIO,
  AGREGADO_CAMPOS_PERMITIDOS,
  GRANULOMETRIA_CAMPOS_PERMITIDOS,
  EQUIVALENTE_CAMPOS_PERMITIDOS,
  calcAgregadoUmidade,
  recalcPassantes,
  calcEquivalente,
  calcMediaEquivalente,
  getPedreirasDoProjeto,
  buildAgregadosDoProjeto,
} from "@/utils/ensaioGranulometriaIndividualUtils";
import { PENEIRAS_CONFIG as PC } from "@/constants/sieves";

const PENEIRAS_PERMITIDAS = PC.map(p => p.key);

export function useEnsaioGranulometriaIndividualForm({
  formData, setFormData,
  projects, projetosDisponiveis, editingEnsaio,
}) {
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject]   = useState(null);
  const [selectedFaixa,   setSelectedFaixa]     = useState(null);

  const peneirasVisiveis = useMemo(
    () => filtrarPeneirasPorFaixa(selectedFaixa, PENEIRAS_CONFIG).map(p => p.key),
    [selectedFaixa]
  );

  // Filtra projetos por tipo de material
  useEffect(() => {
    setFilteredProjects(
      formData.tipo_material
        ? projetosDisponiveis.filter(p => p.tipo_projeto === formData.tipo_material)
        : projetosDisponiveis
    );
  }, [formData.tipo_material, projetosDisponiveis]);

  // Carrega dados do projeto ao selecionar
  useEffect(() => {
    const loadProjectData = async () => {
      if (!formData.project_id) {
        setSelectedProject(null);
        setSelectedFaixa(null);
        return;
      }
      const proj = projects.find(p => p.id === formData.project_id);
      setSelectedProject(proj);

      if (proj) {
        if (proj.faixa_granulometrica_id) {
          try {
            const faixa = await obterFaixaById(proj.faixa_granulometrica_id);
            setFormData(prev => ({ ...prev, faixa: faixa.nome }));
            setSelectedFaixa(faixa);
          } catch (error) {
            console.error("Erro ao carregar faixa:", error);
            setSelectedFaixa(null);
          }
        } else {
          setSelectedFaixa(null);
        }

        if (proj.agregados?.length > 0) {
          setFormData(prev => ({ ...prev, pedreira: getPedreirasDoProjeto(proj) }));
          if (!editingEnsaio?.id) {
            setFormData(prev => ({ ...prev, agregados: buildAgregadosDoProjeto(proj) }));
          }
        }
      }
    };
    loadProjectData();
  }, [formData.project_id, projects]); // editingEnsaio e setFormData são estáveis

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAgregadoChange = (index, field, value) => {
    if (!AGREGADO_CAMPOS_PERMITIDOS.includes(field)) return;
    const newAgregados = [...formData.agregados];
    newAgregados[index] = { ...newAgregados[index], [field]: value };

    if (field === 'peso_umido' || field === 'peso_seco') {
      const umidPatch = calcAgregadoUmidade(newAgregados[index].peso_umido, newAgregados[index].peso_seco);
      Object.assign(newAgregados[index], umidPatch);

      if (field === 'peso_seco') {
        const pesoSeco = parseFloat(value) || 0;
        newAgregados[index].granulometria = recalcPassantes(
          newAgregados[index].granulometria, pesoSeco, selectedFaixa
        );
      }
    }
    setFormData(prev => ({ ...prev, agregados: newAgregados }));
  };

  const handleGranulometriaChange = (agregadoIndex, peneira, field, value) => {
    if (!GRANULOMETRIA_CAMPOS_PERMITIDOS.includes(field) || !PENEIRAS_PERMITIDAS.includes(peneira)) return;

    const newAgregados = [...formData.agregados];
    const agr = newAgregados[agregadoIndex];
    if (!agr.granulometria) agr.granulometria = {};
    agr.granulometria[peneira] = { ...(agr.granulometria[peneira] || {}), [field]: value };

    if (field === 'retido') {
      const pesoSeco = parseFloat(agr.peso_seco) || 0;
      agr.granulometria = recalcPassantes(agr.granulometria, pesoSeco, selectedFaixa);
    }
    setFormData(prev => ({ ...prev, agregados: newAgregados }));
  };

  const addAgregado = () => {
    if (formData.agregados.length < 4) {
      setFormData(prev => ({ ...prev, agregados: [...prev.agregados, AGREGADO_VAZIO()] }));
    }
  };

  const removeAgregado = (index) => {
    if (formData.agregados.length > 1) {
      setFormData(prev => ({ ...prev, agregados: prev.agregados.filter((_, i) => i !== index) }));
    }
  };

  const handleEquivalenteChange = (index, field, value) => {
    if (!EQUIVALENTE_CAMPOS_PERMITIDOS.includes(field)) return;

    const newMedicoes = [...formData.equivalente_areia.medicoes];
    newMedicoes[index] = { ...newMedicoes[index], [field]: value };

    const updated = { ...newMedicoes[index] };
    if (field === 'topo_argila' || field === 'topo_areia') {
      newMedicoes[index].equivalente = calcEquivalente(
        field === 'topo_argila' ? value : updated.topo_argila,
        field === 'topo_areia'  ? value : updated.topo_areia,
      );
    }

    setFormData(prev => ({
      ...prev,
      equivalente_areia: {
        medicoes: newMedicoes,
        media: calcMediaEquivalente(newMedicoes),
      },
    }));
  };

  return {
    filteredProjects,
    selectedProject,
    peneirasVisiveis,
    handleChange,
    handleAgregadoChange,
    handleGranulometriaChange,
    addAgregado,
    removeAgregado,
    handleEquivalenteChange,
  };
}