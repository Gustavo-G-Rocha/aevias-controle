/**
 * Shared: utilidades comuns para backend functions.
 *
 * Consolidada de validarESalvarRegistro, gerenciarAprovacao e
 * assinarEletronicamente para eliminar code duplication e garantir
 * consistência de segurança entre todas as funções.
 *
 * Inclui:
 * - Tenant access (re-exportado de tenantAccess.ts)
 * - Resilient GET (getWithRetry)
 * - XSS sanitization (sanitizeText, sanitizeTextFields)
 * - Integrity hash (computeIntegrityHash, serializeForHash)
 * - Audit diff (computeAuditDiff)
 * - Request enrichment (extractIpAddress, extractDeviceInfo)
 * - Audit trail chain (computeChainHash, createAuditEntry)
 * - Tenant validation for record/obra (verifyTenantAccessForRecord, verifyObraTenantAccess)
 */

// ── Re-exports de tenantAccess.ts ──────────────────────────────────────
export {
  getUserAccessLevel,
  getEffectiveAccessLevel,
  verifyTenantAccess,
} from './tenantAccess.ts';

import { getUserAccessLevel, getEffectiveAccessLevel } from './tenantAccess.ts';

// ── Approver levels ─────────────────────────────────────────────────────
// Níveis que têm poder de aprovação/reprovação/assinatura.

export const APPROVER_LEVELS = ['admin', 'sala_tecnica_afirmaevias', 'gestor_contrato', 'cliente_supervisor'];

export function canApprove(user: any): boolean {
  return APPROVER_LEVELS.includes(getUserAccessLevel(user));
}

// ── Resilient GET ──────────────────────────────────────────────────────
// Distingue "registro realmente inexistente" (404) de falhas transitórias
// (rate limit, rede, 5xx). Retenta uma vez antes de desistir.

export function isNotFoundError(e: any): boolean {
  const status = e?.status ?? e?.response?.status;
  if (status === 404) return true;
  return /not\s*found|não\s*encontrad/i.test(String(e?.message || ''));
}

export async function getWithRetry(
  fetcher: () => Promise<any>
): Promise<{ record?: any; notFound?: boolean; transient?: boolean }> {
  try {
    const record = await fetcher();
    return record ? { record } : { notFound: true };
  } catch (e1) {
    if (isNotFoundError(e1)) return { notFound: true };
    await new Promise((r) => setTimeout(r, 500));
    try {
      const record = await fetcher();
      return record ? { record } : { notFound: true };
    } catch (e2) {
      if (isNotFoundError(e2)) return { notFound: true };
      return { transient: true };
    }
  }
}

// ── XSS Sanitization ───────────────────────────────────────────────────
// Espelha src/utils/dataSanitization.js — text-only policy, no HTML.

const DANGEROUS_TAGS = 'script|iframe|object|embed|style|svg|math|template|noscript|noframes|applet|xml';
const DANGEROUS_VOID_TAGS = `${DANGEROUS_TAGS}|link|meta|base|form|input|button`;

