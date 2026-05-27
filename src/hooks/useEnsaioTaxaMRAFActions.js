import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

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
      alert("Preencha Obra e Data.");
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
        await base44.entities.EnsaioTaxaMRAF.update(editingEnsaio.id, dataToSave);
      } else {
        await base44.entities.EnsaioTaxaMRAF.create(dataToSave);
      }

      navigate(createPageUrl('MeusEnsaios'));
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert("Erro ao salvar ensaio.");
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