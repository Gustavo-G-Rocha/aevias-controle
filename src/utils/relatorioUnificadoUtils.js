/**
 * Funções puras para RelatorioUnificado.
 * Utilitários para mapeamento, validação e transformação de dados.
 */
import { base44 } from '@/api/base44Client';
import { getEnsaioTypeInfo } from '@/components/ensaios/ensaioMappers';

/**
 * Retorna a instância da entidade base44 para um tipo de registro.
 * @param {string} key - Tipo de registro (ex: 'DiarioObra', 'ChecklistUsina')
 * @returns {Object|null} Instância da entidade ou null
 */
export const getEntityInstance = (key) => {
  const map = {
    DiarioObra: base44.entities.DiarioObra,
    EnsaioCAUQ: base44.entities.EnsaioCAUQ,
    EnsaioMRAF: base44.entities.EnsaioMRAF,
    EnsaioDensidade: base44.entities.EnsaioDensidade,
    EnsaioDensidadeInSitu: base44.entities.EnsaioDensidadeInSitu,
    EnsaioTaxaPinturaImprimacao: base44.entities.EnsaioTaxaPinturaImprimacao,
    ChecklistUsina: base44.entities.ChecklistUsina,
    ChecklistAplicacao: base44.entities.ChecklistAplicacao,
    ChecklistMRAF: base44.entities.ChecklistMRAF,
    ChecklistConcretagem: base44.entities.ChecklistConcretagem,
    ChecklistTerraplanagem: base44.entities.ChecklistTerraplanagem,
    ChecklistReciclagem: base44.entities.ChecklistReciclagem,
    EnsaioSondagem: base44.entities.EnsaioSondagem,
    EnsaioGranulometriaIndividual: base44.entities.EnsaioGranulometriaIndividual,
    AcompanhamentoUsinagem: base44.entities.AcompanhamentoUsinagem,
    AcompanhamentoCarga: base44.entities.AcompanhamentoCarga,
    EnsaioManchaPendulo: base44.entities.EnsaioManchaPendulo,
    EnsaioVigaBenkelman: base44.entities.EnsaioVigaBenkelman,
    EnsaioTaxaMRAF: base44.entities.EnsaioTaxaMRAF,
    BoletimSondagem: base44.entities.BoletimSondagem,
    BoletimSondagemTrado: base44.entities.BoletimSondagemTrado,
    EnsaioProctor: base44.entities.EnsaioProctor,
    EnsaioRompimentoConcreto: base44.entities.EnsaioRompimentoConcreto,
    GranuMistura: base44.entities.GranuMistura,
  };
  return map[key];
};

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
 * @returns {Object} Objeto com descrição dos filtros ativos
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