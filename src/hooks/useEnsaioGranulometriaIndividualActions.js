import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { createPageUrl } from "@/utils";
import { sanitizeAgregados, sanitizeEquivalenteAreia } from "@/utils/dataSanitization";
import { validateGranulometriaIndividual } from "@/utils/ensaioValidation";

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export function useEnsaioGranulometriaIndividualActions({
  formData, user, editingEnsaio, navigate,
}) {
  const handleSubmit = async (e, saveStatus = 'finalizado') => {
    e.preventDefault();

    const validation = validateGranulometriaIndividual(formData, saveStatus);
    if (!validation.valid) {
      toast({ title: validation.message });
      return;
    }

    const dataToSave = {
      ...formData,
      status: saveStatus,
      agregados:         sanitizeAgregados(formData.agregados),
      equivalente_areia: sanitizeEquivalenteAreia(formData.equivalente_areia),
    };

    try {
      if (editingEnsaio?.id) {
        const updateData = { ...dataToSave };
        let successMessage = saveStatus === 'rascunho' ? "Progresso salvo!" : "Ensaio finalizado!";

        if (editingEnsaio.approved === false && saveStatus === 'finalizado') {
          updateData.approved          = null;
          updateData.rejection_reason  = null;
          updateData.approved_by       = null;
          updateData.approved_date     = null;
          updateData.was_rejected      = true;
          successMessage = "Ensaio atualizado! Voltará para análise.";
        }

        await atualizarEnsaio('EnsaioGranulometriaIndividual', editingEnsaio.id, updateData);
        toast({ title: successMessage });
      } else {
        await criarEnsaio('EnsaioGranulometriaIndividual', {
          ...dataToSave,
          laboratorista_name: user.laboratorista_name || user.full_name,
        });
        toast({ title: saveStatus === 'rascunho' ? "Progresso salvo!" : "Ensaio criado!" });
      }
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      logger.error("Erro ao salvar:", error);
      // Exibe o motivo real retornado pelo servidor (validação, permissão,
      // conflito) em vez de uma mensagem genérica que esconde a causa.
      const serverMessage = error?.message && !/^Falha ao (criar|atualizar) ensaio$/.test(error.message)
        ? error.message
        : "Erro ao salvar o ensaio.";
      toast({ title: serverMessage, variant: "destructive" });
    }
  };

  return { handleSubmit };
}