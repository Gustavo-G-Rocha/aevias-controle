/**
 * Hook de carregamento de dados iniciais do Ensaio de Sondagem.
 * Usa React Query (cache compartilhado via useAuxData) para evitar chamadas redundantes.
 */
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import {
  getInitialFormData,
  filtrarObrasPorAcesso,
  filtrarProjetosPorObra,
} from "@/utils/ensaioSondagemUtils";

export function useEnsaioSondagemData() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [editingEnsaio, setEditingEnsaio] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());

  const location = useLocation();
  const navigate = useNavigate();

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const regionais = auxData?.regionais ?? [];
  const allProjects = auxData?.projects ?? [];

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    return filtrarObrasPorAcesso(auxData.obras, regionais, user);
  }, [auxData?.obras, regionais, user]);

  // Carregamento inicial — preenche laboratorista e carrega ensaio para edição
  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    setFormData(prev => ({
      ...prev,
      laboratorista_name: user.laboratorista_name || user.full_name,
    }));

    const params = new URLSearchParams(location.search);
    const editId = params.get('editId');

    if (editId) {
      base44.entities.EnsaioSondagem.get(editId)
        .then(ensaioToEdit => {
          const podeEditar = user.role === 'admin' ||
            (ensaioToEdit.created_by === user.email &&
              (ensaioToEdit.status === 'rascunho' || ensaioToEdit.approved === false));
          if (podeEditar) {
            setEditingEnsaio(ensaioToEdit);
            setFormData(ensaioToEdit);
          } else {
            alert("Você não tem permissão para editar este registro.");
            navigate(createPageUrl('MeusEnsaios'));
          }
        })
        .catch(error => {
          console.error("[EnsaioSondagem] Erro ao carregar dados:", error?.message || error);
          alert("Erro ao carregar dados iniciais.");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [location.search, loadingUser, loadingAux, user?.id, navigate]);

  // Atualiza projetos quando obra muda (limpa quando obra é desmarcada)
  useEffect(() => {
    if (!formData.obra_id) {
      setProjects([]);
      return;
    }
    if (obras.length > 0) {
      setProjects(filtrarProjetosPorObra(allProjects, formData.obra_id, obras, regionais));
    }
  }, [formData.obra_id, obras, regionais, allProjects]);

  // Preenche parâmetros de projeto quando projeto muda
  useEffect(() => {
    if (formData.project_id && projects.length > 0) {
      const proj = projects.find(p => p.id === formData.project_id);
      if (proj) {
        setFormData(prev => ({
          ...prev,
          volume_vazios_projeto: proj.volume_vazios?.otimo || "",
          dens_aparente_projeto: proj.massa_especifica_aparente || "",
          dens_rice_projeto: proj.densidade_maxima_medida || "",
        }));
      }
    }
  }, [formData.project_id, projects]);

  return {
    loading, obras, projects,
    editingEnsaio, setEditingEnsaio,
    formData, setFormData,
  };
}