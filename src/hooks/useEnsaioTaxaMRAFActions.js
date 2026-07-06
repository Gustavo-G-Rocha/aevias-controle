import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";

import { toast } from "@/components/ui/use-toast";
/**
 * Hook para ações de salvar, finalizar e navegar
 */
export const useEnsaioTaxaMRAFActions = () => {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  /**
   * Salvar ensaio (rascunho ou finalizado)
   */
  const handleSubmit = useCallback(async (formData, user, editingEnsaio, finalizar = false) => {
    if (!formData.obra_id || !formData.data_ensaio) {
      toast({ title: "Preencha Obra e Data.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        laboratorista_name: user?.laboratorista_name || user?.full_name,
        status: finalizar ? 'finalizado' : 'rascunho'
      };

      // Se foi reprovado anteriormente, limpar status de aprovação
      if (editingEnsaio?.approved === false) {
        dataToSave.approved = null;
        dataToSave.rejection_reason = null;
        dataToSave.approved_by = null;
        dataToSave.approved_date = null;
        dataToSave.was_rejected = true;
      }

      if (editingEnsaio) {
        await atualizarEnsaio('EnsaioTaxaMRAF', editingEnsaio.id, dataToSave);
      } else {
        await criarEnsaio('EnsaioTaxaMRAF', dataToSave);
      }

      navigate(createPageUrl('MeusEnsaios'));
    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast({ title: "Erro ao salvar ensaio.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [navigate]);

  /**
   * Navegar para voltar
   */
  const handleCancel = useCallback(() => {
    navigate(createPageUrl('MeusEnsaios'));
  }, [navigate]);

  return {
    saving,
    handleSubmit,
    handleCancel
  };
};