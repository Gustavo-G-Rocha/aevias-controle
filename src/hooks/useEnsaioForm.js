import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { listarFaixas } from "@/services/faixasService";
import { obterEnsaioById } from "@/services/ensaiosService";
import { useQuery } from "@tanstack/react-query";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { createPageUrl } from "@/utils";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook reutilizável para formulários de ensaios individuais
 * (EnsaioCAUQ, EnsaioMRAF, EnsaioGranulometriaIndividual, etc.)
 *
 * Diferenças em relação ao useChecklistForm:
 * - Usa `data_ensaio` em vez de `data` para normalização de datas
 * - Retorna `editingEnsaio` em vez de `editingChecklist`
 * - Usa base44.entities para carregar entidade (não dynamic import)
 * - filtroTipoObra opcional para filtrar obras por tipo
 *
 * Usa React Query (cache compartilhado via useAuxData) para evitar chamadas redundantes.
 */
export function useEnsaioForm(getInitialFormData, entityName, storageName, { filtroTipoObra } = {}) {
  const [editingEnsaio, setEditingEnsaio] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData);

  const location = useLocation();
  const navigate = useNavigate();

  const { clearSavedData } = useFormPersistence(storageName, formData, setFormData, !!editingEnsaio);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  // FaixaGranulometrica — cache próprio (não está no useAuxData)
  const { data: faixas } = useQuery({
    queryKey: ['faixasGranulometricas'],
    queryFn: () => listarFaixas(),
    staleTime: 10 * 60 * 1000,
  });

  const regionais = auxData?.regionais ?? [];
  const projects = auxData?.projects ?? [];

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    const currentUserAccessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
    let availableObras = auxData.obras;
    if (currentUserAccessLevel === 'user') {
      const emailLower = user.email.toLowerCase();
      const regionaisIds = regionais
        .filter(r =>
          (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
          (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
        )
        .map(r => r.id);
      if (regionaisIds.length > 0) {
        const regionaisSet = new Set(regionaisIds);
        availableObras = auxData.obras.filter(obra =>
          regionaisSet.has(obra.regional_id) &&
          obra.status === 'em_andamento' &&
          (filtroTipoObra ? filtroTipoObra.includes(obra.tipo_obra) : true)
        );
      } else {
        availableObras = [];
      }
    } else if (filtroTipoObra) {
      availableObras = auxData.obras.filter(obra => filtroTipoObra.includes(obra.tipo_obra));
    }
    return availableObras;
  }, [auxData?.obras, regionais, user, filtroTipoObra]);

  // editId derivado de location.search — estável enquanto o parâmetro não muda,
  // evita recarregar o registro ao navegar entre edição/criação (P4).
  const editId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('editId');
  }, [location.search]);

  // Carregar ensaio para edição se editId presente
  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

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
  }, [editId, loadingUser, loadingAux, user?.id, obras, entityName, navigate]);

  const obraSelecionada = useMemo(() => obras.find(o => o.id === formData.obra_id), [obras, formData.obra_id]);
  const regionalSelecionada = useMemo(() => obraSelecionada ? regionais.find(r => r.id === obraSelecionada.regional_id) : null, [obraSelecionada, regionais]);
  const projetosDisponiveis = useMemo(() => {
    if (!regionalSelecionada || !projects) return [];
    return projects.filter(p =>
      (regionalSelecionada.project_ids || []).includes(p.id) &&
      p.status === 'ativo'
    );
  }, [regionalSelecionada, projects]);

  const loading = loadingUser || loadingAux || editLoading;
  const isApproved = formData.approved === true;
  const userCanEdit = user?.role === 'admin' || (formData.created_by === user?.email && (formData.status === 'rascunho' || formData.status === 'finalizado' || formData.approved === false));
  const isEditable = !editingEnsaio?.id || userCanEdit;

  return {
    obras,
    regionais,
    projects,
    faixas: faixas ?? [],
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