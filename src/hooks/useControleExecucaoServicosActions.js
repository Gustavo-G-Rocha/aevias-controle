import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
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
      // Validação pré-salvamento: confirma que a obra referenciada existe.
      // Uma falha transitória de rede/lookup aqui impede a criação de um
      // registro órfão (obra_id inválido) e orienta o usuário a tentar de novo.
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
        await atualizarEnsaio('ControleExecucaoServicos', editId, dataToSave);
      } else {
        await criarEnsaio('ControleExecucaoServicos', dataToSave);
      }

      clearSavedData();
      toast({ title: finalizar ? "Controle finalizado com sucesso!" : "Progresso salvo!" });
      navigate(createPageUrl("MeusEnsaios"));
    } catch (error) {
      logger.error("Erro ao salvar:", error);
      // criarEnsaio propaga a mensagem do backend (validação/tenant/rede) em
      // error.message; sem isso, o usuário (e os testes) só vê um toast genérico
      // que esconde a causa real — ex.: "Sem permissão sobre a obra (tenant)".
      const detail = error?.message || 'Erro ao salvar controle de execução.';
      toast({ title: detail, variant: "destructive" });
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