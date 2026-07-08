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
    const [, loggedError] = logger.error.mock.calls[0];
    expect(loggedError).toEqual(
      expect.objectContaining({ message: 'network 500', name: 'Error' })
    );
    expect(loggedError).not.toBe(original);
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

  it('redada campos sensíveis (CPF, senha, token) do response.data', async () => {
    const original = new Error('validation failed');
    original.response = {
      status: 400,
      statusText: 'Bad Request',
      data: {
        usuario: 'João',
        cpf: '123.456.789-00',
        senha: 'minhaSenha123',
        token: 'abc-token-xyz',
        telefone: '(11) 99999-9999',
        endereco: { cep: '01000-000', rua: 'Av. Paulista' },
      },
    };
    const op = vi.fn().mockRejectedValue(original);
    await expect(withServiceCall(op, 'Falha ao salvar')).rejects.toThrow('Falha ao salvar');
    expect(logger.error).toHaveBeenCalledTimes(1);
    const logged = logger.error.mock.calls[0][1];
    expect(logged.response.data.cpf).toBe('[REDACTED]');
    expect(logged.response.data.senha).toBe('[REDACTED]');
    expect(logged.response.data.token).toBe('[REDACTED]');
    expect(logged.response.data.telefone).toBe('[REDACTED]');
    expect(logged.response.data.endereco.cep).toBe('[REDACTED]');
    expect(logged.response.data.usuario).toBe('João');
    expect(logged.response.data.endereco.rua).toBe('Av. Paulista');
  });

  it('redada campos sensíveis do config.data (payload enviado)', async () => {
    const original = new Error('request failed');
    original.config = {
      url: '/api/usuarios',
      method: 'post',
      data: { nome: 'Maria', senha: 'secreta', token: 'tok-123' },
    };
    const op = vi.fn().mockRejectedValue(original);
    await expect(withServiceCall(op, 'Falha')).rejects.toThrow();
    const logged = logger.error.mock.calls[0][1];
    expect(logged.config.data.senha).toBe('[REDACTED]');
    expect(logged.config.data.token).toBe('[REDACTED]');
    expect(logged.config.data.nome).toBe('Maria');
  });

  it('redada "email" exato mas preserva campos compostos como email_notificacao', async () => {
    const original = new Error('validation failed');
    original.response = {
      status: 400,
      statusText: 'Bad Request',
      data: {
        email: 'joao@example.com',
        email_notificacao: 'sistema@afirmaevias.com',
        email_responsavel: 'resp@afirmaevias.com',
      },
    };
    const op = vi.fn().mockRejectedValue(original);
    await expect(withServiceCall(op, 'Falha')).rejects.toThrow();
    const logged = logger.error.mock.calls[0][1];
    expect(logged.response.data.email).toBe('[REDACTED]');
    expect(logged.response.data.email_notificacao).toBe('sistema@afirmaevias.com');
    expect(logged.response.data.email_responsavel).toBe('resp@afirmaevias.com');
  });

  it('preserva a causa original (objeto bruto) em error.cause mesmo após redação', async () => {
    const original = new Error('boom');
    original.response = { status: 500, data: { cpf: '123' } };
    const op = vi.fn().mockRejectedValue(original);
    try {
      await withServiceCall(op, 'msg');
    } catch (err) {
      expect(err.cause).toBe(original);
      expect(err.cause.response.data.cpf).toBe('123');
    }
  });
});