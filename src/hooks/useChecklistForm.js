import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { obterChecklistById } from "@/services/checklistsService";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { createPageUrl } from "@/utils";
import { useFormDataLoader } from "@/hooks/useFormDataLoader";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
import { validateChecklistForm } from '@/utils/formValidationSchemas';
import { normalizeChecklistEditData } from '@/utils/checklistEditNormalization';

/**
 * Hook reutilizável para formulários de checklist.
 * Gerencia carregamento de registro para edição, persistência e permissões.
 *
 * Diferenças em relação ao useEnsaioForm:
 * - Usa `data` em vez de `data_ensaio` para normalização de datas
 * - Retorna `editingChecklist` em vez de `editingEnsaio`
 * - Usa `obterChecklistById` (não `obterEnsaioById`)
 * - Suporta `canEditExtra` (predicado para perfis autorizados editarem)
 * - Aceita opções específicas sem duplicar carregamento, permissões ou persistência
 * - Faz deep-merge de campos objeto ao carregar edição
 * - Expõe `allUsers` (admin vê todos; demais veem apenas o próprio)
 *
 * Lógica de carregamento de dados (user, obras, regionais, projetos, faixas,
 * filtragem por acesso, editId, valores derivados) delegada a useFormDataLoader.
 */
const defaultCanOwnerEditStatus = (checklist) =>
  checklist.status === 'rascunho' || checklist.approved === false || checklist.approved === null;
const defaultIsOwner = (user, checklist) =>
  checklist?.created_by?.toLowerCase() === user?.email?.toLowerCase() || checklist?.created_by_id === user?.id;

export function useChecklistForm(getInitialFormData, entityName, storageName, canEditExtra = null, options = {}) {
  const {
    filtroTipoObra = null,
    normalizeLoadedData = normalizeChecklistEditData,
    initializeNewData = null,
    canOwnerEditStatus = defaultCanOwnerEditStatus,
    isOwner = defaultIsOwner,
  } = options;
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [obraDoRegistro, setObraDoRegistro] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  const navigate = useNavigate();

  const { clearSavedData } = useFormPersistence(storageName, formData, setFormData, !!editingChecklist);

  const {
    user, auxData, obras, regionais, projects, faixas, editId,
    loading: dataLoading,
    obraSelecionada, regionalSelecionada, projetosDisponiveis,
  } = useFormDataLoader({
    formData,
    needsUsers: true,
    filtroTipoObra,
    useAccessLevel: false,
  });

  const isAdmin = user?.role === 'admin';
  const allUsers = isAdmin ? (auxData?.users ?? []) : (user ? [user] : []);

  // Carregar checklist para edição se editId presente
  useEffect(() => {
    if (dataLoading || !user) return;

    if (editId) {
      setEditLoading(true);
      obterChecklistById(entityName, editId)
        .then(checklistToEdit => {
          setEditingChecklist(checklistToEdit);
          const isOwnerCheck = isOwner(user, checklistToEdit);
          // Busca na lista completa (não filtrada) para encontrar a obra mesmo se não estiver em_andamento
          const obraRegistroAtual = (auxData?.obras || []).find(o => o.id === checklistToEdit.obra_id) || null;
          setObraDoRegistro(obraRegistroAtual);
          const extraCanEdit = typeof canEditExtra === 'function'
            ? canEditExtra(user, checklistToEdit, obraRegistroAtual, regionais)
            : false;
          if (user.role === 'admin' || extraCanEdit || (isOwnerCheck && canOwnerEditStatus(checklistToEdit))) {
            const initialForm = getInitialFormData();
            setFormData(normalizeLoadedData(initialForm, checklistToEdit));
          } else {
            toast({ title: "Você não tem permissão para editar este registro.", variant: "destructive" });
            navigate(createPageUrl('MeusEnsaios'));
          }
        })
        .catch(error => {
          logger.error(`[${entityName}] Erro ao carregar:`, error?.message);
          toast({ title: "Erro ao carregar os dados.", variant: "destructive" });
          navigate(createPageUrl('MeusEnsaios'));
        })
        .finally(() => setEditLoading(false));
    } else {
      const initialNewFormData = getInitialFormData();
      const initializedData = typeof initializeNewData === 'function'
        ? initializeNewData(initialNewFormData, user, obras)
        : {
            ...initialNewFormData,
            inspetor_campo: user.laboratorista_name || user.full_name,
            obra_id: obras[0]?.id || initialNewFormData.obra_id,
          };
      setFormData(initializedData);
      setEditingChecklist(null);
    }
  }, [editId, dataLoading, user?.id, obras, auxData, entityName, navigate, canEditExtra, regionais, normalizeLoadedData, initializeNewData, canOwnerEditStatus, isOwner]);

  // Permissões — calculadas apenas quando user já foi carregado
  const loading = dataLoading || editLoading;
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
      (isOwner(user, formData) || isOwner(user, editingChecklist)) &&
      canOwnerEditStatus(formData)
    )
  );
  const isEditable = userCanEdit;

  const validateForm = (saveStatus = 'rascunho') => validateChecklistForm(formData, saveStatus);

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
    validateForm,
    extraCanEdit,
    clearSavedData,
    navigate,
  };
}