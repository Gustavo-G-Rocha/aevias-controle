/**
 * Schemas zod para validação client-side de formulários de ensaios e checklists.
 *
 * Cobre os campos base comuns a todos os registros (obra_id, data, status).
 * Validações específicas por tipo de entidade continuam nos arquivos
 * ensaioValidation.js e checklistValidation.js — este módulo oferece uma
 * camada base reutilizável e tipada com zod.
 */
import { z } from 'zod';

const statusEnum = z.enum(['rascunho', 'finalizado']);

/**
 * Schema base para ensaios (usa data_ensaio).
 */
export const ensaioBaseSchema = z.object({
  obra_id: z.string().min(1, 'Por favor, selecione uma obra.'),
  data_ensaio: z.string().optional(),
  status: statusEnum,
});

/**
 * Schema base para checklists (usa data).
 */
export const checklistBaseSchema = z.object({
  obra_id: z.string().min(1, 'Por favor, selecione uma obra.'),
  data: z.string().optional(),
  status: statusEnum,
});

/**
 * Valida formData de ensaio contra o schema base.
 * @param {object} formData
 * @param {'rascunho'|'finalizado'} saveStatus
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateEnsaioForm(formData, saveStatus = 'rascunho') {
  const result = ensaioBaseSchema.safeParse({
    ...formData,
    status: saveStatus,
  });

  if (!result.success) {
    const firstError = result.error.errors[0];
    return { valid: false, message: firstError?.message ?? 'Dados inválidos.' };
  }

  if (saveStatus === 'finalizado' && !formData.data_ensaio) {
    return { valid: false, message: 'Por favor, informe a data do ensaio.' };
  }

  return { valid: true };
}

/**
 * Valida formData de checklist contra o schema base.
 * @param {object} formData
 * @param {'rascunho'|'finalizado'} saveStatus
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateChecklistForm(formData, saveStatus = 'rascunho') {
  const result = checklistBaseSchema.safeParse({
    ...formData,
    status: saveStatus,
  });

  if (!result.success) {
    const firstError = result.error.errors[0];
    return { valid: false, message: firstError?.message ?? 'Dados inválidos.' };
  }

  if (saveStatus === 'finalizado' && !formData.data) {
    return { valid: false, message: 'Por favor, informe a data.' };
  }

  return { valid: true };
}