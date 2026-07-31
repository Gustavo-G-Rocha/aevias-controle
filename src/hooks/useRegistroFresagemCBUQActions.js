import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { QUERY_KEYS } from "@/hooks/useQueryData";
import { createPageUrl } from "@/utils";
import {
  addRegistro,
  removeRegistro,
  updateRegistro,
  validateFormData,
  buildDataToSave,
  MAX_REGISTROS,
} from "@/utils/registroFresagemCBUQUtils";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

export function useRegistroFresagemCBUQActions({
  formData, setFormData,
  editMode, editId, clearSavedData,
  obras,
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const handleObraChange = (obraId) => {
    setFormData(prev => ({
      ...prev,
      obra_id: obraId,
      rodovia: "",
      contratada: "",
    }));
  };

  const handleAddRegistro = () => {
    const novos = addRegistro(formData.registros);
    if (novos === null) {
      toast({ title: `Limite máximo de ${MAX_REGISTROS} lançamentos atingido.`, variant: "destructive" });
      return;
    }
    setFormData(prev => ({ ...prev, registros: novos }));
  };

  const handleRemoveRegistro = (index) => {
    setFormData(prev => ({ ...prev, registros: removeRegistro(prev.registros, index) }));
  };

  const handleRegistroChange = (index, field, value) => {
    setFormData(prev => ({ ...prev, registros: updateRegistro(prev.registros, index, field, value) }));
  };

  const handleSubmit = async (finalizar = false) => {
    const error = validateFormData(formData, finalizar);
    if (error) { toast({ title: error, variant: "destructive" }); return; }

    setSaving(true);
    try {
      const obraSel = obras?.find(o => o.id === formData.obra_id);
      const dataToSave = {
        ...buildDataToSave(formData, finalizar),
        obra_name: obraSel?.name || "",
        obra_code: obraSel?.code || "",
      };

      if (editMode) {
        await atualizarEnsaio('RegistroFresagemCBUQ', editId, dataToSave);
      } else {
        await criarEnsaio('RegistroFresagemCBUQ', dataToSave);
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords });

      clearSavedData();
      toast({ title: finalizar ? "Registro finalizado com sucesso!" : "Progresso salvo!" });
      navigate(createPageUrl("MeusEnsaios"));
    } catch (error) {
      logger.error("Erro ao salvar:", error);
      const detail = error?.message || 'Erro ao salvar o registro de fresagem.';
      toast({ title: detail, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleObraChange,
    handleAddRegistro,
    handleRemoveRegistro,
    handleRegistroChange,
    handleSubmit,
  };
}