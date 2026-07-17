/**
 * Robustez — Categorização de erros (errorCategorizer.js)
 *
 * A categorização correta (network/schema/permission/unknown) é o que
 * permite ao app decidir entre: enfileirar offline (network), mostrar
 * erro de validação (schema) ou negar acesso (permission). Uma
 * classificação errada pode ex.: enfileirar para retry um erro de
 * permissão — loop infinito de sync.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { categorizeError, ERROR_CATEGORIES } from '../../utils/errorCategorizer.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('categorizeError — network', () => {
  it('mensagem "Failed to fetch" → network', () => {
    expect(categorizeError(new Error('Failed to fetch')).category).toBe(ERROR_CATEGORIES.NETWORK);
  });
  it('timeout → network', () => {
    expect(categorizeError(new Error('Request timeout exceeded')).category).toBe(ERROR_CATEGORIES.NETWORK);
  });
  it('status 0 → network', () => {
    const err = new Error('opaque'); err.status = 0;
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.NETWORK);
  });
  it('TypeError (fetch abort) → network', () => {
    expect(categorizeError(new TypeError('cannot read')).category).toBe(ERROR_CATEGORIES.NETWORK);
  });
  it('navigator.onLine=false → network mesmo com mensagem genérica', () => {
    vi.stubGlobal('navigator', { onLine: false });
    const r = categorizeError(new Error('erro genérico qualquer'));
    expect(r.category).toBe(ERROR_CATEGORIES.NETWORK);
    expect(r.context.isOffline).toBe(true);
  });
});

describe('categorizeError — permission', () => {
  it('status 401 → permission', () => {
    const err = new Error('x'); err.status = 401;
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.PERMISSION);
  });
  it('status 403 → permission', () => {
    const err = new Error('x'); err.response = { status: 403 };
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.PERMISSION);
  });
  it('status 404 → permission (registro não encontrado ≈ RLS)', () => {
    const err = new Error('x'); err.status = 404;
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.PERMISSION);
  });
  it('mensagem "Acesso negado" → permission', () => {
    expect(categorizeError(new Error('Acesso negado ao registro')).category).toBe(ERROR_CATEGORIES.PERMISSION);
  });
  it('mensagem "unauthorized" → permission', () => {
    expect(categorizeError(new Error('User unauthorized')).category).toBe(ERROR_CATEGORIES.PERMISSION);
  });
});

describe('categorizeError — schema', () => {
  it('status 422 → schema', () => {
    const err = new Error('x'); err.status = 422;
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.SCHEMA);
  });
  it('flag validationError do backend → schema', () => {
    const err = new Error('x'); err.response = { data: { validationError: true } };
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.SCHEMA);
  });
  it('mensagem "campo obrigatório" → schema', () => {
    expect(categorizeError(new Error('Campo obrigatório: obra_id')).category).toBe(ERROR_CATEGORIES.SCHEMA);
  });
  it('mensagem "Entidade não suportada" → schema', () => {
    expect(categorizeError(new Error('Entidade não suportada')).category).toBe(ERROR_CATEGORIES.SCHEMA);
  });
});

describe('categorizeError — precedência e errorCategory explícito', () => {
  it('errorCategory do backend tem precedência sobre heurísticas', () => {
    const err = new Error('validation failed'); // padrão schema
    err.response = { status: 422, data: { errorCategory: 'permission' } };
    expect(categorizeError(err).category).toBe('permission');
  });
  it('network vence permission quando ambos padrões presentes', () => {
    // "network" na mensagem + status 403: rede é checada primeiro
    const err = new Error('network error while checking access'); err.status = 403;
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.NETWORK);
  });
  it('permission vence schema quando ambos padrões presentes', () => {
    const err = new Error('Acesso negado: campo inválido');
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.PERMISSION);
  });
});

describe('categorizeError — robustez de input', () => {
  it('null → unknown (não crasha)', () => {
    expect(categorizeError(null).category).toBe(ERROR_CATEGORIES.UNKNOWN);
  });
  it('undefined → unknown', () => {
    expect(categorizeError(undefined).category).toBe(ERROR_CATEGORIES.UNKNOWN);
  });
  it('string como erro → categorizada pela mensagem', () => {
    // String(error) é usado como mensagem
    expect(categorizeError('connection refused').category).toBe(ERROR_CATEGORIES.NETWORK);
  });
  it('objeto sem message → unknown', () => {
    expect(categorizeError({ foo: 'bar' }).category).toBe(ERROR_CATEGORIES.UNKNOWN);
  });
  it('erro 500 genérico → unknown', () => {
    const err = new Error('Internal server error boom'); err.status = 500;
    expect(categorizeError(err).category).toBe(ERROR_CATEGORIES.UNKNOWN);
  });
  it('preserva callerContext no retorno', () => {
    const r = categorizeError(new Error('timeout'), { entity: 'EnsaioCAUQ', operation: 'save' });
    expect(r.context.entity).toBe('EnsaioCAUQ');
    expect(r.context.operation).toBe('save');
  });
});