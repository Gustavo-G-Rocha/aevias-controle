import { createClientFromRequest } from 'npm:@base44/sdk@0.8.36';

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
 * Extrai o IP de origem da requisição, considerando proxies/load balancers.
 * Prioriza X-Forwarded-For (primeiro IP da cadeia), depois X-Real-IP.
 */
function extractIpAddress(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const firstIp = xff.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();
  return '';
}

/**
 * Extrai o User-Agent da requisição.
 */
function extractDeviceInfo(req: Request): string {
  const ua = req.headers.get('user-agent');
  return ua ? ua.substring(0, 500) : '';
}

/**
 * Computa hash SHA-256 do conteúdo da entrada + hash anterior (cadeia).
 * Usa Web Crypto API (disponível em Deno Deploy).
 */
async function computeChainHash(entryData: Record<string, unknown>, previousHash: string | null): Promise<string> {
  const payload = JSON.stringify(entryData) + (previousHash || '');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
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

    if (user) {
      changedBy = user.email || '';
      changedByName = user.laboratorista_name || user.full_name || '';
      resolvedActorRole = user.access_level || user.role || '';
    } else {
      changedBy = ANON_EVENTS_WITH_TARGET_EMAIL.has(event_type) && actor_email
        ? actor_email
        : 'Anônimo';
      changedByName = 'Anônimo';
      resolvedActorRole = 'não_autenticado';
    }

    const now = new Date().toISOString();
    const resolvedEntityName = entity_name || (AUTH_EVENT_TYPES.has(event_type) ? 'AuthSession' : 'Unknown');

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
      entity_id: entity_id || null,
      operation: event_type,
      changed_by: changedBy,
      changed_by_name: changedByName,
      actor_role: resolvedActorRole,
      ip_address: ipAddress,
      device_info: deviceInfo,
      result,
      failure_reason: failure_reason || null,
      timestamp: now,
    };

    const chainHash = await computeChainHash(entryData, previousHash);

    // Cria a entrada (asServiceRole bypassa RLS — create é permitido)
    const auditEntry = await base44?.asServiceRole.entities.AuditTrail.create({
      ...entryData,
      changes: changes || [],
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