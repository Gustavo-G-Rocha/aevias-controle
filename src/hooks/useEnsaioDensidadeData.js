/**
 * Hook de carregamento inicial para EnsaioDensidadeInSitu.
 * Busca user, obras, projetos, regionais.
 * Trata modo de edição (editId na query string).
 */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { getInitialFormData, filtrarObrasDisponiveis } from "@/utils/ensaioDensidadeUtils";
import { getFuroInicial } from "@/utils/ensaioDensidadeUtils";

export function useEnsaioDensidadeData() {
  const [formData, setFormData] = useState(getInitialFormData());
  const [obras, setObras] = useState([]);
  const [projects, setProjects] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingEnsaio, setEditingEnsaio] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [obrasData, projectsData, regionaisData] = await Promise.all([
          base44.entities.Obra.list(),
          base44.entities.Project.list(),
          base44.entities.Regional.list(),
        ]);

        const availableObras = filtrarObrasDisponiveis(obrasData, regionaisData, currentUser);

        setObras(availableObras);
        setProjects(projectsData);
        setRegionais(regionaisData);

        const params = new URLSearchParams(location.search);
        const editId = params.get('editId');

        if (editId) {
          const ensaioToEdit = await base44.entities.EnsaioDensidadeInSitu.get(editId);
          if (
            currentUser.role === 'admin' ||
            (ensaioToEdit.created_by === currentUser.email && ensaioToEdit.approved !== true)
          ) {
            setEditingEnsaio(ensaioToEdit);
            setFormData({
              ...ensaioToEdit,
              data_ensaio: ensaioToEdit.data_ensaio
                ? new Date(ensaioToEdit.data_ensaio).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              furos:
                ensaioToEdit.furos && ensaioToEdit.furos.length > 0
                  ? ensaioToEdit.furos
                  : [getFuroInicial(1)],
              fotos: Array.isArray(ensaioToEdit.fotos) ? ensaioToEdit.fotos : [],
            });
          } else {
            alert("Você não tem permissão para editar este registro.");
            navigate(createPageUrl('MeusEnsaios'));
          }
        } else {
          if (availableObras.length > 0) {
            const primeiraObra = availableObras[0];
            const regional = regionaisData.find(r => r.id === primeiraObra.regional_id);

            let gestorName = "";
            if (regional?.gestor_contrato_responsavel) {
              try {
                const allUsers = await base44.entities.User.list();
                const gestor = allUsers.find(
                  u => u.email.toLowerCase() === regional.gestor_contrato_responsavel.toLowerCase()
                );
                gestorName = gestor ? gestor.laboratorista_name || gestor.full_name : "";
              } catch (error) {
                console.warn("Sem permissão para listar usuários");
              }
            }

            setFormData(prev => ({
              ...prev,
              obra_id: primeiraObra.id,
              engenheiro_responsavel: gestorName,
            }));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados.");
        navigate(createPageUrl('MeusEnsaios'));
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [location.search]);

  return { formData, setFormData, obras, projects, regionais, user, loading, editingEnsaio };
}