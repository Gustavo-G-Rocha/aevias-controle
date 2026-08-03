/**
 * Robustez — Edge cases avançados para errorCategorizer
 *
 * Foca em cenários que testes existentes não cobrem:
 * - Padrões de erro axios específicos (ECONNABORTED, ERR_NETWORK)
 * - Combinações de sinais (offline + status, errorCategory + status)
 * - Strings vazias e boundary values
 * - Contexto propagado em todos os caminhos
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { categorizeError, ERROR_CATEGORIES } from '@/utils/errorCategorizer';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('errorCategorizer — padrões axios específicos', () => {
  it('ECONNABORTED → network', () => {
    const err = new Error('ECONNABORTED: request timed out');
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.NETWORK);
  });

  it('ERR_NETWORK → network', () => {
    const err = new Error('ERR_NETWORK: failed to connect');
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.NETWORK);
  });

  it('request failed with status code 0 → network', () => {
    const err = new Error('Request failed with status code 0');
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.NETWORK);
  });

  it('network request failed → network', () => {
    const err = new Error('network request failed');
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.NETWORK);
  });

  it('connection refused → network', () => {
    const err = new Error('connection refused');
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.NETWORK);
  });
});

describe('errorCategorizer — combinações de sinais', () => {
  it('offline + status 403 → network tem prioridade', () => {
    vi.stubGlobal('navigator', { onLine: false });
    const err = new Error('Acesso negado');
    err.status = 403;
    const result = categorizeError(err);
    expect(result.category).toBe(ERROR_CATEGORIES.NETWORK);
    expect(result.context.isOffline).toBe(true);
  });

  it('errorCategory explícito vence heurística de status', () => {
    const err = new Error('some error');
    err.response = { status: 500, data: { errorCategory: 'schema' } };
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.SCHEMA);
  });

  it('errorCategory "network" vence mesmo com status 403', () => {
    const err = new Error('permission denied');
    err.response = { status: 403, data: { errorCategory: 'network' } };
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.NETWORK);
  });

  it('errorCategory "permission" vence mesmo com status 500', () => {
    const err = new Error('server crash');
    err.response = { status: 500, data: { errorCategory: 'permission' } };
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.PERMISSION);
  });

  it('TypeError vence errorCategory ausente (sem response.data)', () => {
    const err = new TypeError('fetch failed');
    err.status = 500;
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.NETWORK);
  });
});

describe('errorCategorizer — boundary values', () => {
  it('string vazia como erro → unknown', () => {
    expect(categorizeError('').category).toBe(ERROR_CATEGORIES.UNKNOWN);
  });

  it('erro com message vazia → unknown', () => {
    const err = new Error('');
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.UNKNOWN);
  });

  it('número como erro → unknown', () => {
    expect(categorizeError(42).category).toBe(ERROR_CATEGORIES.UNKNOWN);
  });

  it('boolean como erro → unknown', () => {
    expect(categorizeError(true).category).toBe(ERROR_CATEGORIES.UNKNOWN);
  });

  it('array como erro → unknown', () => {
    expect(categorizeError([1, 2, 3]).category).toBe(ERROR_CATEGORIES.UNKNOWN);
  });
});

describe('errorCategorizer — contexto propagado', () => {
  it('preserva callerContext em erro network', () => {
    const r = categorizeError(
      new Error('timeout'),
      { entity: 'DiarioObra', operation: 'save', userId: 'u1' }
    );
    expect(r.context.entity).toBe('DiarioObra');
    expect(r.context.operation).toBe('save');
    expect(r.context.userId).toBe('u1');
  });

  it('preserva callerContext em erro permission', () => {
    const err = new Error('x');
    err.status = 403;
    const r = categorizeError(err, { entity: 'EnsaioCAUQ' });
    expect(r.context.entity).toBe('EnsaioCAUQ');
    expect(r.context.status).toBe(403);
  });

  it('preserva callerContext em erro unknown', () => {
    const r = categorizeError(new Error('boom'), { operation: 'delete' });
    expect(r.context.operation).toBe('delete');
  });

  it('callerContext default é objeto vazio', () => {
    const r = categorizeError(new Error('timeout'));
    expect(r.context).toBeDefined();
    expect(typeof r.context).toBe('object');
  });

  it('callerContext null não crasha', () => {
    const r = categorizeError(new Error('timeout'), null);
    expect(r.category).toBe(ERROR_CATEGORIES.NETWORK);
  });
});

describe('errorCategorizer — mensagens em português', () => {
  it('"sem permissão" → permission', () => {
    expect(categorizeError(new Error('Usuário sem permissão')).category)
      .toBe(ERROR_CATEGORIES.PERMISSION);
  });

  it('"acesso negado" → permission', () => {
    expect(categorizeError(new Error('acesso negado ao recurso')).category)
      .toBe(ERROR_CATEGORIES.PERMISSION);
  });

  it('"registro não encontrado" → permission', () => {
    expect(categorizeError(new Error('registro não encontrado')).category)
      .toBe(ERROR_CATEGORIES.PERMISSION);
  });

  it('"campo obrigatório" → schema', () => {
    expect(categorizeError(new Error('campo obrigatório: data')).category)
      .toBe(ERROR_CATEGORIES.SCHEMA);
  });

  it('"preencha o campo" → schema', () => {
    expect(categorizeError(new Error('preencha o campo obra_id')).category)
      .toBe(ERROR_CATEGORIES.SCHEMA);
  });

  it('"operação inválida" → schema', () => {
    expect(categorizeError(new Error('operação inválida')).category)
      .toBe(ERROR_CATEGORIES.SCHEMA);
  });
});