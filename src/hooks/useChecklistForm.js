import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { createPageUrl } from "@/utils";



/**
 * Hook reutilizável para formulários de checklist
 * Gerencia carregamento de dados, persistência, edição e permissões
 */
export function useChecklistForm(getInitialFormData, entityName, storageName, canEditExtra = null) {
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [projects, setProjects] = useState([]);
  const [faixas, setFaixas] = useState([]);
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [obraDoRegistro, setObraDoRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(getInitialFormData());

  const location = useLocation();
  const navigate = useNavigate();

  const { clearSavedData } = useFormPersistence(storageName, formData, setFormData, !!editingChecklist);

  // Carregar dados na montagem
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        const isAdmin = userData?.role === 'admin';

        // Carregar dados em paralelo
        const dataPromises = [
          base44.entities.Obra.list(),
          base44.entities.Regional.list(),
          base44.entities.Project.list()
        ];

        let faixasData = [];
        try {
          faixasData = await base44.entities.FaixaGranulometrica.list();
        } catch (faixasError) {
          console.warn(`[${entityName}] Faixas indisponíveis:`, faixasError?.message);
        }

        if (isAdmin) {
          dataPromises.push(base44.entities.User.list());
        }

        const loadedData = await Promise.all(dataPromises);
        const [obrasData, regionaisData, projectsData, allUsersDataFetchedIfAdmin] = loadedData;

        setRegionais(regionaisData);
        setProjects(projectsData);
        setFaixas(faixasData);
        setAllUsers(isAdmin ? allUsersDataFetchedIfAdmin : [userData]);

        // Filtrar obras disponíveis para o usuário
        let availableObras = obrasData;
        if (!isAdmin) {
          const regionalDoLaboratorista = regionaisData.find(regional => {
            const laboratoristas = regional.laboratoristas_responsaveis || [];
            return laboratoristas.some(email => email.toLowerCase() === userData.email.toLowerCase());
          });

          if (regionalDoLaboratorista) {
            availableObras = obrasData.filter(obra =>
              obra.regional_id === regionalDoLaboratorista.id &&
              obra.status === 'em_andamento'
            );
          } else {
            availableObras = [];
          }
        }
        setObras(availableObras);

        // Carregar checklist para edição se editId presente
        const params = new URLSearchParams(location.search);
        const editId = params.get('editId');

        if (editId) {
          const checklistToEdit = await base44.entities[entityName].get(editId);
          setEditingChecklist(checklistToEdit);

          const isOwnerCheck = checklistToEdit.created_by?.toLowerCase() === userData.email?.toLowerCase() || checklistToEdit.created_by_id === userData.id;
          const obraRegistroAtual = obrasData.find(o => o.id === checklistToEdit.obra_id) || null;
          setObraDoRegistro(obraRegistroAtual);
          const extraCanEdit = typeof canEditExtra === 'function'
            ? canEditExtra(userData, checklistToEdit, obraRegistroAtual, regionaisData)
            : false;
          if (userData.role === 'admin' || extraCanEdit || (isOwnerCheck && (checklistToEdit.status === 'rascunho' || checklistToEdit.approved === false || checklistToEdit.approved === null))) {
            const initialForm = getInitialFormData();
            // Deep-merge object fields so saved records don't lose keys added after initial save
          const mergedObjectFields = {};
          for (const key of Object.keys(initialForm)) {
            if (initialForm[key] !== null && typeof initialForm[key] === 'object' && !Array.isArray(initialForm[key])) {
              mergedObjectFields[key] = { ...initialForm[key], ...(checklistToEdit[key] || {}) };
            }
          }

          const loadedFormData = {
              ...initialForm,
              ...checklistToEdit,
              ...mergedObjectFields,
              data: checklistToEdit.data ? new Date(checklistToEdit.data).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              fotos: Array.isArray(checklistToEdit.fotos) ? checklistToEdit.fotos : [],
            };

            setFormData(loadedFormData);
          } else {
            alert("Você não tem permissão para editar este registro.");
            navigate(createPageUrl('MeusEnsaios'));
          }
        } else {
          const initialNewFormData = getInitialFormData();
          initialNewFormData.inspetor_campo = userData.laboratorista_name || userData.full_name;
          if (availableObras.length > 0) {
            initialNewFormData.obra_id = availableObras[0].id;
          }
          setFormData(initialNewFormData);
          setEditingChecklist(null);
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
  }, [location.search, entityName, navigate]);

  // Helpers para obra/regional/projetos
  const obraSelecionada = useMemo(() => obras.find(o => o.id === formData.obra_id), [obras, formData.obra_id]);
  const regionalSelecionada = useMemo(() => obraSelecionada ? regionais.find(r => r.id === obraSelecionada.regional_id) : null, [obraSelecionada, regionais]);
  const projetosDisponiveis = useMemo(() => {
    if (!regionalSelecionada || !projects) return [];
    const regionalProjectIds = regionalSelecionada.project_ids || [];
    return projects.filter(p =>
      regionalProjectIds.includes(p.id) &&
      p.status === 'ativo'
    );
  }, [regionalSelecionada, projects]);

  // Permissões — calculadas apenas quando user já foi carregado
  const isApproved = formData.approved === true && formData.status !== 'rascunho';

  const extraCanEdit = useMemo(() => {
    if (loading || !editingChecklist?.id || typeof canEditExtra !== 'function') return false;
    return canEditExtra(user, editingChecklist, obraDoRegistro, regionais);
  }, [loading, user, editingChecklist, obraDoRegistro, regionais, canEditExtra]);

  const userCanEdit = loading ? false : (
    user?.role === 'admin' ||
    !editingChecklist?.id ||
    extraCanEdit ||
    (
      (
        formData.created_by?.toLowerCase() === user?.email?.toLowerCase() ||
        formData.created_by_id === user?.id ||
        editingChecklist?.created_by?.toLowerCase() === user?.email?.toLowerCase() ||
        editingChecklist?.created_by_id === user?.id
      ) &&
      (formData.status === 'rascunho' || formData.approved === false || formData.approved === null)
    )
  );
  const isEditable = userCanEdit;

  return {
    obras,
    regionais,
    projects,
    faixas,
    user,
    allUsers,
    editingChecklist,
    loading,
    formData,
    setFormData,
    obraSelecionada,
    regionalSelecionada,
    projetosDisponiveis,
    isApproved,
    userCanEdit,
    isEditable,
    extraCanEdit,
    clearSavedData,
    navigate,
  };
}