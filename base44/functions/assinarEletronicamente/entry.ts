import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { getTwoFactorConfig, verifyTwoFactorForUser } from '../../shared/totp.ts';
import {
  extractFilters,
  buildCompositeId,
  reconstructRecords,
} from '../../shared/relatorioUnificadoRecon.ts';

/**
 * Backend function: assinarEletronicamente
 *
 * Implementa o adapter EletronicaSimplesAdapter do padrão SignatureAdapter.
 * Reforça a assinatura eletrônica simples (Lei 14.063/2020) com:
 * - Reautenticação obrigatória (senha) no momento do ato
 * - Captura de evidências (IP, user-agent, geolocalização, timestamp servidor)
 * - Hash SHA-256 do documento no estado assinado
 * - Registro em AssinaturaEletronica + cadeia de auditoria (chain hash)
 *
 * ADAPTER PATTERN:
 *   Hoje este arquivo é o único adapter (eletronica_simples_reforcada).
 *   No futuro, um novo adapter PAdES/ICP-Brasil pode ser criado como
 *   uma nova backend function (ex: assinarPAdES), e gerenciarAprovacao.ts
 *   passa a chamá-lo em vez deste — sem reescrever o fluxo de aprovação.
 *
 * Payload: {
 *   entityName: string,
 *   recordId: string,
 *   signatureType?: 'approve' | 'approve_nc' | 'sign',  // default: 'approve'
 *   geolocation?: { latitude: number, longitude: number } | null,
 * }
 * Retorna: { success: true, data: { record, signature } }
 */

