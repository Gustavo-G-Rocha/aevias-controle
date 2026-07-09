/**
 * Funções de validação para formulários de checklist.
 *
 * MIGRADO PARA SCHEMA-DRIVEN: validateChecklistUsinaForm agora delega
 * para o schema Zod centralizado em formValidationSchemas.js.
 * Este módulo re-exporta para manter compatibilidade com importadores existentes.
 *
 * Nova migração: importar diretamente de formValidationSchemas.js.
 */
export { validateChecklistUsinaForm } from '@/utils/formValidationSchemas';