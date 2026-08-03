import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import {
  extractIpAddress,
  extractDeviceInfo,
  computeChainHash,
} from '../../shared/backendCommon.ts';

/**
 * Backend function: registrarAuditoria
 *
 * Cria uma entrada imutável na trilha de auditoria (AuditTrail) com captura
 * automática de IP e User-Agent, e hash encadeado para integridade
 * tamper-evident.
 *
 * Esta função é o ponto central para eventos iniciados pelo frontend:
 *   - Autenticação (login success/failure, logout, password reset)
 *   - Gestão de usuários (criação, alteração de permissão)
 *   - Exportação de relatórios
 *
 * Eventos de mutação de registros (create/update/delete/approve) continuam
 * sendo auditados inline em validarESalvarRegistro e gerenciarAprovacao,
 * que também calculam o chain_hash.
 *
 * Payload: {
 *   event_type: string,          // ex: LOGIN_SUCCESS, LOGOUT, REPORT_EXPORTED
 *   entity_name?: string,        // entidade afetada (default: 'AuthSession' para eventos de auth)
 *   entity_id?: string,          // ID do registro afetado
 *   changes?: array,             // diff campo-a-campo
 *   result?: 'success'|'failure',// default: 'success'
 *   failure_reason?: string,     // motivo do fracasso
 *   actor_email?: string,        // para eventos não autenticados (ex: login failure)
 *   actor_name?: string,         // nome do ator
 *   actor_role?: string,         // papel do ator
 * }
 *
 * Retorna: { success: true, data: <audit_entry> }
 */

const AUTH_EVENT_TYPES = new Set([
  'login_success', 'login_failure', 'logout', 'logout_inactivity',
  'password_reset_request', 'password_reset', 'token_expired',
]);

/**
 * Valida formato básico de e-mail para eventos anônimos.
 * Impede forjamento de identidade com strings arbitrárias.
 */
function isValidEmail(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const {
      event_type,
      entity_name,
      entity_id,
      changes,
      result = 'success',
      failure_reason,
      actor_email,
      actor_name,
      actor_role,
    } = body;

    if (!event_type) {
      return Response.json(
        { error: 'event_type é obrigatório', errorCategory: 'schema' },
        { status: 400 }
      );
    }

    const ipAddress = extractIpAddress(req);
    const deviceInfo = extractDeviceInfo(req);

    // Tenta autenticar — eventos de auth podem ocorrer sem token (login failure)
    let user = null;
    let base44 = null;
    try {
      base44 = createClientFromRequest(req);
      user = await base44.auth.me();
    } catch {
      // Não autenticado — ok para eventos de auth
    }

    // Para eventos não-autenticados (não são de auth), rejeitar
    if (!user && !AUTH_EVENT_TYPES.has(event_type)) {
      return Response.json(
        { error: 'Unauthorized', errorCategory: 'permission' },
        { status: 401 }
      );
    }

    // Determina o ator.
    // Quando não autenticado, os campos de identidade NUNCA vêm do payload
    // (prevenção de log spoofing — um atacante anônimo não pode forjar um
    // login_success de um administrador). Nome e papel são sempre estáticos;
    // o email do ator só é aceito para eventos anônimos legítimos onde ele
    // representa o ALVO da tentativa (login_failure, password_reset_request,
    // password_reset, token_expired), nunca para login_success/logout que
    // exigiriam sessão válida.
    const ANON_EVENTS_WITH_TARGET_EMAIL = new Set([
      'login_failure', 'password_reset_request', 'password_reset', 'token_expired',
    ]);

    let changedBy: string;
    let changedByName: string;
    let resolvedActorRole: string;
    // Para chamadas anônimas, travamos os campos controláveis pelo
    // cliente para evitar forjamento/polução da trilha de auditoria:
    // entity_name, entity_id e changes são ignorados do payload, e
    // actor_email só é aceito se for um e-mail bem formado.
    let forcedEntityName: string | null = null;
    let forcedEntityId: unknown = undefined;
    let resolvedChanges: unknown[] | null = null;

    if (user) {
      changedBy = user.email || '';
      changedByName = user.laboratorista_name || user.full_name || '';
      resolvedActorRole = user.access_level || user.role || '';
    } else {
      // actor_email só é aceito para eventos anônimos legítimos onde
      // representa o ALVO da tentativa (login_failure, password_reset_*,
      // token_expired) — e somente se for um e-mail bem formado.
      changedBy = ANON_EVENTS_WITH_TARGET_EMAIL.has(event_type) && isValidEmail(actor_email)
        ? String(actor_email).toLowerCase()
        : 'Anônimo';
      changedByName = 'Anônimo';
      resolvedActorRole = 'não_autenticado';
      // Eventos anônimos são sempre de auth: fixamos entity_name em
      // AuthSession e descartamos changes/entity_id do payload para
      // impedir injeção de conteúdo arbitrário na trilha.
      forcedEntityName = 'AuthSession';
      forcedEntityId = null;
      resolvedChanges = [];
    }

    const now = new Date().toISOString();
    const resolvedEntityName = forcedEntityName || entity_name || (AUTH_EVENT_TYPES.has(event_type) ? 'AuthSession' : 'Unknown');
    const resolvedEntityId = forcedEntityId !== undefined ? forcedEntityId : (entity_id || null);
    const resolvedResult = result === 'failure' ? 'failure' : 'success';
    const resolvedFailureReason = failure_reason ? String(failure_reason).slice(0, 1000) : null;
    const finalChanges = resolvedChanges !== null ? resolvedChanges : (changes || []);

    // ── CHAIN HASH — busca última entrada e computa hash encadeado ──
    let previousHash: string | null = null;
    try {
      const latest = await base44?.asServiceRole.entities.AuditTrail.list('-created_date', 1);
      if (latest && latest.length > 0) {
        previousHash = latest[0].chain_hash || null;
      }
    } catch {
      // Se não conseguir buscar a última entrada, previousHash fica null
    }

    const entryData = {
      entity_name: resolvedEntityName,
      entity_id: resolvedEntityId,
      operation: event_type,
      changed_by: changedBy,
      changed_by_name: changedByName,
      actor_role: resolvedActorRole,
      ip_address: ipAddress,
      device_info: deviceInfo,
      result: resolvedResult,
      failure_reason: resolvedFailureReason,
      timestamp: now,
    };

    const chainHash = await computeChainHash(entryData, previousHash);

    if (!base44) {
      return Response.json(
        { error: 'Não foi possível registrar auditoria: sessão indisponível', errorCategory: 'unknown' },
        { status: 500 }
      );
    }

    // Cria a entrada (asServiceRole bypassa RLS — create é permitido)
    const auditEntry = await base44.asServiceRole.entities.AuditTrail.create({
      ...entryData,
      changes: finalChanges,
      client_timestamp: null,
      is_offline_sync: false,
      chain_hash: chainHash,
      previous_hash: previousHash,
    });

    return Response.json({ success: true, data: auditEntry });
  } catch (error) {
    return Response.json({ error: error.message, errorCategory: 'unknown' }, { status: 500 });
  }
});