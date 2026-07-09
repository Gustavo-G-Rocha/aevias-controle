/**
 * Schemas zod para validação client-side de formulários de ensaios e checklists.
 *
 * Este módulo é a fonte central da verdade para validação de formulários.
 * Cada entidade deve ter seu schema zod definido aqui, consumido pelo hook
 * correspondente e — em princípio — reaproveitável no backend.
 *
 * Migração incremental: novos schemas por entidade são adicionados aqui
 * conforme os formulários são migrados da validação manual para zod.
 */
import { z } from 'zod';

// ── Helpers ───────────────────────────────────────────────────────────
/**
 * Cria um schema de string obrigatória com mensagem customizada
 * tanto para `undefined` (required_error) quanto para `""` (min 1).
 */
const requiredString = (message) =>
  z.string({ required_error: message }).min(1, message);

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

// ══════════════════════════════════════════════════════════════════════
// SCHEMAS ESPECÍFICOS POR ENTIDADE
// Migração incremental: cada schema substitui a validação manual do hook.
// ══════════════════════════════════════════════════════════════════════

// ── ChecklistTerraplanagem ───────────────────────────────────────────
// Regras (paridade com validateForm do checklistTerrapalagemMapper):
// - rascunho: apenas obra_id é obrigatório
// - finalizado: obra_id + rodovia, empreiteira, estaca, camada, material,
//   jornada.horario_inicio, jornada.horario_fim
// - acoes_corretivas_realizado=true exige acoes_corretivas_descricao não vazia
// - periodos_clima.temperatura_ambiente é opcional (null ou string vazia OK)
// - origem_material e nome_material são opcionais
export const checklistTerraplanagemSchema = z.object({
  obra_id: requiredString('Por favor, selecione uma obra.'),
  rodovia: z.string().optional(),
  empreiteira: z.string().optional(),
  estaca: z.string().optional(),
  camada: z.string().optional(),
  material: z.string().optional(),
  jornada: z.object({
    horario_inicio: z.string().optional(),
    horario_fim: z.string().optional(),
  }).optional(),
  acoes_corretivas_realizado: z.boolean().nullable().optional(),
  acoes_corretivas_descricao: z.string().optional(),
  status: z.enum(['rascunho', 'finalizado']),
}).superRefine((data, ctx) => {
  if (data.status !== 'finalizado') return;

  const requiredFields = [
    { field: 'rodovia', message: 'Por favor, selecione a Rodovia.' },
    { field: 'empreiteira', message: 'Por favor, selecione a Empreiteira.' },
    { field: 'estaca', message: 'Por favor, preencha o campo Estaca.' },
    { field: 'camada', message: 'Por favor, preencha o campo Camada.' },
    { field: 'material', message: 'Por favor, preencha o campo Material.' },
  ];

  for (const { field, message } of requiredFields) {
    if (!data[field]?.trim()) {
      ctx.addIssue({ code: 'custom', message, path: [field] });
    }
  }

  if (!data.jornada?.horario_inicio?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Por favor, preencha o Horário de Início.', path: ['jornada', 'horario_inicio'] });
  }
  if (!data.jornada?.horario_fim?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Por favor, preencha o Horário Fim.', path: ['jornada', 'horario_fim'] });
  }

  if (data.acoes_corretivas_realizado === true && !data.acoes_corretivas_descricao?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Por favor, descreva as ações corretivas realizadas.', path: ['acoes_corretivas_descricao'] });
  }
});

/**
 * Valida formData de ChecklistTerraplanagem contra o schema zod.
 * Substitui a validação manual do checklistTerrapalagemMapper.
 *
 * @param {object} formData
 * @param {'rascunho'|'finalizado'} saveStatus
 * @returns {string|null} — null se válido; primeira mensagem de erro caso inválido.
 */
export function validateChecklistTerraplanagemForm(formData, saveStatus = 'rascunho') {
  const result = checklistTerraplanagemSchema.safeParse({
    ...formData,
    status: saveStatus,
  });
  if (!result.success) {
    return result.error.errors[0]?.message ?? 'Dados inválidos.';
  }
  return null;
}

// ── ChecklistUsina ────────────────────────────────────────────────────
// Regras (paridade com validateChecklistUsinaForm do checklistValidation.js):
// - rascunho: apenas obra_id é obrigatório
// - finalizado: obra_id + project_id, usina, pedreira, faixa_especificada, ligante
export const checklistUsinaSchema = z.object({
  obra_id: requiredString('Por favor, selecione uma obra.'),
  // Campos nullable() para aceitar null de formulários/selects desmarcados;
  // a obrigatoriedade é validada no superRefine (status=finalizado).
  project_id: z.string().nullable().optional(),
  usina: z.string().nullable().optional(),
  pedreira: z.string().nullable().optional(),
  faixa_especificada: z.string().nullable().optional(),
  ligante: z.string().nullable().optional(),
  status: z.enum(['rascunho', 'finalizado']),
}).superRefine((data, ctx) => {
  if (data.status !== 'finalizado') return;

  const requiredFields = [
    { field: 'project_id', message: 'Por favor, preencha Projeto.' },
    { field: 'usina', message: 'Por favor, preencha Usina.' },
    { field: 'pedreira', message: 'Por favor, preencha Pedreira.' },
    { field: 'faixa_especificada', message: 'Por favor, preencha Faixa especificada.' },
    { field: 'ligante', message: 'Por favor, preencha Ligante asfáltico.' },
  ];

  for (const { field, message } of requiredFields) {
    if (!data[field]) {
      ctx.addIssue({ code: 'custom', message, path: [field] });
    }
  }
});

/**
 * Valida formData de ChecklistUsina contra o schema zod.
 * Substitui a validação manual de checklistValidation.js.
 *
 * Mantém o contrato { valid, message } para paridade com o consumidor.
 *
 * @param {object} formData
 * @param {'rascunho'|'finalizado'} saveStatus
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateChecklistUsinaForm(formData, saveStatus = 'rascunho') {
  const result = checklistUsinaSchema.safeParse({
    ...formData,
    status: saveStatus,
  });
  if (!result.success) {
    return { valid: false, message: result.error.errors[0]?.message ?? 'Dados inválidos.' };
  }
  return { valid: true };
}