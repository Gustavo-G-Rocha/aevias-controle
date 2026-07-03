/**
 * tests/utils/serviceErrorHandler.test.js
 *
 * Valida o comportamento de withServiceCall: sucesso passa direto; falha é
 * registrada via logger e re-lançada como erro amigável com a causa original
 * preservada em `error.cause`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/utils/logger', () => ({
  logger: { log: vi.fn(), error: vi.fn() },
}));

import { logger } from '@/utils/logger';
import { withServiceCall } from '@/utils/serviceErrorHandler';

describe('serviceErrorHandler — withServiceCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna o valor da operação em sucesso', async () => {
    const op = vi.fn().mockResolvedValue('ok');
    await expect(withServiceCall(op, 'Falha')).resolves.toBe('ok');
    expect(op).toHaveBeenCalledTimes(1);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('re-lança erro amigável e registra a causa técnica', async () => {
    const original = new Error('network 500');
    const op = vi.fn().mockRejectedValue(original);
    await expect(withServiceCall(op, 'Falha ao carregar obras')).rejects.toThrow('Falha ao carregar obras');
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith('[Service] Falha ao carregar obras', original);
  });

  it('preserva a causa original em error.cause', async () => {
    const original = new Error('boom');
    const op = vi.fn().mockRejectedValue(original);
    try {
      await withServiceCall(op, 'msg amigável');
      throw new Error('deveria ter lançado');
    } catch (err) {
      expect(err.message).toBe('msg amigável');
      expect(err.cause).toBe(original);
    }
  });
});