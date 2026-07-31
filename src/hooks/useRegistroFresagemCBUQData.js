import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { obterEnsaioById } from "@/services/ensaiosService";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { getInitialFormData, filtrarObras } from "@/utils/registroFresagemCBUQUtils";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

export function useRegistroFresagemCBUQData() {
  const [formData, setFormData] = useState(getInitialFormData());
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const location = useLocation();
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const { clearSavedData } = useFormPersistence(
    'registro_fresagem_cbuq_form', formData, setFormData, editMode
  );

  const obras = useMemo(() => {
    if (!auxData?.obras) return [];
    const filtered = filtrarObras(auxData.obras);
    // Em modo de edição, garante que a obra selecionada apareça no dropdown
    // mesmo se não passar pelo filtro (ex: obra de gerenciamento, ou obra
    // deletada cujos dados denormalizados ainda estão no registro).
    if (formData.obra_id) {
      const inFiltered = filtered.find(o => o.id === formData.obra_id);
      if (inFiltered) return filtered;
      const inFull = auxData.obras.find(o => o.id === formData.obra_id);
      if (inFull) return [inFull, ...filtered];
      // Obra deletada: cria entrada sintética a partir dos campos denormalizados
      // para que o select mostre o nome e a rodovia não fique vazia.
      if (formData.obra_name || formData.obra_code) {
        return [{
          id: formData.obra_id,
          name: formData.obra_name || "(Obra excluída)",
          code: formData.obra_code || "",
          rodovias: [],
          empreiteiras: formData.contratada ? [formData.contratada] : [],
        }, ...filtered];
      }
    }
    return filtered;
  }, [auxData?.obras, formData?.obra_id, formData?.obra_name, formData?.obra_code, formData?.contratada]);

  const regionais = useMemo(() => auxData?.regionais ?? [], [auxData?.regionais]);
  const projects = useMemo(() => auxData?.projects ?? [], [auxData?.projects]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const urlParams = new URLSearchParams(location.search);
    const editIdParam = urlParams.get('editId');

    if (editIdParam) {
      if (editIdParam === editId) return; // já carregado (troca de URL pós-salvar)
      setEditLoading(true);
      obterEnsaioById('RegistroFresagemCBUQ', editIdParam)
        .then(registroData => {
          setFormData({ ...getInitialFormData(), ...registroData });
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
  }, [loadingUser, loadingAux, user?.id, location.search]);

  const loading = loadingUser || loadingAux || editLoading;

  return {
    formData, setFormData,
    user, obras, regionais, projects,
    loading, editMode, editId, clearSavedData,
  };
}