/**
 * auditEvents.js
 *
 * Helper de frontend para registrar eventos sensíveis na trilha de auditoria
 * via backend function `registrarAuditoria`.
 *
 * ## Eventos suportados
 *
 * ### Autenticação e Sessão
 * - LOGIN_SUCCESS     — login bem-sucedido
 * - LOGIN_FAILURE     — login falho (com motivo)
 * - LOGOUT            — logout manual
 * - LOGOUT_INACTIVITY — logout automático por inatividade
 * - PASSWORD_RESET_REQUEST — solicitação de reset de senha
 * - PASSWORD_RESET    — redefinição de senha concluída
 * - TOKEN_EXPIRED     — expiração/revogação de token
 *
 * ### Documentos e Registros
 * - REPORT_EXPORTED   — geração/exportação de relatório PDF
 *
 * ### Permissões e Papéis
 * - USER_CREATED      — criação/convite de usuário
 * - USER_DEACTIVATED  — desativação de conta
 * - PERMISSION_UPDATED — mudança de papel/acesso de usuário
 *
 * ## Princípios
 * - Falhas de auditoria NUNCA bloqueiam o fluxo do usuário (silent fail).
 * - IP e dispositivo são capturados server-side pela função.
 * - A entrada é imutável (RLS append-only).
 */

import { base44 } from '@/api/base44Client';
import { logger } from '@/utils/logger';

/**
 * Registra um evento na trilha de auditoria.
 *
 * @param {string} eventType - Tipo do evento (ex: LOGIN_SUCCESS, LOGOUT)
 * @param {object} details - Detalhes opcionais do evento
 * @param {string} [details.entity_name] - Entidade afetada
 * @param {string} [details.entity_id] - ID do registro afetado
 * @param {Array}  [details.changes] - Diff campo-a-campo
 * @param {'success'|'failure'} [details.result] - Resultado (default: success)
 * @param {string} [details.failure_reason] - Motivo do fracasso
 * @param {string} [details.actor_email] - Email do ator (para eventos não autenticados)
 * @param {string} [details.actor_name] - Nome do ator
 * @param {string} [details.actor_role] - Papel do ator
 */
export async function logAuditEvent(eventType, details = {}) {
  try {
    await base44.functions.invoke('registrarAuditoria', {
      event_type: eventType,
      ...details,
    });
  } catch (error) {
    // Silent fail — auditoria nunca deve bloquear o fluxo do usuário
    logger.warn('[auditEvents] Falha ao registrar evento:', eventType, error?.message);
  }
}

// ── Helpers semânticos para eventos comuns ──

export function logLoginSuccess(userEmail, userName) {
  return logAuditEvent('login_success', {
    actor_email: userEmail,
    actor_name: userName,
    result: 'success',
  });
}

export function logLoginFailure(userEmail, failureReason) {
  return logAuditEvent('login_failure', {
    actor_email: userEmail,
    result: 'failure',
    failure_reason: failureReason || 'Credenciais inválidas',
  });
}

export function logLogout(reason = 'manual') {
  return logAuditEvent(reason === 'inactivity' ? 'logout_inactivity' : 'logout', {
    result: 'success',
  });
}

export function logPasswordResetRequest(userEmail) {
  return logAuditEvent('password_reset_request', {
    actor_email: userEmail,
    result: 'success',
  });
}

export function logPasswordReset(userEmail) {
  return logAuditEvent('password_reset', {
    actor_email: userEmail,
    result: 'success',
  });
}

export function logReportExported(entityName, entityId, reportType) {
  return logAuditEvent('report_exported', {
    entity_name: entityName,
    entity_id: entityId,
    changes: [{ field: 'report_type', old_value: null, new_value: reportType }],
    result: 'success',
  });
}

export function logUserCreated(userEmail, role) {
  return logAuditEvent('user_created', {
    entity_name: 'User',
    changes: [{ field: 'email', old_value: null, new_value: userEmail },
              { field: 'role', old_value: null, new_value: role }],
    result: 'success',
  });
}

export function logPermissionUpdated(targetUserId, oldRole, newRole) {
  return logAuditEvent('permission_updated', {
    entity_name: 'User',
    entity_id: targetUserId,
    changes: [{ field: 'role', old_value: oldRole, new_value: newRole }],
    result: 'success',
  });
}

export function logUserDeactivated(targetUserId) {
  return logAuditEvent('user_deactivated', {
    entity_name: 'User',
    entity_id: targetUserId,
    changes: [{ field: 'is_active', old_value: true, new_value: false }],
    result: 'success',
  });
}