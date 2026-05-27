/**
 * Funções puras para RelatorioUnificado.
 * Utilitários para validação e transformação de dados.
 * Não importa base44Client para ser testável sem browser.
 */
import { getEnsaioTypeInfo } from '@/components/ensaios/ensaioMappers';

// Re-exporta getEntityInstance do módulo de dependências
export { getEntityInstance } from '@/utils/relatorioUnificadoEntityMap';

/**
 * Formata uma data para o padrão pt-BR.
 * @param {string|Date} date - Data a formatar
 * @returns {string} Data formatada ou '-'
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

/**
 * Retorna o nome do tipo de registro.
 * @param {string} tipo - Tipo de registro
 * @returns {string} Nome do tipo ou valor original
 */
export const getRecordTypeName = (tipo) => {
  return getEnsaioTypeInfo({ entityType: tipo })?.name || tipo;
};

/**
 * Valida se os filtros obrigatórios estão presentes.
 * @param {Object} filters - Objeto de filtros
 * @returns {boolean}
 */
export const isFiltersValid = (filters) => {
  return !!(filters.obra_id && filters.data_inicio && filters.data_fim && filters.tipo);
};

/**
 * Obtém descrição resumida dos filtros aplicados.
 * @param {Object} filters - Objeto de filtros
 * @returns {Array<string>} Lista de descrições dos filtros ativos
 */
export const getActiveFiltersDescription = (filters) => {
  const active = [];
  if (filters.laboratoristas?.length > 0) {
    active.push(`Laboratoristas: ${filters.laboratoristas.join(', ')}`);
  }
  if (filters.rodovia) {
    active.push(`Rodovia: ${filters.rodovia}`);
  }
  if (filters.empreiteira) {
    active.push(`Empreiteira: ${filters.empreiteira}`);
  }
  if (filters.usina) {
    active.push(`Usina: ${filters.usina}`);
  }
  return active;
};