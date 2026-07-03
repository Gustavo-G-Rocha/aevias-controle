import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { listarFaixas } from "@/services/faixasService";
import { obterChecklistById } from "@/services/checklistsService";
import { useQuery } from "@tanstack/react-query";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { createPageUrl } from "@/utils";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";

/**
 * Hook reutilizável para formulários de checklist
 * Gerencia carregamento de dados, persistência, edição e permissões.
 * Usa React Query (cache compartilhado via useAuxData) para evitar chamadas redundantes.
 */
export function useChecklistForm(getInitialFormData, entityName, storageName, canEditExtra = null) {
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [obraDoRegistro, setObraDoRegistro] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  const location = useLocation();
  const navigate = useNavigate();

  const { clearSavedData } = useFormPersistence(storageName, formData, setFormData, !!editingChecklist);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const isAdmin = user?.role === 'admin';
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true, needsUsers: true });

  // FaixaGranulometrica — cache próprio (não está no useAuxData)
  const { data: faixas } = useQuery({
    queryKey: ['faixasGranulometricas'],
    queryFn: () => listarFaixas(),
    staleTime: 10 * 60 * 1000,
  });

  const regionais = auxData?.regionais ?? [];
  const projects = auxData?.projects ?? [];
  const allUsers = isAdmin ? (auxData?.users ?? []) : (user ? [user] : []);

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    if (!isAdmin) {
      const emailLower = user.email.toLowerCase();
      const regionaisIds = regionais
        .filter(r =>
          (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
          (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
        )
        .map(r => r.id);
      if (regionaisIds.length > 0) {
        const regionaisSet = new Set(regionaisIds);
        return auxData.obras.filter(obra =>
          regionaisSet.has(obra.regional_id) &&
          obra.status === 'em_andamento'
        );
      }
      return [];
    }
    return auxData.obras;
  }, [auxData?.obras, regionais, user, isAdmin]);

  // editId derivado de location.search — estável enquanto o parâmetro não muda,
  // evita recarregar o registro ao navegar entre edição/criação (P4).
  const editId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('editId');
  }, [location.search]);

  // Carregar checklist para edição se editId presente
  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    if (editId) {
      setEditLoading(true);
      obterChecklistById(entityName, editId)
        .then(checklistToEdit => {
          setEditingChecklist(checklistToEdit);
          const isOwnerCheck = checklistToEdit.created_by?.toLowerCase() === user.email?.toLowerCase() || checklistToEdit.created_by_id === user.id;
          // Busca na lista completa (não filtrada) para encontrar a obra mesmo se não estiver em_andamento
          const obraRegistroAtual = (auxData?.obras || []).find(o => o.id === checklistToEdit.obra_id) || null;
          setObraDoRegistro(obraRegistroAtual);
          const extraCanEdit = typeof canEditExtra === 'function'
            ? canEditExtra(user, checklistToEdit, obraRegistroAtual, regionais)
            : false;
          if (user.role === 'admin' || extraCanEdit || (isOwnerCheck && (checklistToEdit.status === 'rascunho' || checklistToEdit.approved === false || checklistToEdit.approved === null))) {
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
        })
        .catch(error => {
          console.error(`[${entityName}] Erro ao carregar:`, error?.message);
          alert("Erro ao carregar os dados.");
          navigate(createPageUrl('MeusEnsaios'));
        })
        .finally(() => setEditLoading(false));
    } else {
      const initialNewFormData = getInitialFormData();
      initialNewFormData.inspetor_campo = user.laboratorista_name || user.full_name;
      if (obras.length > 0) {
        initialNewFormData.obra_id = obras[0].id;
      }
      setFormData(initialNewFormData);
      setEditingChecklist(null);
    }
  }, [editId, loadingUser, loadingAux, user?.id, obras, auxData, entityName, navigate, canEditExtra, regionais]);

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
  const loading = loadingUser || loadingAux || editLoading;
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
    faixas: faixas ?? [],
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