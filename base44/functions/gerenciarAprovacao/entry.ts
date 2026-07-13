import { createClientFromRequest } from 'npm:@base44/sdk@0.8.36';

/**
 * Backend function: gerenciarAprovacao
 *
 * Verifica server-side o nível de acesso do usuário antes de executar
 * operações de aprovação, reprovação, assinatura ou mudança de status.
 * O client-side permanece apenas como camada de UX — a segurança é
 * enforceada aqui.
 *
 * Payload: { action, entityName, recordId, rejectionReason?, ncStatus?, requestApproval? }
 * Retorna:  { success: true, data: <record> } | { error: <message> }
 */

// ── HASH DE INTEGRIDADE — lógica inlinada (espelha src/utils/integrityHash.js) ──
// Campos excluídos do hash: mudam legitimamente após a assinatura.
const INTEGRITY_EXCLUDED_FIELDS = new Set([
  'id', 'created_date', 'updated_date', 'created_by_id',
  'status',
  'approved', 'approved_by', 'approved_date', 'approver_details',
  'rejection_reason', 'was_rejected', 'client_signature',
  'integrity_hash', 'integrity_hash_date',
  'pendente_aprovacao_cliente', 'cliente_aprovacao', 'cliente_aprovacao_data',
  'cliente_aprovacao_responsavel', 'cliente_reprovacao_motivo',
  'manager_signature',
]);

