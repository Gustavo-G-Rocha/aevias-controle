import { useState, useEffect, useMemo } from "react";
import { obterEnsaioById } from "@/services/ensaiosService";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { getInitialFormData, filtrarObras } from "@/utils/controleExecucaoServicosUtils";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

export function useControleExecucaoServicosData() {
  const [formData, setFormData] = useState(getInitialFormData());
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const { clearSavedData } = useFormPersistence(
    'controle_execucao_servicos_form', formData, setFormData, editMode
  );

  const obras = useMemo(() => {
    if (!auxData?.obras) return [];
    return filtrarObras(auxData.obras);
  }, [auxData?.obras]);

  const regionais = useMemo(() => auxData?.regionais ?? [], [auxData?.regionais]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const editIdParam = urlParams.get('editId');

    if (editIdParam) {
      setEditLoading(true);
      obterEnsaioById('ControleExecucaoServicos', editIdParam)
        .then(registroData => {
          setFormData(registroData);
          setEditMode(true);
          setEditId(editIdParam);
        })
        .catch(error => {
          logger.error("Erro ao carregar dados:", error);
          toast({ title: "Erro ao carregar dados iniciais.", variant: "destructive" });
        })
        .finally(() => setEditLoading(false));
    } else {
      setFormData({
        ...getInitialFormData(),
        laboratorista_name: user.laboratorista_name || user.full_name || "",
      });
    }
  }, [loadingUser, loadingAux, user?.id]);

  const loading = loadingUser || loadingAux || editLoading;

  return {
    formData, setFormData,
    user, obras, regionais,
    loading, editMode, editId, clearSavedData,
  };
}