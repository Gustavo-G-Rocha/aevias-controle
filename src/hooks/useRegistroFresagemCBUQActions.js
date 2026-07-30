import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
      // Confirma que a obra referenciada existe antes de criar o registro,
      // evitando registros órfãos por falha transitória de rede/lookup.
      try {
        await base44.entities.Obra.get(formData.obra_id);
      } catch (obraError) {
        const msg = String(obraError?.message || '').toLowerCase();
        const isTransient = !obraError?.response ||
          obraError?.code === 'ERR_NETWORK' ||
          obraError?.response?.status >= 500 ||
          msg.includes('network') || msg.includes('fetch') || msg.includes('load failed');
        if (isTransient) {
          toast({ title: "Falha temporária ao validar a obra. Tente salvar novamente.", variant: "destructive" });
        } else {
          toast({ title: "Obra não encontrada. Selecione uma obra válida.", variant: "destructive" });
        }
        return;
      }

      const dataToSave = buildDataToSave(formData, finalizar);

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