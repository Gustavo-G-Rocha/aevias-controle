import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyChainIntegrity, reconstructHistory } from '@/utils/auditTrail';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Frontend helper: auditEvents.js ──
const auditEventsSrc = readFileSync(
  resolve(__dirname, '../../utils/auditEvents.js'),
  'utf-8'
);

// ── Backend function: registrarAuditoria ──
const registrarSrc = readFileSync(
  resolve(__dirname, '../../../base44/functions/registrarAuditoria/entry.ts'),
  'utf-8'
);

// ── Backend function: gerenciarAprovacao ──
const aprovSrc = readFileSync(
  resolve(__dirname, '../../../base44/functions/gerenciarAprovacao/entry.ts'),
  'utf-8'
);

// ── Backend function: validarESalvarRegistro ──
const validarSrc = readFileSync(
  resolve(__dirname, '../../../base44/functions/validarESalvarRegistro/entry.ts'),
  'utf-8'
);

// ── Backend function: exportarEnsaiosPDF ──
const exportSrc = readFileSync(
  resolve(__dirname, '../../../base44/functions/exportarEnsaiosPDF/entry.ts'),
  'utf-8'
);

// ── Entity schema ──
const schemaSrc = readFileSync(
  resolve(__dirname, '../../../base44/entities/AuditTrail.jsonc'),
  'utf-8'
);

describe('AuditTrail — Schema expansion', () => {
  it('inclui campos de contexto (IP, dispositivo, resultado)', () => {
    expect(schemaSrc).toContain('ip_address');
    expect(schemaSrc).toContain('device_info');
    expect(schemaSrc).toContain('actor_role');
    expect(schemaSrc).toContain('result');
    expect(schemaSrc).toContain('failure_reason');
  });

  it('inclui campos de integridade (chain_hash, previous_hash)', () => {
    expect(schemaSrc).toContain('chain_hash');
    expect(schemaSrc).toContain('previous_hash');
  });

  it('expande enum de operation com eventos de auth, user e export', () => {
    expect(schemaSrc).toContain('login_success');
    expect(schemaSrc).toContain('login_failure');
    expect(schemaSrc).toContain('logout');
    expect(schemaSrc).toContain('logout_inactivity');
    expect(schemaSrc).toContain('password_reset_request');
    expect(schemaSrc).toContain('password_reset');
    expect(schemaSrc).toContain('report_exported');
    expect(schemaSrc).toContain('permission_updated');
    expect(schemaSrc).toContain('user_created');
    expect(schemaSrc).toContain('user_deactivated');
    expect(schemaSrc).toContain('token_expired');
  });

  it('RLS é append-only (update e delete bloqueados para todos)', () => {
    expect(schemaSrc).toContain('__append_only__');
    // update e delete usam user_condition com role inexistente
    const updateMatch = schemaSrc.match(/"update":\s*\{[^}]*__append_only__/);
    const deleteMatch = schemaSrc.match(/"delete":\s*\{[^}]*__append_only__/);
    expect(updateMatch).toBeTruthy();
    expect(deleteMatch).toBeTruthy();
  });
});

describe('registrarAuditoria — Backend function', () => {
  it('extrai IP considerando X-Forwarded-For e X-Real-IP', () => {
    expect(registrarSrc).toContain('x-forwarded-for');
    expect(registrarSrc).toContain('x-real-ip');
  });

  it('extrai User-Agent como device_info', () => {
    expect(registrarSrc).toContain('user-agent');
    expect(registrarSrc).toContain('extractDeviceInfo');
  });

  it('computa chain_hash com SHA-256 + previous_hash', () => {
    expect(registrarSrc).toContain('computeChainHash');
    expect(registrarSrc).toContain('SHA-256');
    expect(registrarSrc).toContain('previousHash');
  });

  it('permite eventos de auth sem autenticação', () => {
    expect(registrarSrc).toContain('AUTH_EVENT_TYPES');
    expect(registrarSrc).toContain('login_failure');
  });

  it('define entity_name padrão para AuthSession em eventos de auth', () => {
    expect(registrarSrc).toContain('AuthSession');
  });
});

describe('auditEvents — Frontend helper', () => {
  it('exporta helpers semânticos para todos os eventos críticos', () => {
    expect(auditEventsSrc).toContain('logLoginSuccess');
    expect(auditEventsSrc).toContain('logLoginFailure');
    expect(auditEventsSrc).toContain('logLogout');
    expect(auditEventsSrc).toContain('logPasswordResetRequest');
    expect(auditEventsSrc).toContain('logPasswordReset');
    expect(auditEventsSrc).toContain('logReportExported');
    expect(auditEventsSrc).toContain('logUserCreated');
    expect(auditEventsSrc).toContain('logPermissionUpdated');
    expect(auditEventsSrc).toContain('logUserDeactivated');
  });

  it('falhas de auditoria são silent (não bloqueiam fluxo do usuário)', () => {
    expect(auditEventsSrc).toContain('catch');
    expect(auditEventsSrc).toMatch(/silent|Silent|warn/i);
  });

  it('invoca registrarAuditoria via base44.functions.invoke', () => {
    expect(auditEventsSrc).toContain("base44.functions.invoke");
    expect(auditEventsSrc).toContain("registrarAuditoria");
  });
});

