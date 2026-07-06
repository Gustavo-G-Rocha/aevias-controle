import { useState, useEffect, useMemo, useCallback } from "react";
import { obterEnsaioById } from "@/services/ensaiosService";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { getInitialFormData } from "@/utils/acompanhamentoUsinagemUtils";

import { toast } from "@/components/ui/use-toast";
export function useAcompanhamentoUsinagemData() {
  const [editingId, setEditingId] = useState(null);
  const [isEditable, setIsEditable] = useState(true);
  const [formData, setFormData] = useState(getInitialFormData);
  const [editLoading, setEditLoading] = useState(false);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const obras = auxData?.obras ?? [];
  const regionais = auxData?.regionais ?? [];
  const projects = auxData?.projects ?? [];

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');

    if (editId) {
      setEditLoading(true);
      obterEnsaioById('AcompanhamentoUsinagem', editId)
        .then(ensaioData => {
          const canEdit = ensaioData.created_by === user.email &&
            (ensaioData.status === 'rascunho' || ensaioData.approved === false);
          setIsEditable(canEdit);
          setEditingId(editId);
          setFormData({
            ...ensaioData,
            agregados: ensaioData.agregados || [],
            cargas: ensaioData.cargas || [],
          });
        })
        .catch(error => {
          console.error("Erro ao carregar dados:", error);
          toast({ title: "Erro ao carregar dados iniciais", variant: "destructive" });
        })
        .finally(() => setEditLoading(false));
    } else {
      setFormData(prev => ({
        ...prev,
        laboratorista_name: user.laboratorista_name || user.full_name || '',
      }));
    }
  }, [loadingUser, loadingAux, user?.id]);

  const loading = loadingUser || loadingAux || editLoading;

  return {
    loading, user, obras, regionais, projects,
    editingId, isEditable,
    formData, setFormData,
  };
}