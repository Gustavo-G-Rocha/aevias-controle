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

// Padrões de campos sensíveis para redação em logs de desenvolvimento.
// Redaction garante que dados como CPF, senha e token não apareçam no
// console mesmo em ambiente de desenvolvimento.
const SENSITIVE_KEY_PATTERNS = [
  /cpf/i, /senha/i, /password/i, /token/i, /secret/i,
  /cnpj/i, /email/i, /phone/i, /telefone/i, /celular/i,
  /crea/i, /rg/i, /cartao/i, /card/i, /cvv/i, /cep/i,
];

const REDACTED = '[REDACTED]';

function isSensitiveKey(key) {
  return typeof key === 'string' && SENSITIVE_KEY_PATTERNS.some((p) => p.test(key));
}

function redactValue(value, depth = 0) {
  if (depth > 4) return REDACTED;
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redactValue(v, depth + 1));
  const redacted = {};
  for (const [k, v] of Object.entries(value)) {
    redacted[k] = isSensitiveKey(k) ? REDACTED : redactValue(v, depth + 1);
  }
  return redacted;
}

function redactError(error) {
  if (!error) return error;
  const result = { message: error.message, name: error.name };
  if (error.stack) result.stack = error.stack;
  if (error.response) {
    result.response = {
      status: error.response.status,
      statusText: error.response.statusText,
      data: redactValue(error.response.data),
    };
  }
  if (error.config) {
    result.config = {
      url: error.config.url,
      method: error.config.method,
      data: redactValue(error.config.data),
    };
  }
  return result;
}

/**
 * @param {() => Promise<*>} operation - chamada base44 a executar
 * @param {string} friendlyMessage - mensagem amigável exibida ao usuário
 * @returns {Promise<*>} resultado da operação
 */
export async function withServiceCall(operation, friendlyMessage) {
  try {
    return await operation();
  } catch (error) {
    logger.error(`[Service] ${friendlyMessage}`, redactError(error));
    const friendlyError = new Error(friendlyMessage);
    friendlyError.cause = error;
    throw friendlyError;
  }
}

export default withServiceCall;