/**
 * Funções puras para RelatorioChecklistConcretagem.
 * Utilitários para validação e transformação de dados.
 */

/**
 * Valida se o checklist está disponível.
 * @param {Object} checklist - Dados do checklist
 * @returns {boolean}
 */
export const isChecklistValid = (checklist) => {
  return !!checklist;
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