describe('Backend functions — IP/dispositivo/chain_hash enriquecidos', () => {
  it('gerenciarAprovacao usa createAuditEntry com IP e chain_hash', () => {
    expect(aprovSrc).toContain('createAuditEntry');
    expect(aprovSrc).toContain('extractIpAddress');
    expect(aprovSrc).toContain('computeChainHash');
  });

  it('validarESalvarRegistro usa createAuditEntry com IP e chain_hash', () => {
    expect(validarSrc).toContain('createAuditEntry');
    expect(validarSrc).toContain('extractIpAddress');
    expect(validarSrc).toContain('computeChainHash');
  });

  it('exportarEnsaiosPDF registra REPORT_EXPORTED com IP e chain_hash', () => {
    expect(exportSrc).toContain('report_exported');
    expect(exportSrc).toContain('extractIpAddress');
    expect(exportSrc).toContain('computeChainHash');
    expect(exportSrc).toContain('chain_hash');
  });
});

describe('Auth event instrumentation', () => {
  const loginSrc = readFileSync(
    resolve(__dirname, '../../pages/Login.jsx'),
    'utf-8'
  );
  const authContextSrc = readFileSync(
    resolve(__dirname, '../../lib/AuthContext.jsx'),
    'utf-8'
  );
  const forgotSrc = readFileSync(
    resolve(__dirname, '../../pages/ForgotPassword.jsx'),
    'utf-8'
  );
  const resetSrc = readFileSync(
    resolve(__dirname, '../../pages/ResetPassword.jsx'),
    'utf-8'
  );

  it('Login.jsx registra login_success e login_failure', () => {
    expect(loginSrc).toContain('logLoginSuccess');
    expect(loginSrc).toContain('logLoginFailure');
  });

  it('AuthContext.jsx registra logout manual e por inatividade', () => {
    expect(authContextSrc).toContain('logLogout');
    expect(authContextSrc).toContain("reason = 'manual'");
    expect(authContextSrc).toContain("'inactivity'");
  });

  it('ForgotPassword.jsx registra solicitação de reset', () => {
    expect(forgotSrc).toContain('logPasswordResetRequest');
  });

  it('ResetPassword.jsx registra redefinição concluída', () => {
    expect(resetSrc).toContain('logPasswordReset');
  });
});

describe('verifyChainIntegrity — Cadeia tamper-evident', () => {
  it('retorna valid=true para cadeia intacta', () => {
    const entries = [
      { id: '1', created_date: '2025-01-01T10:00:00Z', chain_hash: 'aaa', previous_hash: null },
      { id: '2', created_date: '2025-01-01T11:00:00Z', chain_hash: 'bbb', previous_hash: 'aaa' },
      { id: '3', created_date: '2025-01-01T12:00:00Z', chain_hash: 'ccc', previous_hash: 'bbb' },
    ];
    const result = verifyChainIntegrity(entries);
    expect(result.valid).toBe(true);
  });

  it('retorna valid=false quando um link está quebrado', () => {
    const entries = [
      { id: '1', created_date: '2025-01-01T10:00:00Z', chain_hash: 'aaa', previous_hash: null },
      { id: '2', created_date: '2025-01-01T11:00:00Z', chain_hash: 'bbb', previous_hash: 'TAMPERED' },
      { id: '3', created_date: '2025-01-01T12:00:00Z', chain_hash: 'ccc', previous_hash: 'bbb' },
    ];
    const result = verifyChainIntegrity(entries);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(1);
  });

  it('retorna valid=true para lista vazia', () => {
    expect(verifyChainIntegrity([]).valid).toBe(true);
  });

  it('retorna valid=true para entrada única', () => {
    const entries = [
      { id: '1', created_date: '2025-01-01T10:00:00Z', chain_hash: 'aaa', previous_hash: null },
    ];
    expect(verifyChainIntegrity(entries).valid).toBe(true);
  });
});

describe('User management instrumentation', () => {
  const usersActionsSrc = readFileSync(
    resolve(__dirname, '../../hooks/useUsersActions.js'),
    'utf-8'
  );

  it('registra criação de usuário (invite)', () => {
    expect(usersActionsSrc).toContain('logUserCreated');
  });

  it('registra alteração de permissão (access_level)', () => {
    expect(usersActionsSrc).toContain('logPermissionUpdated');
  });

  it('registra desativação de usuário (is_active = false)', () => {
    expect(usersActionsSrc).toContain('logUserDeactivated');
  });
});