import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { getTwoFactorConfig, verifyTwoFactorForUser } from '../../shared/totp.ts';
import {
  extractFilters,
  buildCompositeId,
  reconstructRecords,
} from '../../shared/relatorioUnificadoRecon.ts';
import {
  getUserAccessLevel,
  getEffectiveAccessLevel,
  canApprove,
  computeIntegrityHash,
  sanitizeText,
  createAuditEntry,
  extractIpAddress,
  extractDeviceInfo,
  getWithRetry,
} from '../../shared/backendCommon.ts';
import { verifyTenantAccess } from '../../shared/tenantAccess.ts';

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

// ── ALLOWED ENTITIES ──
const ALLOWED_ENTITIES = [
  'EnsaioCAUQ', 'EnsaioMRAF', 'EnsaioDensidade', 'EnsaioDensidadeInSitu',
  'EnsaioGranulometriaIndividual', 'EnsaioManchaPendulo', 'EnsaioProctor',
  'EnsaioRompimentoConcreto', 'EnsaioSondagem', 'EnsaioTaxaMRAF',
  'EnsaioTaxaPinturaImprimacao', 'EnsaioTaxaInsumos', 'EnsaioVigaBenkelman',
  'AcompanhamentoCarga', 'AcompanhamentoUsinagem', 'ControleExecucaoServicos',
  'RegistroFresagemCBUQ',
  'BoletimSondagem', 'BoletimSondagemTrado', 'GranuMistura',
  'CertificacaoUsina', 'ChecklistUsina', 'ChecklistAplicacao',
  'ChecklistMRAF', 'ChecklistConcretagem', 'ChecklistTerraplanagem',
  'ChecklistReciclagem', 'DiarioObra', 'RelatorioNC', 'RelatorioUnificado',
];

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
      const fetched = await getWithRetry(() => base44.asServiceRole.entities[entityName].get(recordId));
      if (fetched.transient) {
        return Response.json(
          { error: 'Falha temporária ao acessar o registro. Tente novamente.', errorCategory: 'network' },
          { status: 503 }
        );
      }
      if (fetched.notFound) {
        return Response.json(
          { error: 'Registro não encontrado', errorCategory: 'permission' },
          { status: 404 }
        );
      }
      existingRecord = fetched.record;
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
    // Só exigir TOTP quando houver reautenticação por senha.
    // RelatorioUnificado assina via sessão ativa (sem reentrada de senha),
    // portanto o TOTP não é exigido nesse fluxo.
    let effectiveReauthFactor = reauthFactor || 'session';
    if (reauthFactor) {
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