export function sanitizeText(val: unknown): string {
  if (typeof val !== 'string' || !val) return val as string;
  let s = val;
  // 1. Remover caracteres de controle (exceto \t \n \r)
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // 2. Remover blocos de tags perigosas com conteúdo
  s = s.replace(new RegExp(`<\\s*(${DANGEROUS_TAGS})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi'), '');
  // 3. Remover tags perigosas sem fechamento
  s = s.replace(new RegExp(`<\\s*(?:${DANGEROUS_VOID_TAGS})\\b[^>]*>`, 'gi'), '');
  s = s.replace(new RegExp(`<\\s*\\/\\s*(?:${DANGEROUS_TAGS})\\s*>`, 'gi'), '');
  // 4. Remover atributos de evento
  s = s.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)?/gi, '');
  // 5. Remover protocolos perigosos
  s = s.replace(/javascript:/gi, '').replace(/vbscript:/gi, '').replace(/data:text\/html/gi, '');
  // 6. Neutralizar sintaxe de template engine (SSTI)
  s = s.replace(/\{\{/g, '{ {').replace(/\}\}/g, '} }');
  s = s.replace(/<%/g, '< %').replace(/%>/g, '% >');
  // 7. Limite de tamanho
  if (s.length > 10000) s = s.substring(0, 10000);
  return s;
}

export function sanitizeTextFields(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeText(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeTextFields);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeTextFields(value);
    }
    return result;
  }
  return obj;
}

// ── Integrity Hash (espelha src/utils/integrityHash.js) ────────────────
// Campos excluídos do hash: mudam legitimamente após a assinatura.

export const INTEGRITY_EXCLUDED_FIELDS = new Set([
  'id', 'created_date', 'updated_date', 'created_by_id',
  'status',
  'approved', 'approved_by', 'approved_date', 'approver_details',
  'rejection_reason', 'was_rejected', 'client_signature',
  'integrity_hash', 'integrity_hash_date',
  'pendente_aprovacao_cliente', 'cliente_aprovacao', 'cliente_aprovacao_data',
  'cliente_aprovacao_responsavel', 'cliente_reprovacao_motivo',
  'manager_signature',
]);

export function serializeForHash(record: unknown): string {
  if (record === null || record === undefined) return 'null';
  if (typeof record !== 'object') return JSON.stringify(record);
  if (Array.isArray(record)) {
    return '[' + record.map(serializeForHash).join(',') + ']';
  }
  const obj = record as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => !INTEGRITY_EXCLUDED_FIELDS.has(k))
    .sort();
  const parts = keys.map((k) => JSON.stringify(k) + ':' + serializeForHash(obj[k]));
  return '{' + parts.join(',') + '}';
}

export async function computeIntegrityHash(record: unknown): Promise<string> {
  const serialized = serializeForHash(record);
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    return simpleHash(serialized);
  }
  const data = new TextEncoder().encode(serialized);
  const buf = await subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function simpleHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return hash.toString(16).padStart(16, '0').repeat(4).slice(0, 64);
}

// ── Audit Diff ─────────────────────────────────────────────────────────
// Espelha src/utils/auditTrail.js — diff campo-a-campo para AuditTrail.

export const AUDIT_SYSTEM_FIELDS = new Set([
  'id', 'created_date', 'updated_date', 'created_by_id', 'created_by', 'is_sample',
]);

export function computeAuditDiff(oldData: any, newData: any) {
  const changes: Array<{ field: string; old_value: any; new_value: any }> = [];
  if (!oldData || !newData) return changes;

  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  for (const key of allKeys) {
    if (AUDIT_SYSTEM_FIELDS.has(key)) continue;

    const oldVal = oldData[key];
    const newVal = newData[key];

    if (oldVal == null && newVal == null) continue;

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, old_value: oldVal, new_value: newVal });
    }
  }
  return changes;
}

// ── Request Enrichment ─────────────────────────────────────────────────

export function extractIpAddress(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const firstIp = xff.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();
  return '';
}

export function extractDeviceInfo(req: Request): string {
  const ua = req.headers.get('user-agent');
  return ua ? ua.substring(0, 500) : '';
}

// ── Audit Trail Chain ──────────────────────────────────────────────────

export async function computeChainHash(
  entryData: Record<string, unknown>,
  previousHash: string | null
): Promise<string> {
  const payload = JSON.stringify(entryData) + (previousHash || '');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createAuditEntry(
  base44: any,
  req: Request,
  user: any,
  entry: {
    entity_name: string;
    entity_id?: string;
    operation: string;
    changes?: any[];
    result?: string;
    failure_reason?: string;
    client_timestamp?: string | null;
    is_offline_sync?: boolean;
  }
) {
  const ipAddress = extractIpAddress(req);
  const deviceInfo = extractDeviceInfo(req);
  const now = new Date().toISOString();
  const actorRole = user?.access_level || user?.role || '';

  let previousHash: string | null = null;
  try {
    const latest = await base44.asServiceRole.entities.AuditTrail.list('-created_date', 1);
    if (latest && latest.length > 0) {
      previousHash = latest[0].chain_hash || null;
    }
  } catch { /* previousHash stays null */ }

  const entryData = {
    entity_name: entry.entity_name,
    entity_id: entry.entity_id || null,
    operation: entry.operation,
    changed_by: user?.email || '',
    changed_by_name: user?.laboratorista_name || user?.full_name || '',
    actor_role: actorRole,
    ip_address: ipAddress,
    device_info: deviceInfo,
    result: entry.result || 'success',
    failure_reason: entry.failure_reason || null,
    timestamp: now,
  };

  const chainHash = await computeChainHash(entryData, previousHash);

  return base44.asServiceRole.entities.AuditTrail.create({
    ...entryData,
    changes: entry.changes || [],
    client_timestamp: entry.client_timestamp || null,
    is_offline_sync: entry.is_offline_sync || false,
    chain_hash: chainHash,
    previous_hash: previousHash,
  });
}

// ── Tenant validation for record (used by validarESalvarRegistro) ──────
// Mais simples que verifyTenantAccess — sem caches, sem isSupervisor.
// Verifica o direito do usuário sobre um registro existente (update).

export async function verifyTenantAccessForRecord(
  base44: any,
  user: any,
  record: any
): Promise<{ allowed: boolean; reason?: string; status?: number }> {
  const level = getUserAccessLevel(user);

  if (level === 'admin') return { allowed: true };

  if (level === 'user' || getEffectiveAccessLevel(user) === 'user') {
    if (record.created_by === user.email || record.created_by_id === user.id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Sem permissão sobre este registro', status: 403 };
  }

  if (!record.obra_id) {
    return { allowed: false, reason: 'Registro sem obra vinculada', status: 403 };
  }

  const obraFetch = await getWithRetry(() => base44.asServiceRole.entities.Obra.get(record.obra_id));
  if (obraFetch.transient) {
    return { allowed: false, reason: 'Falha temporária ao validar a obra. Tente novamente.', status: 503 };
  }
  const obra = obraFetch.record;
  if (!obra || !obra.regional_id) {
    return { allowed: false, reason: obra ? 'Obra sem regional vinculada' : 'Obra não encontrada', status: obra ? 403 : 404 };
  }

  const regFetch = await getWithRetry(() => base44.asServiceRole.entities.Regional.get(obra.regional_id));
  if (regFetch.transient) {
    return { allowed: false, reason: 'Falha temporária ao validar a regional. Tente novamente.', status: 503 };
  }
  const regional = regFetch.record;
  if (!regional) {
    return { allowed: false, reason: 'Regional não encontrada', status: 404 };
  }

  const userEmail = (user.email || '').toLowerCase();

  if (getEffectiveAccessLevel(user) === 'cliente') {
    const emails = (regional.clientes_responsaveis || []).map((e: string) => e.toLowerCase());
    const supervisores = (regional.supervisores_responsaveis || []).map((e: string) => e.toLowerCase());
    if (emails.includes(userEmail) || supervisores.includes(userEmail)) return { allowed: true };
  } else if (getEffectiveAccessLevel(user) === 'sala_tecnica_afirmaevias') {
    const emails = (regional.salas_tecnicas_responsaveis || []).map((e: string) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (getEffectiveAccessLevel(user) === 'gestor_contrato') {
    const emails = (regional.gestores_contrato_responsaveis || []).map((e: string) => e.toLowerCase());
    const legacy = (regional.gestor_contrato_responsavel || '').toLowerCase();
    if (emails.includes(userEmail) || legacy === userEmail) return { allowed: true };
  }

  return { allowed: false, reason: 'Sem permissão sobre este registro (tenant)', status: 403 };
}

// ── Tenant validation for obra (used by validarESalvarRegistro) ─────────
// Verifica o direito do usuário sobre uma obra (create/update).
// Retorna a obra validada para reutilização na denormalização.

export async function verifyObraTenantAccess(
  base44: any,
  user: any,
  obraId: string
): Promise<{ allowed: boolean; reason?: string; status?: number; obra?: any }> {
  const level = getUserAccessLevel(user);

  if (level === 'admin' || level === 'user') {
    return { allowed: true };
  }

  const obraFetch = await getWithRetry(() => base44.asServiceRole.entities.Obra.get(obraId));
  if (obraFetch.transient) {
    return { allowed: false, reason: 'Falha temporária ao validar a obra. Tente novamente.', status: 503 };
  }
  const obra = obraFetch.record;
  if (!obra || !obra.regional_id) {
    return { allowed: false, reason: obra ? 'Obra sem regional vinculada' : 'Obra não encontrada', status: obra ? 403 : 404 };
  }

  const regFetch = await getWithRetry(() => base44.asServiceRole.entities.Regional.get(obra.regional_id));
  if (regFetch.transient) {
    return { allowed: false, reason: 'Falha temporária ao validar a regional. Tente novamente.', status: 503 };
  }
  const regional = regFetch.record;
  if (!regional) {
    return { allowed: false, reason: 'Regional não encontrada', status: 404 };
  }

  const userEmail = (user.email || '').toLowerCase();

  if (getEffectiveAccessLevel(user) === 'cliente') {
    const emails = (regional.clientes_responsaveis || []).map((e: string) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true, obra };
  } else if (getEffectiveAccessLevel(user) === 'sala_tecnica_afirmaevias') {
    const emails = (regional.salas_tecnicas_responsaveis || []).map((e: string) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true, obra };
  } else if (getEffectiveAccessLevel(user) === 'gestor_contrato') {
    const emails = (regional.gestores_contrato_responsaveis || []).map((e: string) => e.toLowerCase());
    const legacy = (regional.gestor_contrato_responsavel || '').toLowerCase();
    if (emails.includes(userEmail) || legacy === userEmail) return { allowed: true, obra };
  }

  return { allowed: false, reason: 'Sem permissão sobre a obra (tenant)', status: 403 };
}