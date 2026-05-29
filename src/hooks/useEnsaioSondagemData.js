/**
 * Hook de carregamento de dados iniciais do Ensaio de Sondagem.
 */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Obra } from "@/entities/Obra";
import { Project } from "@/entities/Project";
import { Regional } from "@/entities/Regional";
import { createPageUrl } from "@/utils";
import {
  getInitialFormData,
  filtrarObrasPorAcesso,
  filtrarProjetosPorObra,
} from "@/utils/ensaioSondagemUtils";

export function useEnsaioSondagemData() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [editingEnsaio, setEditingEnsaio] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());

  const location = useLocation();
  const navigate = useNavigate();

  // Carregamento inicial
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [userData, obrasData, projectsData, regionaisData] = await Promise.all([
          base44.auth.me(),
          Obra.list(),
          Project.list(),
          Regional.list(),
        ]);

        setUser(userData);
        setRegionais(regionaisData);
        setAllProjects(projectsData);
        setObras(filtrarObrasPorAcesso(obrasData, regionaisData, userData));

        setFormData(prev => ({
          ...prev,
          laboratorista_name: userData.laboratorista_name || userData.full_name,
        }));

        const params = new URLSearchParams(location.search);
        const editId = params.get('editId');

        if (editId) {
          const ensaioToEdit = await base44.entities.EnsaioSondagem.get(editId);
          const podeEditar = userData.role === 'admin' ||
            (ensaioToEdit.created_by === userData.email &&
              (ensaioToEdit.status === 'rascunho' || ensaioToEdit.approved === false));

          if (podeEditar) {
            setEditingEnsaio(ensaioToEdit);
            setFormData(ensaioToEdit);
          } else {
            alert("Você não tem permissão para editar este registro.");
            navigate(createPageUrl('MeusEnsaios'));
          }
        }
      } catch (error) {
        console.error("[EnsaioSondagem] Erro ao carregar dados:", error?.message || error);
        alert("Erro ao carregar dados iniciais.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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