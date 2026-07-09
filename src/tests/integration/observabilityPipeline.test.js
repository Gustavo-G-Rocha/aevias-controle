/**
 * tests/integration/observabilityPipeline.test.js
 *
 * Validação obrigatória (critério de aceite): força cada uma das 3
 * categorias de falha (rede, schema, permissão) ATRAVÉS da pipeline
 * completa — withServiceCall → captureError → sink externo — e verifica
 * que cada uma gera um evento categorizado corretamente.
 *
 * Diferente de observability.test.js (que testa captureError isoladamente),
 * este teste exercita o caminho real: um service call falha, o
 * serviceErrorHandler redacta o erro, captureError categoriza, e o sink
 * recebe o event estruturado.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/utils/logger', () => ({
  logger: { log: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import {
  captureError,
  setObservabilitySink,
  resetDedupCache,
  ERROR_CATEGORIES,
} from '@/utils/observability';
import { withServiceCall } from '@/utils/serviceErrorHandler';

describe('Pipeline de Observabilidade — withServiceCall → captureError → sink', () => {
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
  it('força falha de REDE e verifica evento categorizado no sink', async () => {
    const networkError = new TypeError('Failed to fetch');
    const op = vi.fn().mockRejectedValue(networkError);

    await expect(
      withServiceCall(op, 'Salvar ensaio')
    ).rejects.toThrow('Salvar ensaio');

    expect(sinkSpy).toHaveBeenCalledTimes(1);
    const [event] = sinkSpy.mock.calls[0];
    expect(event.category).toBe(ERROR_CATEGORIES.NETWORK);
    expect(event.sampled).toBe(true);
    expect(event.context.operation).toBe('Salvar ensaio');
    expect(event.timestamp).toBeDefined();
    expect(event.fingerprint).toContain('Salvar ensaio');
  });

  // ── Categoria 2: SCHEMA ────────────────────────────────────────────
  it('força falha de SCHEMA e verifica evento categorizado no sink', async () => {
    const schemaError = new Error('Por favor, preencha a data do ensaio.');
    schemaError.response = { status: 400, data: { validationError: true } };
    const op = vi.fn().mockRejectedValue(schemaError);

    await expect(
      withServiceCall(op, 'Finalizar checklist')
    ).rejects.toThrow('Finalizar checklist');

    expect(sinkSpy).toHaveBeenCalledTimes(1);
    const [event] = sinkSpy.mock.calls[0];
    expect(event.category).toBe(ERROR_CATEGORIES.SCHEMA);
    expect(event.context.status).toBe(400);
  });

  // ── Categoria 3: PERMISSÃO ─────────────────────────────────────────
  it('força falha de PERMISSÃO e verifica evento categorizado no sink', async () => {
    const permissionError = new Error('Sem permissão para aprovar registros');
    permissionError.response = { status: 403 };
    const op = vi.fn().mockRejectedValue(permissionError);

    await expect(
      withServiceCall(op, 'Aprovar ensaio')
    ).rejects.toThrow('Aprovar ensaio');

    expect(sinkSpy).toHaveBeenCalledTimes(1);
    const [event] = sinkSpy.mock.calls[0];
    expect(event.category).toBe(ERROR_CATEGORIES.PERMISSION);
    expect(event.context.status).toBe(403);
  });

  // ── PII não vaza pelo pipeline ─────────────────────────────────────
  it('PII no response.data não aparece no event enviado ao sink', async () => {
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
    const op = vi.fn().mockRejectedValue(error);

    await expect(withServiceCall(op, 'Salvar')).rejects.toThrow();

    const [event] = sinkSpy.mock.calls[0];
    const serialized = JSON.stringify(event);
    expect(serialized).not.toContain('123.456.789-00');
    expect(serialized).not.toContain('secreta');
    expect(serialized).not.toContain('joao@example.com');
  });

  // ── Backend errorCategory é respeitado pelo pipeline ───────────────
  it('respeita errorCategory explícito do backend através do pipeline', async () => {
    const error = new Error('Erro do backend');
    error.response = {
      status: 500,
      data: { errorCategory: 'network' },
    };
    const op = vi.fn().mockRejectedValue(error);

    await expect(withServiceCall(op, 'Sincronizar')).rejects.toThrow();

    const [event] = sinkSpy.mock.calls[0];
    expect(event.category).toBe(ERROR_CATEGORIES.NETWORK);
  });

  // ── Deduplicação funciona através do pipeline ──────────────────────
  it('deduplica falhas idênticas em chamadas consecutivas', async () => {
    const error = new TypeError('Failed to fetch');
    const op = vi.fn().mockRejectedValue(error);

    // Três chamadas com o mesmo erro e mesma mensagem amigável
    await expect(withServiceCall(op, 'Salvar')).rejects.toThrow();
    await expect(withServiceCall(op, 'Salvar')).rejects.toThrow();
    await expect(withServiceCall(op, 'Salvar')).rejects.toThrow();

    // Sink recebe apenas 1 evento (deduplicação por fingerprint + janela)
    expect(sinkSpy).toHaveBeenCalledTimes(1);
  });
});