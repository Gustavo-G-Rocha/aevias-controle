import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { createPageUrl } from "@/utils";
import {
  addServico,
  removeServico,
  updateServico,
  validateFormData,
  buildDataToSave,
  MAX_SERVICOS,
} from "@/utils/controleExecucaoServicosUtils";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

export function useControleExecucaoServicosActions({
  formData, setFormData,
  editMode, editId, clearSavedData,
}) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleObraChange = (obraId) => {
    setFormData(prev => ({
      ...prev,
      obra_id: obraId,
      rodovia: "",
    }));
  };

  const handleAddServico = () => {
    const novos = addServico(formData.servicos);
    if (novos === null) {
      toast({ title: `Limite máximo de ${MAX_SERVICOS} serviços atingido.`, variant: "destructive" });
      return;
    }
    setFormData(prev => ({ ...prev, servicos: novos }));
  };

  const handleRemoveServico = (index) => {
    setFormData(prev => ({ ...prev, servicos: removeServico(prev.servicos, index) }));
  };

  const handleServicoChange = (index, field, value) => {
    setFormData(prev => ({ ...prev, servicos: updateServico(prev.servicos, index, field, value) }));
  };

  const handleSubmit = async (finalizar = false) => {
    const error = validateFormData(formData, finalizar);
    if (error) { toast({ title: error, variant: "destructive" }); return; }

    setSaving(true);
    try {
      const dataToSave = buildDataToSave(formData, finalizar);

      if (editMode) {
        await atualizarEnsaio('ControleExecucaoServicos', editId, dataToSave);
      } else {
        await criarEnsaio('ControleExecucaoServicos', dataToSave);
      }

      clearSavedData();
      toast({ title: finalizar ? "Controle finalizado com sucesso!" : "Progresso salvo!" });
      navigate(createPageUrl("MeusEnsaios"));
    } catch (error) {
      logger.error("Erro ao salvar:", error);
      toast({ title: "Erro ao salvar controle de execução.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleObraChange,
    handleAddServico,
    handleRemoveServico,
    handleServicoChange,
    handleSubmit,
  };
}