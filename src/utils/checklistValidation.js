/**
 * Funções de validação para formulários de checklist
 */

export function validateChecklistUsinaForm(formData, saveStatus) {
  if (saveStatus === 'finalizado') {
    const requiredFields = {
      obra_id: "Obra",
      project_id: "Projeto",
      usina: "Usina", // ChecklistUsina specific
      pedreira: "Pedreira",
      faixa_especificada: "Faixa especificada",
      ligante: "Ligante asfáltico",
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        return { valid: false, message: `Por favor, preencha ${label}.` };
      }
    }
  } else {
    // Salvar progresso - apenas obra é obrigatória
    if (!formData.obra_id) {
      return { valid: false, message: "Por favor, selecione uma obra." };
    }
  }

  return { valid: true };
}