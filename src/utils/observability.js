/**
 * observability.js
 *
 * Hub central de observabilidade — pipeline leve, testável, sem dependências
 * externas. Garante que toda falha de salvamento em produção gere um evento
 * estruturado e categorizado, sem expor dados sensíveis.
 *
 * Arquitetura:
 *  1. captureError(error, context) → categoriza via errorCategorizer
 *  2. Deduplicação (fingerprint + janela de 5s) previne flooding
 *  3. Roteia para sink externo configurável (Sentry, Datadog, etc.)
 *  4. Sink failures nunca quebram a aplicação
 *
 * PII Safety:
 *  - O evento enviado ao sink contém apenas: category, fingerprint,
 *    message (string técnica), context (entity/operation/status), timestamp.
 *  - Não inclui o erro bruto nem payload de request/response.
 *  - serviceErrorHandler redactiona antes de chamar captureError.
 *
 * Para integrar Sentry (futuro):
 *   setObservabilitySink((event, error) => {
 *     Sentry.captureException(error, {
 *       tags: { errorCategory: event.category },
 *       extra: { ...event.context },
 *     });
 *   });
 */

import { logger } from '@/utils/logger';
import { categorizeError, ERROR_CATEGORIES } from '@/utils/errorCategorizer';

// ── Sink plugável ──────────────────────────────────────────────────────
// Recebe eventos estruturados. Default: null (no-op em prod).
// Em dev, logger.error já cobre o console.
let externalSink = null;

/**
 * Configura o sink externo (ex: Sentry.captureException).
 * @param {((event: object, error: Error) => void) | null} sink
 */
export function setObservabilitySink(sink) {
  externalSink = typeof sink === 'function' ? sink : null;
}

// ── Deduplicação / Agrupamento ────────────────────────────────────────
// Previne que o mesmo erro (mesma entidade + operação + mensagem) inunde
// o serviço externo dentro de uma janela curta.
const DEDUP_WINDOW_MS = 5000;
const recentEvents = new Map();
const MAX_TRACKED = 200;

function shouldSample(category, fingerprint) {
  const key = `${category}:${fingerprint}`;
  const now = Date.now();
  const lastSeen = recentEvents.get(key);

  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) {
    return false;
  }

  recentEvents.set(key, now);

  // Cleanup periódico para evitar memory leak
  if (recentEvents.size > MAX_TRACKED) {
    for (const [k, t] of recentEvents) {
      if (now - t > DEDUP_WINDOW_MS) recentEvents.delete(k);
    }
  }

  return true;
}

function buildFingerprint(error, context) {
  const msg = (error?.message || 'unknown').slice(0, 100);
  const entity = context?.entity || context?.operation || 'global';
  return `${entity}:${msg}`;
}

/**
 * Captura um erro como evento de observabilidade estruturado.
 *
 * @param {Error|object} error - erro original (ou redacted)
 * @param {object} [context={}] - contexto operacional (entity, operation, userId, etc.)
 * @returns {{ category: string, fingerprint: string, message: string, context: object, timestamp: string, sampled: boolean }}
 */
export function captureError(error, context = {}) {
  const { category, context: enrichedContext } = categorizeError(error, context);
  const fingerprint = buildFingerprint(error, context);
  const sampled = shouldSample(category, fingerprint);

  const event = {
    category,
    fingerprint,
    message: error?.message || String(error),
    context: enrichedContext,
    timestamp: new Date().toISOString(),
    sampled,
  };

  // Sink externo — apenas para eventos amostrados.
  // O log de dev-console fica a cargo do caller (serviceErrorHandler já o faz),
  // evitando duplicação de chamadas ao logger.
  if (sampled && externalSink) {
    try {
      externalSink(event, error);
    } catch {
      // Falhas no sink nunca devem quebrar a aplicação
      logger.error('[Observability] Sink externo falhou ao processar evento');
    }
  }

  return event;
}

/**
 * Reseta o cache de deduplicação. Uso em testes para isolamento entre casos.
 * Não deve ser chamado em produção.
 */
export function resetDedupCache() {
  recentEvents.clear();
}

export { ERROR_CATEGORIES };