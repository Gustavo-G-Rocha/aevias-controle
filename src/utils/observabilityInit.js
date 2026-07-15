/**
 * observabilityInit.js
 *
 * Inicializa a pipeline de observabilidade na inicialização da aplicação:
 *   1. Configura o sink externo (estruturado, PII-safe)
 *   2. Registra handlers globais (window.onerror, unhandledrejection)
 *
 * Sem isto, captureError() executa em produção mas events vão para /dev/null
 * porque externalSink é null. A infraestrutura existe mas está dormente.
 *
 * Sink atual: console estruturado (JSON em uma linha).
 *   - Funciona em TODOS os ambientes (dev e prod)
 *   - logger.js é no-op em prod, então este sink é a única saída em prod
 *   - Event já é PII-redacted pelo serviceErrorHandler antes de chegar aqui
 *   - O erro bruto NÃO é logado — apenas o event estruturado
 *
 * Para integrar Sentry (futuro):
 *   import * as Sentry from '@sentry/react';
 *   setObservabilitySink((event, error) => {
 *     Sentry.captureException(error, {
 *       tags: { errorCategory: event.category },
 *       extra: { ...event.context },
 *     });
 *   });
 */

import { setObservabilitySink, captureError } from '@/utils/observability';

/**
 * Persiste o evento remotamente (entidade ErrorLog) — best-effort.
 * Import dinâmico do client para não criar dependência circular na inicialização.
 * Nunca lança: falha de rede/auth é silenciosa.
 */
function persistRemoteLog(event, error) {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    import('@/api/base44Client')
      .then(({ base44 }) =>
        base44.entities.ErrorLog.create({
          category: event.category,
          message: String(event.message || 'unknown').slice(0, 500),
          stack: String(error?.stack || '').slice(0, 3000),
          component_stack: String(event.context?.componentStack || '').slice(0, 3000),
          source: event.context?.source || '',
          page: typeof window !== 'undefined' ? window.location.pathname : '',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          context: event.context || {},
        })
      )
      .catch(() => {});
  } catch {
    // logging nunca quebra a aplicação
  }
}

function structuredConsoleSink(event, error) {
  // Event é PII-safe: category, fingerprint, message (string técnica),
  // context (entity/operation/status), timestamp.
  // O erro bruto NÃO é logado para evitar vazamento de PII em erros
  // globais (window.onerror, unhandledrejection) que não passam
  // pelo redaction do serviceErrorHandler.
  if (typeof console !== 'undefined' && console.error) {
    console.error('[Observability]', JSON.stringify(event));
  }
  persistRemoteLog(event, error);
}

function handleGlobalError(event) {
  // event.error pode ser null em alguns casos (cross-origin scripts)
  const error = event.error || new Error(event.message || 'Unknown global error');
  captureError(error, {
    source: 'window.onerror',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
}

function handleUnhandledRejection(event) {
  const reason = event.reason;
  const error = reason instanceof Error
    ? reason
    : new Error(typeof reason === 'string' ? reason : 'Unhandled promise rejection');
  captureError(error, {
    source: 'unhandledrejection',
  });
}

let initialized = false;

/**
 * Inicializa a pipeline de observabilidade. Idempotente.
 * Deve ser chamada uma vez na inicialização da aplicação (main.jsx).
 */
export function initObservability() {
  if (initialized) return;
  initialized = true;

  setObservabilitySink(structuredConsoleSink);

  if (typeof window !== 'undefined') {
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  }
}

/**
 * Reseta a inicialização. Uso em testes para isolamento entre casos.
 * Não deve ser chamado em produção.
 */
export function _resetObservability() {
  initialized = false;
  setObservabilitySink(null);
  if (typeof window !== 'undefined') {
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }
}