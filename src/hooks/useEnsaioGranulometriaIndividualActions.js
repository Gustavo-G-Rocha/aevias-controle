import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { createPageUrl } from "@/utils";
import { sanitizeAgregados, sanitizeEquivalenteAreia } from "@/utils/dataSanitization";
import { validateGranulometriaIndividual } from "@/utils/ensaioValidation";

export function useEnsaioGranulometriaIndividualActions({
  formData, user, editingEnsaio, navigate,
}) {
  const handleSubmit = async (e, saveStatus = 'finalizado') => {
    e.preventDefault();

    const validation = validateGranulometriaIndividual(formData, saveStatus);
    if (!validation.valid) {
      alert(validation.message);
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
        alert(successMessage);
      } else {
        await criarEnsaio('EnsaioGranulometriaIndividual', {
          ...dataToSave,
          laboratorista_name: user.laboratorista_name || user.full_name,
        });
        alert(saveStatus === 'rascunho' ? "Progresso salvo!" : "Ensaio criado!");
      }
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o ensaio.");
    }
  };

  return { handleSubmit };
}