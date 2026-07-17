/**
 * Robustez — Eventos de auditoria frontend (auditEvents.js)
 *
 * Garantias testadas:
 *   1. SILENT FAIL: falha na função de auditoria NUNCA propaga exceção
 *      (não pode quebrar login/logout do usuário).
 *   2. Payloads corretos: cada helper semântico envia o event_type e os
 *      campos esperados pelo backend registrarAuditoria.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const invokeMock = vi.fn();
vi.mock('@/api/base44Client', () => ({
  base44: { functions: { invoke: (...args) => invokeMock(...args) } },
}));
vi.mock('@/utils/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import {
  logAuditEvent,
  logLoginSuccess,
  logLoginFailure,
  logLogout,
  logPasswordResetRequest,
  logReportExported,
  logPermissionUpdated,
  logUserDeactivated,
} from '../../utils/auditEvents.js';

beforeEach(() => {
  invokeMock.mockReset();
  invokeMock.mockResolvedValue({ ok: true });
});

describe('logAuditEvent — silent fail (nunca quebra o fluxo)', () => {
  it('não propaga exceção quando o backend falha', async () => {
    invokeMock.mockRejectedValue(new Error('500 backend down'));
    await expect(logAuditEvent('login_success', {})).resolves.toBeUndefined();
  });

  it('não propaga exceção quando invoke lança sincronamente', async () => {
    invokeMock.mockImplementation(() => { throw new Error('sync boom'); });
    await expect(logAuditEvent('logout', {})).resolves.toBeUndefined();
  });

  it('invoca registrarAuditoria com event_type e details espalhados', async () => {
    await logAuditEvent('custom_event', { entity_name: 'User', entity_id: 'u1' });
    expect(invokeMock).toHaveBeenCalledWith('registrarAuditoria', {
      event_type: 'custom_event',
      entity_name: 'User',
      entity_id: 'u1',
    });
  });
});

describe('helpers semânticos — payloads corretos', () => {
  it('logLoginSuccess envia actor_email/actor_name/result', async () => {
    await logLoginSuccess('user@test.com', 'Fulano');
    expect(invokeMock).toHaveBeenCalledWith('registrarAuditoria', expect.objectContaining({
      event_type: 'login_success',
      actor_email: 'user@test.com',
      actor_name: 'Fulano',
      result: 'success',
    }));
  });

  it('logLoginFailure envia result=failure com motivo', async () => {
    await logLoginFailure('user@test.com', 'Senha incorreta');
    expect(invokeMock).toHaveBeenCalledWith('registrarAuditoria', expect.objectContaining({
      event_type: 'login_failure',
      result: 'failure',
      failure_reason: 'Senha incorreta',
    }));
  });

  it('logLoginFailure usa motivo padrão quando não informado', async () => {
    await logLoginFailure('user@test.com');
    expect(invokeMock).toHaveBeenCalledWith('registrarAuditoria', expect.objectContaining({
      failure_reason: 'Credenciais inválidas',
    }));
  });

  it('logLogout manual → logout; por inatividade → logout_inactivity', async () => {
    await logLogout();
    expect(invokeMock).toHaveBeenLastCalledWith('registrarAuditoria', expect.objectContaining({
      event_type: 'logout',
    }));
    await logLogout('inactivity');
    expect(invokeMock).toHaveBeenLastCalledWith('registrarAuditoria', expect.objectContaining({
      event_type: 'logout_inactivity',
    }));
  });

  it('logPasswordResetRequest envia actor_email', async () => {
    await logPasswordResetRequest('user@test.com');
    expect(invokeMock).toHaveBeenCalledWith('registrarAuditoria', expect.objectContaining({
      event_type: 'password_reset_request',
      actor_email: 'user@test.com',
    }));
  });

  it('logReportExported envia entity e report_type nos changes', async () => {
    await logReportExported('EnsaioCAUQ', 'rec1', 'pdf_unificado');
    expect(invokeMock).toHaveBeenCalledWith('registrarAuditoria', expect.objectContaining({
      event_type: 'report_exported',
      entity_name: 'EnsaioCAUQ',
      entity_id: 'rec1',
      changes: [{ field: 'report_type', old_value: null, new_value: 'pdf_unificado' }],
    }));
  });

  it('logPermissionUpdated registra old/new role (rastreabilidade de escalação)', async () => {
    await logPermissionUpdated('u9', 'user', 'admin');
    expect(invokeMock).toHaveBeenCalledWith('registrarAuditoria', expect.objectContaining({
      event_type: 'permission_updated',
      entity_id: 'u9',
      changes: [{ field: 'role', old_value: 'user', new_value: 'admin' }],
    }));
  });

  it('logUserDeactivated registra is_active true→false', async () => {
    await logUserDeactivated('u9');
    expect(invokeMock).toHaveBeenCalledWith('registrarAuditoria', expect.objectContaining({
      event_type: 'user_deactivated',
      changes: [{ field: 'is_active', old_value: true, new_value: false }],
    }));
  });
});