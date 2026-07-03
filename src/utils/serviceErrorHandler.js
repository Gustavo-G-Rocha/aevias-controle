// serviceErrorHandler.js
// Tratamento de erro padronizado para a camada de services.
//
// Encapsula chamadas base44 em try/catch: registra o erro técnico via logger e
// re-lança uma exceção com mensagem amigável (PT-BR), preservando a causa
// original em `error.cause`. Assim a UI recebe um erro tratado em vez de
// deixar a exceção técnica da API borbulhar sem tratamento.
//
// Erros de validação já amigáveis (lançados antes da chamada à API) não passam
// por aqui e borbulham naturalmente com sua mensagem original.

import { logger } from '@/utils/logger';

/**
 * @param {() => Promise<*>} operation - chamada base44 a executar
 * @param {string} friendlyMessage - mensagem amigável exibida ao usuário
 * @returns {Promise<*>} resultado da operação
 */
export async function withServiceCall(operation, friendlyMessage) {
  try {
    return await operation();
  } catch (error) {
    logger.error(`[Service] ${friendlyMessage}`, error);
    const friendlyError = new Error(friendlyMessage);
    friendlyError.cause = error;
    throw friendlyError;
  }
}

export default withServiceCall;