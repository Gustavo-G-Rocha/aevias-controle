import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obterEnsaioById } from "@/services/ensaiosService";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { createPageUrl } from "@/utils";
import { useFormDataLoader } from "@/hooks/useFormDataLoader";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook reutilizável para formulários de ensaios individuais
 * (EnsaioCAUQ, EnsaioMRAF, EnsaioGranulometriaIndividual, etc.)
 *
 * Diferenças em relação ao useChecklistForm:
 * - Usa `data_ensaio` em vez de `data` para normalização de datas
 * - Retorna `editingEnsaio` em vez de `editingChecklist`
 * - Usa `obterEnsaioById` (não `obterChecklistById`)
 * - filtroTipoObra opcional para filtrar obras por tipo
 * - Usa `useAccessLevel: true` no useFormDataLoader (access_level 'user' = laboratorista)
 *
 * Lógica de carregamento de dados (user, obras, regionais, projetos, faixas,
 * filtragem por acesso, editId, valores derivados) delegada a useFormDataLoader.
 */
export function useEnsaioForm(getInitialFormData, entityName, storageName, { filtroTipoObra } = {}) {
  const [editingEnsaio, setEditingEnsaio] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData);

  const navigate = useNavigate();

  const { clearSavedData } = useFormPersistence(storageName, formData, setFormData, !!editingEnsaio);

  const {
    user, obras, regionais, projects, faixas, editId,
    loading: dataLoading,
    obraSelecionada, regionalSelecionada, projetosDisponiveis,
  } = useFormDataLoader({ formData, filtroTipoObra, useAccessLevel: true });

  // Carregar ensaio para edição se editId presente
  useEffect(() => {
    if (dataLoading || !user) return;

    if (editId) {
      setEditLoading(true);
      obterEnsaioById(entityName, editId)
        .then(ensaioToEdit => {
          setEditingEnsaio(ensaioToEdit);
          const isCreator = ensaioToEdit.created_by === user.email;
          const canEditStatus = ensaioToEdit.status === 'rascunho' || ensaioToEdit.status === 'finalizado' || ensaioToEdit.approved === false;
          const hasPermission = user.role === 'admin' || (isCreator && canEditStatus);

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
            toast({ title: "Você não tem permissão para editar este registro.", variant: "destructive" });
            navigate(createPageUrl('MeusEnsaios'));
          }
        })
        .catch(error => {
          console.error(`[${entityName}] Erro ao carregar:`, error?.message);
          toast({ title: "Erro ao carregar os dados.", variant: "destructive" });
          navigate(createPageUrl('MeusEnsaios'));
        })
        .finally(() => setEditLoading(false));
    } else {
      const initialNewFormData = getInitialFormData();
      if (obras.length > 0) {
        initialNewFormData.obra_id = obras[0].id;
      }
      setFormData(initialNewFormData);
      setEditingEnsaio(null);
    }
  }, [editId, dataLoading, user?.id, obras, entityName, navigate]);

  const loading = dataLoading || editLoading;
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