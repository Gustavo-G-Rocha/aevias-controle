/**
 * errorCategorizer.js
 *
 * Classifica erros em categorias operacionais para observabilidade.
 * É a inteligência central que permite diagnosticar falhas de salvamento
 * sem investigação manual: rede vs schema vs permissão vs desconhecido.
 *
 * Categorias:
 *  - network:    falha de conexão, timeout, offline, fetch error
 *  - schema:     validação de campos, entidade inválida, payload incorreto
 *  - permission: 401/403, sem acesso, RLS bloqueou
 *  - unknown:    tudo o mais (500 inesperado, crash, etc.)
 *
 * Pure function — sem side-effects, determinística, testável em CI.
 */

export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  SCHEMA: 'schema',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown',
};

const NETWORK_PATTERNS = [
  /network|timeout|fetch|connection|offline|econnaborted|err_network/i,
  /failed to fetch/i,
  /request failed with status code 0/i,
  /network request failed/i,
];

const SCHEMA_PATTERNS = [
  /valid|schema|required|campo|obrigat|preencha|inv.lid/i,
  /validation/i,
  /entidade n.o suportada/i,
  /opera..o inv.lida/i,
  /status inv.lido/i,
];

const PERMISSION_PATTERNS = [
  /permiss|unauthorized|forbidden|negado|acesso|sem permiss/i,
  /registro n.o encontrado/i,
];

function matchesAny(str, patterns) {
  if (!str) return false;
  return patterns.some((p) => p.test(str));
}

/**
 * @param {Error|object} error - erro a categorizar
 * @param {object} [callerContext={}] - contexto adicional (entity, operation, etc.)
 * @returns {{ category: string, context: object }}
 */
export function categorizeError(error, callerContext = {}) {
  if (!error) {
    return { category: ERROR_CATEGORIES.UNKNOWN, context: callerContext };
  }

  const message = error.message || String(error);
  const status = error.response?.status || error.status;
  const responseData = error.response?.data;
  const isOffline =
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && navigator.onLine === false;

  // 1) Backend pode enviar errorCategory explícito (defense-in-depth: mesmo
  //    sem essa flag, as regras abaixo classificam corretamente por status/message).
  if (responseData?.errorCategory) {
    return { category: responseData.errorCategory, context: { ...callerContext, status } };
  }

  // 2) Rede: offline, status 0, TypeError (fetch failures), ou padrões de mensagem
  if (isOffline || status === 0 || error.name === 'TypeError' || matchesAny(message, NETWORK_PATTERNS)) {
    return { category: ERROR_CATEGORIES.NETWORK, context: { ...callerContext, status, isOffline } };
  }

  // 3) Permissão: 401, 403, ou padrões de mensagem
  if (status === 401 || status === 403 || status === 404 || matchesAny(message, PERMISSION_PATTERNS)) {
    return { category: ERROR_CATEGORIES.PERMISSION, context: { ...callerContext, status } };
  }

  // 4) Schema: 422, flag validationError do backend, ou padrões de mensagem
  if (status === 422 || responseData?.validationError === true || matchesAny(message, SCHEMA_PATTERNS)) {
    return { category: ERROR_CATEGORIES.SCHEMA, context: { ...callerContext, status } };
  }

  // 5) Desconhecido
  return { category: ERROR_CATEGORIES.UNKNOWN, context: { ...callerContext, status, message } };
}

export default categorizeError;