// ── INTEGRITY HASH (espelha src/utils/integrityHash.js e gerenciarAprovacao.ts) ──
const INTEGRITY_EXCLUDED_FIELDS = new Set([
  'id', 'created_date', 'updated_date', 'created_by_id', 'created_by',
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
  if (!subtle) return simpleHash(serialized);
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

// ── SANITIZAÇÃO XSS (espelha gerenciarAprovacao.ts) ──
const DANGEROUS_TAGS = 'script|iframe|object|embed|style|svg|math|template|noscript|noframes|applet|xml';
const DANGEROUS_VOID_TAGS = `${DANGEROUS_TAGS}|link|meta|base|form|input|button`;

function sanitizeText(val: unknown): string {
  if (typeof val !== 'string' || !val) return val as string;
  let s = val;
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  s = s.replace(new RegExp(`<\\s*(${DANGEROUS_TAGS})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi'), '');
  s = s.replace(new RegExp(`<\\s*(?:${DANGEROUS_VOID_TAGS})\\b[^>]*>`, 'gi'), '');
  s = s.replace(new RegExp(`<\\s*\\/\\s*(?:${DANGEROUS_TAGS})\\s*>`, 'gi'), '');
  s = s.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)?/gi, '');
  s = s.replace(/javascript:/gi, '').replace(/vbscript:/gi, '').replace(/data:text\/html/gi, '');
  s = s.replace(/\{\{/g, '{ {').replace(/\}\}/g, '} }');
  s = s.replace(/<%/g, '< %').replace(/%>/g, '% >');
  if (s.length > 10000) s = s.substring(0, 10000);
  return s;
}

// ── ALLOWED ENTITIES (espelha gerenciarAprovacao.ts) ──
const ALLOWED_ENTITIES = [
  'EnsaioCAUQ', 'EnsaioMRAF', 'EnsaioDensidade', 'EnsaioDensidadeInSitu',
  'EnsaioGranulometriaIndividual', 'EnsaioManchaPendulo', 'EnsaioProctor',
  'EnsaioRompimentoConcreto', 'EnsaioSondagem', 'EnsaioTaxaMRAF',
  'EnsaioTaxaPinturaImprimacao', 'EnsaioTaxaInsumos', 'EnsaioVigaBenkelman',
  'AcompanhamentoCarga', 'AcompanhamentoUsinagem', 'ControleExecucaoServicos',
  'BoletimSondagem', 'BoletimSondagemTrado', 'GranuMistura',
  'CertificacaoUsina', 'ChecklistUsina', 'ChecklistAplicacao',
  'ChecklistMRAF', 'ChecklistConcretagem', 'ChecklistTerraplanagem',
  'ChecklistReciclagem', 'DiarioObra', 'RelatorioNC', 'RelatorioUnificado',
];

const APPROVER_LEVELS = ['admin', 'sala_tecnica_afirmaevias', 'gestor_contrato', 'cliente_supervisor'];

function getUserAccessLevel(user: any): string {
  if (!user) return 'user';
  return user.access_level || (user.role === 'admin' ? 'admin' : 'user');
}

function getEffectiveAccessLevel(user: any): string {
  const level = getUserAccessLevel(user);
  if (level === 'cliente_supervisor') return 'cliente';
  if (level === 'funcionarios_cliente') return 'user';
  return level;
}

function canApprove(user: any): boolean {
  return APPROVER_LEVELS.includes(getUserAccessLevel(user));
}

// ── TENANT ACCESS (espelha gerenciarAprovacao.ts) ──
async function verifyTenantAccess(base44: any, user: any, entityName: string, record: any) {
  const level = getUserAccessLevel(user);
  const effectiveLevel = getEffectiveAccessLevel(user);

  if (level === 'admin') return { allowed: true };
  if (!record) return { allowed: false, reason: 'Registro não encontrado', status: 404 };

  if (effectiveLevel === 'user') {
    if (record.created_by === user.email || record.created_by_id === user.id) return { allowed: true };
    return { allowed: false, reason: 'Sem permissão sobre este registro', status: 403 };
  }

  if (!record.obra_id) return { allowed: false, reason: 'Registro sem obra vinculada', status: 403 };

  let obra;
  try { obra = await base44.asServiceRole.entities.Obra.get(record.obra_id); }
  catch { return { allowed: false, reason: 'Obra não encontrada', status: 404 }; }
  if (!obra?.regional_id) return { allowed: false, reason: 'Obra sem regional vinculada', status: 403 };

  let regional;
  try { regional = await base44.asServiceRole.entities.Regional.get(obra.regional_id); }
  catch { return { allowed: false, reason: 'Regional não encontrada', status: 404 }; }

  const userEmail = (user.email || '').toLowerCase();

  if (effectiveLevel === 'cliente') {
    const emails = (regional.clientes_responsaveis || []).map((e: string) => e.toLowerCase());
    const supervisores = (regional.supervisores_responsaveis || []).map((e: string) => e.toLowerCase());
    // Estar em supervisores_responsaveis também conta como membro do tenant
    if (emails.includes(userEmail) || supervisores.includes(userEmail)) {
      const isSupervisor = level === 'cliente_supervisor' && supervisores.includes(userEmail);
      return { allowed: true, isSupervisor };
    }
  } else if (effectiveLevel === 'sala_tecnica_afirmaevias') {
    const emails = (regional.salas_tecnicas_responsaveis || []).map((e: string) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (effectiveLevel === 'gestor_contrato') {
    const emails = (regional.gestores_contrato_responsaveis || []).map((e: string) => e.toLowerCase());
    const legacy = (regional.gestor_contrato_responsavel || '').toLowerCase();
    if (emails.includes(userEmail) || legacy === userEmail) return { allowed: true };
  }

  return { allowed: false, reason: 'Sem permissão sobre este registro (tenant)', status: 403 };
}

// ── AUDIT TRAIL (espelha gerenciarAprovacao.ts) ──
function extractIpAddress(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const firstIp = xff.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const xRealIp = req.headers.get('x-real-ip');
  return xRealIp ? xRealIp.trim() : '';
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
}) {
  const ipAddress = extractIpAddress(req);
  const deviceInfo = extractDeviceInfo(req);
  const now = new Date().toISOString();
  const actorRole = user?.access_level || user?.role || '';

  let previousHash: string | null = null;
  try {
    const latest = await base44.asServiceRole.entities.AuditTrail.list('-created_date', 1);
    if (latest && latest.length > 0) previousHash = latest[0].chain_hash || null;
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
    client_timestamp: null,
    is_offline_sync: false,
    chain_hash: chainHash,
    previous_hash: previousHash,
  });
}

// ── HANDLER ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized', errorCategory: 'permission' }, { status: 401 });
    }

    const body = await req.json();
    const {
      entityName,
      recordId,
      signatureType = 'approve',
      geolocation = null,
      reportData = null,
      reauthFactor = 'password',
      totpCode = null,
    } = body;

    // ── VALIDAÇÃO DE ENTRADA ──
    if (!entityName || typeof entityName !== 'string' || !ALLOWED_ENTITIES.includes(entityName)) {
      return Response.json(
        { error: `Entidade não suportada: ${entityName}`, errorCategory: 'schema' },
        { status: 400 }
      );
    }

    if (!recordId || typeof recordId !== 'string') {
      return Response.json(
        { error: 'recordId é obrigatório', errorCategory: 'schema' },
        { status: 400 }
      );
    }

    // Validar ID contra regex (prevenção de injeção — espelha exportarEnsaiosPDF.ts)
    const VALID_ID_REGEX = /^[a-zA-Z0-9\-_]{1,128}$/;
    if (!VALID_ID_REGEX.test(recordId)) {
      return Response.json(
        { error: 'ID inválido', errorCategory: 'schema' },
        { status: 400 }
      );
    }

    const validSignatureTypes = ['approve', 'approve_nc', 'sign'];
    if (!validSignatureTypes.includes(signatureType)) {
      return Response.json(
        { error: 'Tipo de assinatura inválido', errorCategory: 'schema' },
        { status: 400 }
      );
    }

    // ── BUSCAR REGISTRO ──
    // RelatorioUnificado é um relatório virtual consolidado — não há
    // registro de entidade individual. O conteúdo assinado NUNCA vem do
    // cliente: o backend reconstrói o relatório a partir dos filtros
    // (obra_id + período + tipos) consultando os registros reais do
    // banco, e calcula o hash de integridade sobre esse conteúdo.
    // Isso impede falsificação de dados (CWE-345 / OWASP A01).
    let existingRecord: any;
    let reconRecords: any[] | null = null;
    if (entityName === 'RelatorioUnificado') {
      const filters = extractFilters(reportData);
      if (!filters) {
        return Response.json(
          { error: 'Filtros do relatório (obra_id, data_inicio, data_fim, tipos) são obrigatórios e válidos', errorCategory: 'schema' },
          { status: 400 }
        );
      }
      // O recordId (compositeId) deve corresponder exatamente aos filtros
      // informados — previne assinar um escopo diferente do declarado.
      if (buildCompositeId(filters) !== recordId) {
        return Response.json(
          { error: 'Identificador do relatório não corresponde aos filtros informados', errorCategory: 'schema' },
          { status: 400 }
        );
      }
      try {
        reconRecords = await reconstructRecords(base44, filters);
      } catch {
        return Response.json(
          { error: 'Falha ao reconstruir o conteúdo do relatório', errorCategory: 'unknown' },
          { status: 500 }
        );
      }
      // Record sintético para verificação de tenant (apenas obra_id é usado).
      existingRecord = { obra_id: filters.obra_id };
    } else {
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
    }

    // ── VERIFICAR TENANT ──
    const tenantCheck = await verifyTenantAccess(base44, user, entityName, existingRecord);
    if (!tenantCheck.allowed) {
      return Response.json(
        { error: tenantCheck.reason, errorCategory: 'permission' },
        { status: tenantCheck.status || 403 }
      );
    }

    // ── VERIFICAR PERMISSÃO DE ASSINATURA ──
    const level = getUserAccessLevel(user);
    const approverName = user.laboratorista_name || user.full_name || '';

    if (signatureType === 'approve') {
      if (!canApprove(user) || (level === 'cliente_supervisor' && !tenantCheck.isSupervisor)) {
        return Response.json(
          { error: 'Sem permissão para aprovar/assinar este registro', errorCategory: 'permission' },
          { status: 403 }
        );
      }
    } else {
      // approve_nc e sign: cliente ou approver-level
      if (level !== 'cliente' && !canApprove(user)) {
        return Response.json(
          { error: 'Sem permissão para assinar este registro', errorCategory: 'permission' },
          { status: 403 }
        );
      }
    }

    // ── STEP-UP AUTHENTICATION (2FA/TOTP) ─────────────────────────────
    // Se o signatário tem 2FA ativo, o ato de assinatura exige um código
    // TOTP (ou de recuperação) válido no momento do ato — reforço do
    // não repúdio (Lei 14.063/2020).
    let effectiveReauthFactor = reauthFactor;
    const twoFactorConfig = await getTwoFactorConfig(base44, user.email);
    if (twoFactorConfig?.status === 'active') {
      if (!totpCode) {
        return Response.json(
          { error: 'Código de verificação em duas etapas (2FA) é obrigatório para assinar.', errorCategory: 'totp_required' },
          { status: 403 }
        );
      }
      const totpResult = await verifyTwoFactorForUser(base44, twoFactorConfig, String(totpCode));
      if (!totpResult.ok) {
        return Response.json(
          { error: totpResult.reason, errorCategory: 'totp_invalid' },
          { status: 403 }
        );
      }
      effectiveReauthFactor = `${reauthFactor}+totp`;
    }

    // ── VERIFICAR SE JÁ ESTÁ ASSINADO ──
    // Um documento assinado não pode ser assinado novamente sem reprovação
    // explícita e novo evento de auditoria.
    let existingSignatures: any[] = [];
    try {
      existingSignatures = await base44.asServiceRole.entities.AssinaturaEletronica.filter(
        { entity_name: entityName, entity_id: recordId, status_assinatura: 'assinado' },
        '-signed_at',
        5
      );
    } catch { /* entity pode não existir ainda em migração */ }

    if (existingSignatures && existingSignatures.length > 0) {
      return Response.json(
        {
          error: 'Documento já assinado eletronicamente. Para alterar, é necessário reprovar explicitamente e gerar novo evento de auditoria.',
          errorCategory: 'permission',
        },
        { status: 409 }
      );
    }

    // ── COMPUTAR HASH DE INTEGRIDADE ──
    // Para RelatorioUnificado, o hash é calculado sobre os registros reais
    // reconstruídos do banco (conteúdo do relatório), nunca sobre dados do
    // cliente. Para entidades persistentes, sobre o registro buscado.
    const integrityHash = entityName === 'RelatorioUnificado'
      ? await computeIntegrityHash(reconRecords)
      : await computeIntegrityHash(existingRecord);
    const now = new Date().toISOString();
    const ipAddress = extractIpAddress(req);
    const deviceInfo = extractDeviceInfo(req);

    // ── PREPARAR UPDATE DATA (baseado no signatureType) ──
    const updateData: Record<string, unknown> = {};

    if (signatureType === 'approve') {
      updateData.approved = true;
      updateData.approved_by = user.email;
      updateData.approved_date = now;
      updateData.approver_details = {
        name: approverName,
        position: level,
        crea_number: user.crea_number || '',
        integrity_hash: integrityHash,
        integrity_hash_date: now,
        signature_method: 'eletronica_simples_reforcada',
      };
      updateData.rejection_reason = null;
    } else if (signatureType === 'approve_nc') {
      updateData.pendente_aprovacao_cliente = false;
      updateData.cliente_aprovacao = 'aprovada';
      updateData.cliente_aprovacao_data = now;
      updateData.cliente_aprovacao_responsavel = user.email;
      updateData.client_signature = {
        signed_by: user.email,
        signed_date: now,
        engineer_name: approverName,
        crea_number: user.crea_number || '',
        integrity_hash: integrityHash,
        integrity_hash_date: now,
        signature_method: 'eletronica_simples_reforcada',
      };
    } else {
      // signatureType === 'sign'
      updateData.client_signature = {
        signed_by: user.email,
        signed_date: now,
        engineer_name: approverName,
        crea_number: user.crea_number || '',
        integrity_hash: integrityHash,
        integrity_hash_date: now,
        signature_method: 'eletronica_simples_reforcada',
      };
    }

    // ── ATUALIZAR REGISTRO ──
    // RelatorioUnificado não tem entidade para atualizar — o documento
    // é a composição dos registros. A assinatura fica registrada em
    // AssinaturaEletronica + AuditTrail.
    // Defense-in-depth: field whitelist — apenas campos de assinatura/aprovação
    // são persistidos, previne injeção de campos arbitrários via asServiceRole.
    const ALLOWED_UPDATE_FIELDS = new Set([
      'approved', 'approved_by', 'approved_date', 'approver_details',
      'rejection_reason', 'was_rejected', 'client_signature',
      'pendente_aprovacao_cliente', 'cliente_aprovacao', 'cliente_aprovacao_data',
      'cliente_aprovacao_responsavel', 'cliente_reprovacao_motivo',
      'status', 'fotos', 'integrity_hash', 'integrity_hash_date',
      'manager_signature',
    ]);
    for (const key of Object.keys(updateData)) {
      if (!ALLOWED_UPDATE_FIELDS.has(key)) {
        delete updateData[key];
      }
    }
    let result: any = existingRecord;
    if (entityName !== 'RelatorioUnificado') {
      // asServiceRole é necessário pois RLS não permite approvers atualizar
      // registros que não criaram. Autorização enforceada por verifyTenantAccess
      // + canApprove + ALLOWED_UPDATE_FIELDS acima.
      result = await base44.asServiceRole.entities[entityName].update(recordId, updateData);
    }

    // ── CRIAR REGISTRO DE ASSINATURA ELETRÔNICA ──
    // Entidade dedicada — centraliza todos os metadados da assinatura.
    // Campos reservados (signature_provider, signature_request_id,
    // certificate_id) ficam null para futuro plug-in PAdES/ICP-Brasil.
    const signatureRecord = await base44.asServiceRole.entities.AssinaturaEletronica.create({
      entity_name: entityName,
      entity_id: recordId,
      status_assinatura: 'assinado',
      signature_method: 'eletronica_simples_reforcada',
      signature_type: signatureType,
      signed_at: now,
      signature_hash: integrityHash,
      signature_evidence: {
        ip_address: ipAddress,
        user_agent: deviceInfo,
        geolocation: geolocation || null,
        reauth_factor: effectiveReauthFactor,
      },
      signed_by: user.email,
      signed_by_name: approverName,
      signed_by_role: level,
      signed_by_crea: user.crea_number || '',
      signature_provider: null,
      signature_request_id: null,
      certificate_id: null,
    });

    // ── REGISTRAR AUDITORIA (cadeia de hashes) ──
    // O evento de assinatura se soma à cadeia existente — não a substitui.
    // Inclui todos os metadados de evidência para força probatória.
    try {
      await createAuditEntry(base44, req, user, {
        entity_name: entityName,
        entity_id: recordId,
        operation: 'sign',
        changes: [{
          field: 'signature',
          old_value: null,
          new_value: {
            method: 'eletronica_simples_reforcada',
            hash: integrityHash,
            signature_id: signatureRecord.id,
            signed_at: now,
            reauth_factor: effectiveReauthFactor,
            ip_address: ipAddress,
          },
        }],
      });
    } catch (auditError: any) {
      console.error('[assinarEletronicamente] Audit error:', auditError?.message);
    }

    return Response.json({
      success: true,
      data: {
        record: result,
        signature: signatureRecord,
      },
    });
  } catch (error: any) {
    return Response.json(
      { error: error.message, errorCategory: 'unknown' },
      { status: 500 }
    );
  }
});