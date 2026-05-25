import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "@/entities/User";
import { Obra } from "@/entities/Obra";
import { Regional } from "@/entities/Regional";
import { Project } from "@/entities/Project";
import { FaixaGranulometrica } from "@/entities/FaixaGranulometrica";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

/**
 * Hook reutilizável para formulários de ensaios individuais
 * (EnsaioCAUQ, EnsaioMRAF, EnsaioGranulometriaIndividual, etc.)
 *
 * Diferenças em relação ao useChecklistForm:
 * - Usa `data_ensaio` em vez de `data` para normalização de datas
 * - Retorna `editingEnsaio` em vez de `editingChecklist`
 * - Usa base44.entities para carregar entidade (não dynamic import)
 * - filtroTipoObra opcional para filtrar obras por tipo
 */
export function useEnsaioForm(getInitialFormData, entityName, storageName, { filtroTipoObra } = {}) {
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [projects, setProjects] = useState([]);
  const [faixas, setFaixas] = useState([]);
  const [user, setUser] = useState(null);
  const [editingEnsaio, setEditingEnsaio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(getInitialFormData);

  const location = useLocation();
  const navigate = useNavigate();

  const { clearSavedData } = useFormPersistence(storageName, formData, setFormData, !!editingEnsaio);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const userData = await User.me();
        setUser(userData);

        const currentUserAccessLevel = userData?.access_level || (userData?.role === 'admin' ? 'admin' : 'user');

        let faixasData = [];
        try {
          faixasData = await FaixaGranulometrica.list();
        } catch (faixasError) {
          console.warn(`[${entityName}] Faixas indisponíveis:`, faixasError?.message);
        }

        const [obrasData, regionaisData, projectsData] = await Promise.all([
          Obra.list(),
          Regional.list(),
          Project.list()
        ]);

        setRegionais(regionaisData);
        setProjects(projectsData);
        setFaixas(faixasData);

        // Filtrar obras disponíveis
        let availableObras = obrasData;
        if (currentUserAccessLevel === 'user') {
          const regionalDoLaboratorista = regionaisData.find(regional => {
            const laboratoristas = regional.laboratoristas_responsaveis || [];
            return laboratoristas.some(email => email.toLowerCase() === userData.email.toLowerCase());
          });

          if (regionalDoLaboratorista) {
            availableObras = obrasData.filter(obra =>
              obra.regional_id === regionalDoLaboratorista.id &&
              obra.status === 'em_andamento' &&
              (filtroTipoObra ? filtroTipoObra.includes(obra.tipo_obra) : true)
            );
          } else {
            availableObras = [];
          }
        } else if (filtroTipoObra) {
          availableObras = obrasData.filter(obra => filtroTipoObra.includes(obra.tipo_obra));
        }
        setObras(availableObras);

        // Carregar ensaio para edição se editId presente
        const params = new URLSearchParams(location.search);
        const editId = params.get('editId');

        if (editId) {
          const ensaioToEdit = await base44.entities[entityName].get(editId);
          setEditingEnsaio(ensaioToEdit);

          // Permite editar se: admin, ou criador com status rascunho/finalizado não aprovado, ou reprovado
          const isCreator = ensaioToEdit.created_by === userData.email;
          const canEditStatus = ensaioToEdit.status === 'rascunho' || ensaioToEdit.status === 'finalizado' || ensaioToEdit.approved === false;
          const hasPermission = userData.role === 'admin' || (isCreator && canEditStatus);

          if (hasPermission) {
            const initialForm = getInitialFormData();
            setFormData({
              ...initialForm,
              ...ensaioToEdit,
              data_ensaio: ensaioToEdit.data_ensaio
                ? new Date(ensaioToEdit.data_ensaio).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            });
          } else {
            alert("Você não tem permissão para editar este registro.");
            navigate(createPageUrl('MeusEnsaios'));
          }
        } else {
          const initialNewFormData = getInitialFormData();
          if (availableObras.length > 0) {
            initialNewFormData.obra_id = availableObras[0].id;
          }
          setFormData(initialNewFormData);
          setEditingEnsaio(null);
        }
      } catch (error) {
        console.error(`[${entityName}] Erro ao carregar:`, error?.message);
        alert("Erro ao carregar os dados.");
        navigate(createPageUrl('MeusEnsaios'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location.search]);

  const obraSelecionada = useMemo(() => obras.find(o => o.id === formData.obra_id), [obras, formData.obra_id]);
  const regionalSelecionada = useMemo(() => obraSelecionada ? regionais.find(r => r.id === obraSelecionada.regional_id) : null, [obraSelecionada, regionais]);
  const projetosDisponiveis = useMemo(() => {
    if (!regionalSelecionada || !projects) return [];
    return projects.filter(p =>
      (regionalSelecionada.project_ids || []).includes(p.id) &&
      p.status === 'ativo'
    );
  }, [regionalSelecionada, projects]);

  const isApproved = formData.approved === true;
  const userCanEdit = user?.role === 'admin' || (formData.created_by === user?.email && (formData.status === 'rascunho' || formData.status === 'finalizado' || formData.approved === false));
  const isEditable = !editingEnsaio?.id || userCanEdit;

  return {
    obras,
    regionais,
    projects,
    faixas,
    user,
    editingEnsaio,
    setEditingEnsaio,
    loading,
    formData,
    setFormData,
    obraSelecionada,
    regionalSelecionada,
    projetosDisponiveis,
    isApproved,
    isEditable,
    clearSavedData,
    navigate,
  };
}