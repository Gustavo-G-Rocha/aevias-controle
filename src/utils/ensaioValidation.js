/**
 * Validações centralizadas para formulários de ensaios individuais.
 * Extraídas das páginas de ensaio para facilitar teste e reutilização.
 */

/**
 * Valida os campos obrigatórios de EnsaioGranulometriaIndividual.
 * @param {object} formData
 * @param {'rascunho'|'finalizado'} saveStatus
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateGranulometriaIndividual(formData, saveStatus) {
  if (!formData.obra_id) {
    return { valid: false, message: 'Por favor, selecione uma obra.' };
  }

  if (saveStatus === 'finalizado') {
    if (!formData.tipo_material) {
      return { valid: false, message: 'Por favor, selecione o tipo de material.' };
    }
    if (!formData.data_ensaio) {
      return { valid: false, message: 'Por favor, informe a data do ensaio.' };
    }
  }

  return { valid: true };
}

/**
 * Valida os campos obrigatórios do EnsaioCAUQ ao finalizar.
 * @param {object} formData
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateEnsaioCAUQ(formData) {
  if (!formData.obra_id) {
    return { valid: false, message: 'Por favor, selecione uma obra.' };
  }
  if (!formData.data_ensaio) {
    return { valid: false, message: 'Por favor, informe a data do ensaio.' };
  }
  return { valid: true };
}

/**
 * Valida os campos obrigatórios mínimos para salvar progresso (rascunho) de qualquer ensaio.
 * @param {object} formData
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateEnsaioRascunho(formData) {
  if (!formData.obra_id) {
    return { valid: false, message: 'Por favor, selecione uma obra para salvar o progresso.' };
  }
  return { valid: true };
}