function serializeForHash(record: unknown): string {
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

async function computeIntegrityHash(record: unknown): Promise<string> {
  const serialized = serializeForHash(record);
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    // Fallback não-criptográfico (ambientes sem Web Crypto API)
    return simpleHash(serialized);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(serialized);
  const hashBuffer = await subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
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

const ALLOWED_ENTITIES = [
  // Ensaios
  'EnsaioCAUQ',
  'EnsaioMRAF',
  'EnsaioDensidade',
  'EnsaioDensidadeInSitu',
  'EnsaioGranulometriaIndividual',
  'EnsaioManchaPendulo',
  'EnsaioProctor',
  'EnsaioRompimentoConcreto',
  'EnsaioSondagem',
  'EnsaioTaxaMRAF',
  'EnsaioTaxaPinturaImprimacao',
  'EnsaioVigaBenkelman',
  'AcompanhamentoCarga',
  'AcompanhamentoUsinagem',
  'BoletimSondagem',
  'BoletimSondagemTrado',
  'GranuMistura',
  // Checklists
  'CertificacaoUsina',
  'ChecklistUsina',
  'ChecklistAplicacao',
  'ChecklistMRAF',
  'ChecklistConcretagem',
  'ChecklistTerraplanagem',
  'ChecklistReciclagem',
  // Diário
  'DiarioObra',
  // NC
  'RelatorioNC',
];

const APPROVER_LEVELS = ['admin', 'sala_tecnica_afirmaevias', 'gestor_contrato', 'cliente_supervisor'];

function getUserAccessLevel(user) {
  if (!user) return 'user';
  return user.access_level || (user.role === 'admin' ? 'admin' : 'user');
}

/** Normaliza para nível efetivo (cliente_supervisor→cliente, funcionarios_cliente→user) */
function getEffectiveAccessLevel(user) {
  const level = getUserAccessLevel(user);
  if (level === 'cliente_supervisor') return 'cliente';
  if (level === 'funcionarios_cliente') return 'user';
  return level;
}

function canApprove(user) {
  const level = getUserAccessLevel(user);
  return APPROVER_LEVELS.includes(level);
}

// Para cliente_supervisor: canApprove global é true, mas a verificação
// per-regional é feada por verifyTenantAccess → isSupervisor.
// Esta função apenas checa se o nível tem POTENCIAL de aprovar.
// O enforcement real está no handler: se level === 'cliente_supervisor'
// e tenantCheck.isSupervisor === false, a aprovação é bloqueada.

function canDelete(user, record, isSupervisor) {
  // admin: pode excluir qualquer registro
  if (getUserAccessLevel(user) === 'admin') return true;

  // laboratorista: apenas registros que criou
  if (record.created_by === user.email || record.created_by_id === user.id) return true;

  // cliente_supervisor: só pode excluir se for supervisor nesta regional
  const level = getUserAccessLevel(user);
  if (level === 'cliente_supervisor') return Boolean(isSupervisor);

  // approver-level (sala_tecnica, gestor_contrato): podem excluir registros do seu tenant
  return APPROVER_LEVELS.includes(level);
}

// ── DEFENSE-IN-DEPTH: validação funcional de tenant ──────────────────
// Segunda camada de proteção que não depende do RLS.
// Verifica explicitamente o direito do usuário sobre o registro,
// percorrendo a cadeia: registro → obra → regional → emails do usuário.
//
// Mesmo que o RLS esteja mal configurado ou ausente, esta função impede
// acesso cross-tenant entre clientes/regionais diferentes.
async function verifyTenantAccess(base44, user, entityName, record) {
  const level = getUserAccessLevel(user);
  const effectiveLevel = getEffectiveAccessLevel(user);

  // admin: acesso irrestrito (não precisa verificar tenant)
  if (level === 'admin') {
    return { allowed: true };
  }

  if (!record) {
    return { allowed: false, reason: 'Registro não encontrado', status: 404 };
  }

  // laboratorista / funcionarios_cliente: apenas registros que criou
  if (effectiveLevel === 'user') {
    if (record.created_by === user.email || record.created_by_id === user.id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Sem permissão sobre este registro', status: 403 };
  }

  // tenant-scoped users (cliente/cliente_supervisor, sala_tecnica, gestor_contrato):
  // precisam da cadeia registro → obra → regional
  if (!record.obra_id) {
    return { allowed: false, reason: 'Registro sem obra vinculada', status: 403 };
  }

  let obra;
  try {
    obra = await base44.asServiceRole.entities.Obra.get(record.obra_id);
  } catch {
    return { allowed: false, reason: 'Obra não encontrada', status: 404 };
  }
  if (!obra || !obra.regional_id) {
    return { allowed: false, reason: 'Obra sem regional vinculada', status: 403 };
  }

  let regional;
  try {
    regional = await base44.asServiceRole.entities.Regional.get(obra.regional_id);
  } catch {
    return { allowed: false, reason: 'Regional não encontrada', status: 404 };
  }
  if (!regional) {
    return { allowed: false, reason: 'Regional não encontrada', status: 404 };
  }

  const userEmail = (user.email || '').toLowerCase();

  // cliente e cliente_supervisor: mesmas regionais (clientes_responsaveis)
  if (effectiveLevel === 'cliente') {
    const emails = (regional.clientes_responsaveis || []).map((e) => e.toLowerCase());
    if (emails.includes(userEmail)) {
      // cliente_supervisor: verifica se é supervisor nesta regional
      const supervisores = (regional.supervisores_responsaveis || []).map((e) => e.toLowerCase());
      const isSupervisor = level === 'cliente_supervisor' && supervisores.includes(userEmail);
      return { allowed: true, isSupervisor };
    }
  } else if (effectiveLevel === 'sala_tecnica_afirmaevias') {
    const emails = (regional.salas_tecnicas_responsaveis || []).map((e) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (effectiveLevel === 'gestor_contrato') {
    const emails = (regional.gestores_contrato_responsaveis || []).map((e) => e.toLowerCase());
    const legacy = (regional.gestor_contrato_responsavel || '').toLowerCase();
    if (emails.includes(userEmail) || legacy === userEmail) return { allowed: true };
  }

  return { allowed: false, reason: 'Sem permissão sobre este registro (tenant)', status: 403 };
}

// ── AUDIT TRAIL: Diff computation ──────────────────────────────────────
const AUDIT_SYSTEM_FIELDS = new Set([
  'id', 'created_date', 'updated_date', 'created_by_id', 'created_by', 'is_sample',
]);

function computeAuditDiff(oldData: any, newData: any) {
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

// ── AUDIT ENRICHMENT: IP, dispositivo e chain hash ──────────────────
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

function extractDeviceInfo(req: Request): string {
  const ua = req.headers.get('user-agent');
  return ua ? ua.substring(0, 500) : '';
}

async function computeChainHash(entryData: Record<string, unknown>, previousHash: string | null): Promise<string> {
  const payload = JSON.stringify(entryData) + (previousHash || '');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function createAuditEntry(base44: any, req: Request, user: any, entry: {
  entity_name: string;
  entity_id?: string;
  operation: string;
  changes?: any[];
  result?: string;
  failure_reason?: string;
  client_timestamp?: string | null;
  is_offline_sync?: boolean;
}) {
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized', errorCategory: 'permission' }, { status: 401 });
    }

    const body = await req.json();
    const { action, entityName, recordId, rejectionReason: rawRejectionReason, ncStatus, requestApproval } = body;

    // ── SANITIZAÇÃO XSS — defense-in-depth (espelha src/utils/dataSanitization.js) ──
    // rejectionReason é texto livre do usuário — sanitiza antes de persistir.
    const DANGEROUS_TAGS_R = 'script|iframe|object|embed|style|svg|math|template|noscript|noframes|applet|xml';
    const DANGEROUS_VOID_TAGS_R = `${DANGEROUS_TAGS_R}|link|meta|base|form|input|button`;
    const sanitizeTextR = (val: unknown): string => {
      if (typeof val !== 'string' || !val) return val as string;
      let s = val;
      s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      s = s.replace(new RegExp(`<\\s*(${DANGEROUS_TAGS_R})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi'), '');
      s = s.replace(new RegExp(`<\\s*(?:${DANGEROUS_VOID_TAGS_R})\\b[^>]*>`, 'gi'), '');
      s = s.replace(new RegExp(`<\\s*\\/\\s*(?:${DANGEROUS_TAGS_R})\\s*>`, 'gi'), '');
      s = s.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)?/gi, '');
      s = s.replace(/javascript:/gi, '').replace(/vbscript:/gi, '').replace(/data:text\/html/gi, '');
      s = s.replace(/\{\{/g, '{ {').replace(/\}\}/g, '} }');
      s = s.replace(/<%/g, '< %').replace(/%>/g, '% >');
      if (s.length > 10000) s = s.substring(0, 10000);
      return s;
    };
    const rejectionReason = rawRejectionReason ? sanitizeTextR(rawRejectionReason) : rawRejectionReason;

    // Whitelist de entidades permitidas
    if (!ALLOWED_ENTITIES.includes(entityName)) {
      return Response.json(
        { error: `Entidade não suportada: ${entityName}`, errorCategory: 'schema' },
        { status: 400 }
      );
    }

    if (!recordId) {
      return Response.json(
        { error: 'recordId é obrigatório', errorCategory: 'schema' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const level = getUserAccessLevel(user);
    const approverName = user.laboratorista_name || user.full_name || '';
    const updateData: Record<string, unknown> = {};

    // ── DEFENSE-IN-DEPTH: buscar registro e validar tenant ────────────
    // Busca o registro uma vez (asServiceRole bypassa RLS) e valida o
    // direito do usuário sobre ele ANTES de qualquer mutação.
    // O registro é reutilizado na normalização de fotos mais abaixo.
    let existingRecord;
    try {
      existingRecord = await base44.asServiceRole.entities[entityName].get(recordId);
    } catch {
      return Response.json(
        { error: 'Registro não encontrado', errorCategory: 'permission' },
        { status: 404 }
      );
    }
    if (!existingRecord) {
      return Response.json(
        { error: 'Registro não encontrado', errorCategory: 'permission' },
        { status: 404 }
      );
    }

    const tenantCheck = await verifyTenantAccess(base44, user, entityName, existingRecord);
    if (!tenantCheck.allowed) {
      return Response.json(
        { error: tenantCheck.reason, errorCategory: 'permission' },
        { status: tenantCheck.status || 403 }
      );
    }

    if (action === 'approve') {
      if (!canApprove(user) || (level === 'cliente_supervisor' && !tenantCheck.isSupervisor)) {
        return Response.json(
          { error: 'Sem permissão para aprovar registros nesta regional', errorCategory: 'permission' },
          { status: 403 }
        );
      }

      // ── HASH DE INTEGRIDADE ─────────────────────────────────────────
      // Calcula SHA-256 do conteúdo do registro no momento da aprovação.
      // Permite detectar alterações posteriores à assinatura.
      // Campos administrativos (status, approved, etc.) são excluídos.
      const integrityHash = await computeIntegrityHash(existingRecord);

      updateData.approved = true;
      updateData.approved_by = user.email;
      updateData.approved_date = now;
      updateData.approver_details = {
        name: approverName,
        position: level,
        crea_number: user.crea_number || '',
        integrity_hash: integrityHash,
        integrity_hash_date: now,
      };
      updateData.rejection_reason = null;
    } else if (action === 'reject') {
      if (!canApprove(user) || (level === 'cliente_supervisor' && !tenantCheck.isSupervisor)) {
        return Response.json(
          { error: 'Sem permissão para reprovar registros nesta regional', errorCategory: 'permission' },
          { status: 403 }
        );
      }
      if (!rejectionReason || !rejectionReason.trim()) {
        return Response.json(
          { error: 'Motivo da reprovação é obrigatório', errorCategory: 'schema' },
          { status: 400 }
        );
      }
      updateData.approved = false;
      updateData.approved_by = user.email;
      updateData.approved_date = now;
      updateData.rejection_reason = rejectionReason;
      updateData.was_rejected = true;
      updateData.approver_details = {
        name: approverName,
        position: level,
        crea_number: user.crea_number || '',
      };
    } else if (action === 'sign') {
      // Assinatura do cliente — requiere nível cliente ou admin/gestor
      if (level !== 'cliente' && !canApprove(user)) {
        return Response.json(
          { error: 'Sem permissão para assinar registros', errorCategory: 'permission' },
          { status: 403 }
        );
      }
      // ── HASH DE INTEGRIDADE (assinatura) ──────────────────────────
      // Se o registro ainda não tem hash (não foi aprovado antes),
      // calcula e armazena em client_signature.integrity_hash.
      // Se já tem hash de aprovação, mantém — client_signature é excluído
      // do hash, então assinar não invalida o hash existente.
      const existingHash = existingRecord?.approver_details?.integrity_hash
        || existingRecord?.client_signature?.integrity_hash;
      const integrityHash = existingHash || await computeIntegrityHash(existingRecord);
      updateData.client_signature = {
        signed_by: user.email,
        signed_date: now,
        engineer_name: approverName,
        crea_number: user.crea_number || '',
        integrity_hash: integrityHash,
        integrity_hash_date: now,
      };
    } else if (action === 'approve_nc') {
      // Cliente aprova NC
      if (level !== 'cliente' && !canApprove(user)) {
        return Response.json(
          { error: 'Sem permissão para aprovar NC', errorCategory: 'permission' },
          { status: 403 }
        );
      }
      // ── HASH DE INTEGRIDADE (aprovação NC) ──────────────────────────
      // Mesma lógica do sign: reusa hash existente ou calcula novo.
      const existingNcHash = existingRecord?.approver_details?.integrity_hash
        || existingRecord?.client_signature?.integrity_hash;
      const ncIntegrityHash = existingNcHash || await computeIntegrityHash(existingRecord);
      updateData.pendente_aprovacao_cliente = false;
      updateData.cliente_aprovacao = 'aprovada';
      updateData.cliente_aprovacao_data = now;
      updateData.cliente_aprovacao_responsavel = user.email;
      updateData.client_signature = {
        signed_by: user.email,
        signed_date: now,
        engineer_name: approverName,
        crea_number: user.crea_number || '',
        integrity_hash: ncIntegrityHash,
        integrity_hash_date: now,
      };
    } else if (action === 'reject_nc') {
      if (level !== 'cliente' && !canApprove(user)) {
        return Response.json(
          { error: 'Sem permissão para reprovar NC', errorCategory: 'permission' },
          { status: 403 }
        );
      }
      if (!rejectionReason || !rejectionReason.trim()) {
        return Response.json(
          { error: 'Motivo da reprovação é obrigatório', errorCategory: 'schema' },
          { status: 400 }
        );
      }
      updateData.status = 'aberta';
      updateData.pendente_aprovacao_cliente = false;
      updateData.cliente_aprovacao = 'reprovada';
      updateData.cliente_aprovacao_data = now;
      updateData.cliente_aprovacao_responsavel = user.email;
      updateData.cliente_reprovacao_motivo = rejectionReason;
    } else if (action === 'solicitar_aprovacao_nc') {
      if (!canApprove(user)) {
        return Response.json(
          { error: 'Sem permissão para solicitar aprovação', errorCategory: 'permission' },
          { status: 403 }
        );
      }
      updateData.pendente_aprovacao_cliente = true;
      updateData.cliente_aprovacao = null;
      updateData.cliente_reprovacao_motivo = null;
    } else if (action === 'update_nc_status') {
      if (!canApprove(user)) {
        return Response.json(
          { error: 'Sem permissão para alterar status da NC', errorCategory: 'permission' },
          { status: 403 }
        );
      }
      const validStatuses = ['aberta', 'em_tratativa', 'encerrada', 'cancelada'];
      if (!validStatuses.includes(ncStatus)) {
        return Response.json(
          { error: 'Status inválido', errorCategory: 'schema' },
          { status: 400 }
        );
      }
      updateData.status = ncStatus;
      if (requestApproval) {
        updateData.pendente_aprovacao_cliente = true;
      }
    } else if (action === 'delete') {
      // Registro já foi buscado e tenant-validado acima.
      // Permissão de exclusão: criador OU approver-level (espelha RLS de delete).
      if (!canDelete(user, existingRecord, tenantCheck.isSupervisor)) {
        return Response.json(
          { error: 'Sem permissão para excluir este registro', errorCategory: 'permission' },
          { status: 403 }
        );
      }
      // ── AUDIT TRAIL (delete) ──────────────────────────────────────
      try {
        await createAuditEntry(base44, req, user, {
          entity_name: entityName,
          entity_id: recordId,
          operation: 'delete',
          changes: [],
        });
      } catch (auditError) {
        console.error('[gerenciarAprovacao] Audit error (delete):', auditError?.message);
      }

      await base44.asServiceRole.entities[entityName].delete(recordId);
      return Response.json({ success: true, data: { id: recordId, deleted: true } });
    } else {
      return Response.json(
        { error: 'Ação inválida', errorCategory: 'schema' },
        { status: 400 }
      );
    }

    // Normaliza campos legados de `fotos` que podem quebrar a validação do schema.
    // Reutiliza o registro já buscado (existingRecord) — sem nova chamada à API.
    const OBJECT_FOTOS_ENTITIES = new Set(['ChecklistTerraplanagem']);
    if (existingRecord?.fotos && Array.isArray(existingRecord.fotos)) {
      if (OBJECT_FOTOS_ENTITIES.has(entityName)) {
        const needsNorm = existingRecord.fotos.some((f) => typeof f === 'string');
        if (needsNorm) {
          updateData.fotos = existingRecord.fotos.map((f) =>
            typeof f === 'string' ? { url: f, legenda: '' } : f
          );
        }
      } else {
        const needsNorm = existingRecord.fotos.some((f) => typeof f !== 'string');
        if (needsNorm) {
          updateData.fotos = existingRecord.fotos
            .map((f) => (typeof f === 'string' ? f : (f?.url || '')))
            .filter(Boolean);
        }
      }
    }

    // Service role bypassa RLS — permissões já verificadas server-side acima
    const result = await base44.asServiceRole.entities[entityName].update(recordId, updateData);

    // ── AUDIT TRAIL ──────────────────────────────────────────────────
    // Registra diff campo-a-campo. Falhas de auditoria NÃO bloqueiam a operação.
    try {
      const diff = computeAuditDiff(existingRecord, result);
      if (diff.length > 0) {
        await createAuditEntry(base44, req, user, {
          entity_name: entityName,
          entity_id: recordId,
          operation: action,
          changes: diff,
        });
      }
    } catch (auditError) {
      console.error('[gerenciarAprovacao] Audit error:', auditError?.message);
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message, errorCategory: 'unknown' }, { status: 500 });
  }
});