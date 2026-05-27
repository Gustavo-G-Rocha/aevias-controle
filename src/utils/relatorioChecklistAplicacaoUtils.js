/**
 * Funções puras para RelatorioChecklistAplicacao.
 * Utilitários para validação e transformação de dados.
 */

/**
 * Valida se o checklist e dados relacionados estão disponíveis.
 * @param {Object} checklist - Dados do checklist
 * @param {Object} obra - Dados da obra
 * @returns {boolean}
 */
export const isChecklistValid = (checklist, obra) => {
  return !!(checklist && obra);
};

/**
 * Valida se os dados de regional estão disponíveis.
 * @param {Object} regional - Dados da regional
 * @returns {boolean}
 */
export const isRegionalValid = (regional) => {
  return !!regional;
};

/**
 * Verifica se o checklist tem criador definido.
 * @param {Object} creatorUser - Dados do usuário criador
 * @returns {boolean}
 */
export const hasCreator = (creatorUser) => {
  return !!creatorUser;
};

/**
 * Retorna a mensagem de erro apropriada baseada no estado.
 * @param {string} error - Mensagem de erro
 * @param {Object} checklist - Dados do checklist
 * @returns {string}
 */
export const getErrorMessage = (error, checklist) => {
  if (error) return error;
  if (!checklist) return 'Checklist não encontrado';
  return 'Erro ao carregar relatório';
};