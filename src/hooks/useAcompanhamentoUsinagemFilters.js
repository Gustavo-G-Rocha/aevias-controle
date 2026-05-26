import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  filtrarProjetosPorObra,
  buildObraFormPatch,
  buildProjectFormPatch,
} from "@/utils/acompanhamentoUsinagemUtils";

export function useAcompanhamentoUsinagemFilters({
  formData, setFormData, obras, regionais, projects,
}) {
  const [filteredProjects, setFilteredProjects] = useState([]);

  // Atualiza projetos filtrados quando obra muda
  useEffect(() => {
    if (formData.obra_id && projects.length > 0 && obras.length > 0) {
      setFilteredProjects(filtrarProjetosPorObra(formData.obra_id, obras, regionais, projects));
    }
  }, [formData.obra_id, projects, obras, regionais]);

  const handleObraChange = (obraId) => {
    const obra = obras.find(o => o.id === obraId);
    setFormData(prev => ({ ...prev, ...buildObraFormPatch(obra), obra_id: obraId }));
  };

  const handleProjectChange = (projectId) => {
    const project = filteredProjects.find(p => p.id === projectId);

    if (project?.faixa_granulometrica_id) {
      base44.entities.FaixaGranulometrica.get(project.faixa_granulometrica_id)
        .then(faixa => {
          if (faixa) setFormData(prev => ({ ...prev, faixa_especificada: faixa.nome || '' }));
        })
        .catch(err => console.error("Erro ao buscar faixa:", err));
    }

    setFormData(prev => ({ ...prev, project_id: projectId, ...buildProjectFormPatch(project) }));
  };

  return { filteredProjects, handleObraChange, handleProjectChange };
}