/**
 * tests/utils/observability.test.js
 *
 * Validação obrigatória (critério de aceite): força cada uma das 3
 * categorias de falha (rede, schema, permissão) e verifica que cada
 * uma gera um evento de observabilidade categorizado corretamente.
 *
 * Cobre também: deduplicação, resiliência do sink, PII safety.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/utils/logger', () => ({
  logger: { log: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import { logger } from '@/utils/logger';
import {
  captureError,
  setObservabilitySink,
  resetDedupCache,
  ERROR_CATEGORIES,
} from '@/utils/observability';

describe('Observability — categorização de falhas de salvamento', () => {
  let sinkSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    resetDedupCache();
    sinkSpy = vi.fn();
    setObservabilitySink(sinkSpy);
  });

  afterEach(() => {
    setObservabilitySink(null);
  });

  // ── Categoria 1: REDE ──────────────────────────────────────────────
  it('categoriza erro de rede (TypeError: Failed to fetch)', () => {
    const error = new TypeError('Failed to fetch');
    const event = captureError(error, {
      entity: 'EnsaioCAUQ',
      operation: 'create',
    });

    expect(event.category).toBe(ERROR_CATEGORIES.NETWORK);
    expect(event.sampled).toBe(true);
    expect(sinkSpy).toHaveBeenCalledTimes(1);
    expect(sinkSpy.mock.calls[0][0].category).toBe('network');
    expect(sinkSpy.mock.calls[0][0].context.entity).toBe('EnsaioCAUQ');
  });

  it('categoriza erro de rede (timeout)', () => {
    const error = new Error('timeout of 30000ms exceeded');
    const event = captureError(error, { operation: 'update' });
    expect(event.category).toBe(ERROR_CATEGORIES.NETWORK);
  });

  it('categoriza erro de rede (status 0)', () => {
    const error = new Error('Network Error');
    error.response = { status: 0 };
    const event = captureError(error, {});
    expect(event.category).toBe(ERROR_CATEGORIES.NETWORK);
  });

  it('categoriza estado offline como erro de rede', () => {
    // navigator pode não existir em ambiente node (vitest env: node)
    const hadNavigator = typeof navigator !== 'undefined';
    const originalOnLine = hadNavigator ? navigator.onLine : undefined;

    if (!hadNavigator) {
      globalThis.navigator = {};
    }
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true,
    });

    const error = new Error('qualquer erro');
    const event = captureError(error, {});
    expect(event.category).toBe(ERROR_CATEGORIES.NETWORK);
    expect(event.context.isOffline).toBe(true);

    // Restaura estado original para não vazar para outros testes
    if (!hadNavigator) {
      delete globalThis.navigator;
    } else {
      Object.defineProperty(navigator, 'onLine', {
        value: originalOnLine,
        configurable: true,
      });
    }
  });

  // ── Categoria 2: SCHEMA ────────────────────────────────────────────
  it('categoriza erro de schema (400 com validationError)', () => {
    const error = new Error('Por favor, preencha a data do ensaio.');
    error.response = { status: 400, data: { validationError: true } };
    const event = captureError(error, {
      entity: 'ChecklistUsina',
      operation: 'update',
    });

    expect(event.category).toBe(ERROR_CATEGORIES.SCHEMA);
    expect(sinkSpy).toHaveBeenCalledTimes(1);
    expect(sinkSpy.mock.calls[0][0].category).toBe('schema');
  });

  it('categoriza erro de schema (422)', () => {
    const error = new Error('Unprocessable Entity');
    error.response = { status: 422 };
    const event = captureError(error, {});
    expect(event.category).toBe(ERROR_CATEGORIES.SCHEMA);
  });

  it('categoriza erro de schema por padrão de mensagem', () => {
    const error = new Error('Campo obrigatório: obra_id');
    const event = captureError(error, {});
    expect(event.category).toBe(ERROR_CATEGORIES.SCHEMA);
  });

  // ── Categoria 3: PERMISSÃO ────────────────────────────────────────
  it('categoriza erro de permissão (403)', () => {
    const error = new Error('Sem permissão para aprovar registros');
    error.response = { status: 403 };
    const event = captureError(error, {
      entity: 'EnsaioProctor',
      operation: 'approve',
    });

    expect(event.category).toBe(ERROR_CATEGORIES.PERMISSION);
    expect(sinkSpy).toHaveBeenCalledTimes(1);
    expect(sinkSpy.mock.calls[0][0].category).toBe('permission');
  });

  it('categoriza erro de permissão (401)', () => {
    const error = new Error('Unauthorized');
    error.response = { status: 401 };
    const event = captureError(error, {});
    expect(event.category).toBe(ERROR_CATEGORIES.PERMISSION);
  });

  // ── Categoria 4: UNKNOWN ──────────────────────────────────────────
  it('categoriza erro desconhecido (500)', () => {
    const error = new Error('Internal server error');
    error.response = { status: 500 };
    const event = captureError(error, {});
    expect(event.category).toBe(ERROR_CATEGORIES.UNKNOWN);
  });

  // ── Backend errorCategory explícito ───────────────────────────────
  it('respeita errorCategory explícito do backend', () => {
    const error = new Error('Erro do backend');
    error.response = {
      status: 500,
      data: { errorCategory: 'network' },
    };
    const event = captureError(error, {});
    expect(event.category).toBe(ERROR_CATEGORIES.NETWORK);
  });

  // ── Deduplicação ──────────────────────────────────────────────────
  it('deduplica erros idênticos dentro da janela de amostragem', () => {
    const error = new Error('Failed to fetch');
    const ctx = { entity: 'EnsaioCAUQ', operation: 'create' };

    captureError(error, ctx);
    captureError(error, ctx);
    captureError(error, ctx);

    expect(sinkSpy).toHaveBeenCalledTimes(1);
  });

  it('não deduplica erros diferentes', () => {
    captureError(new Error('Failed to fetch'), { entity: 'A' });
    captureError(new Error('Timeout exceeded'), { entity: 'B' });
    expect(sinkSpy).toHaveBeenCalledTimes(2);
  });

  // ── Resiliência ───────────────────────────────────────────────────
  it('falha do sink externo não quebra a aplicação', () => {
    setObservabilitySink(() => {
      throw new Error('sink crashed');
    });
    expect(() => captureError(new Error('test'), {})).not.toThrow();
  });

  it('funciona sem sink configurado (no-op seguro em prod)', () => {
    setObservabilitySink(null);
    const event = captureError(new Error('test'), {});
    expect(event.category).toBeDefined();
    expect(event.sampled).toBe(true);
  });

  // ── PII Safety ────────────────────────────────────────────────────
  it('evento enviado ao sink não contém dados sensíveis', () => {
    const error = new Error('Validation failed');
    error.response = {
      status: 400,
      data: {
        validationError: true,
        cpf: '123.456.789-00',
        senha: 'secreta',
        email: 'joao@example.com',
      },
    };

    captureError(error, { entity: 'EnsaioCAUQ', operation: 'create' });

    const sentEvent = sinkSpy.mock.calls[0][0];
    expect(JSON.stringify(sentEvent)).not.toContain('123.456.789-00');
    expect(JSON.stringify(sentEvent)).not.toContain('secreta');
    expect(JSON.stringify(sentEvent)).not.toContain('joao@example.com');
    // O evento contém apenas category, fingerprint, message, context, timestamp, sampled
    expect(sentEvent).toHaveProperty('category');
    expect(sentEvent).toHaveProperty('fingerprint');
    expect(sentEvent).toHaveProperty('timestamp');
    expect(sentEvent).toHaveProperty('sampled');
  });

  // ── Estrutura do evento ──────────────────────────────────────────
  it('gera evento com estrutura completa', () => {
    const error = new Error('Sem permissão');
    error.response = { status: 403 };
    const event = captureError(error, {
      entity: 'DiarioObra',
      operation: 'approve',
    });

    expect(event).toEqual(
      expect.objectContaining({
        category: 'permission',
        fingerprint: expect.any(String),
        message: 'Sem permissão',
        context: expect.objectContaining({
          entity: 'DiarioObra',
          operation: 'approve',
          status: 403,
        }),
        timestamp: expect.any(String),
        sampled: true,
      })
    );
  });
});