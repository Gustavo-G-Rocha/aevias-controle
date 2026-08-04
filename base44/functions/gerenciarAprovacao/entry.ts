import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import {
  getUserAccessLevel,
  getEffectiveAccessLevel,
  canApprove,
  computeIntegrityHash,
  computeAuditDiff,
  createAuditEntry,
  getWithRetry,
} from '../../shared/backendCommon.ts';
import { verifyTenantAccess } from '../../shared/tenantAccess.ts';
import { marcarNotificacoesLidas } from '../../shared/notificacoes.ts';

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
  'EnsaioTaxaInsumos',
  'EnsaioVigaBenkelman',
  'AcompanhamentoCarga',
  'AcompanhamentoUsinagem',
  'ControleExecucaoServicos',
  'RegistroFresagemCBUQ',
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

function canDelete(user, record, isSupervisor) {
  // admin: pode excluir qualquer registro
  if (getUserAccessLevel(user) === 'admin') return true;

  // laboratorista: apenas registros que criou
  if (record.created_by === user.email || record.created_by_id === user.id) return true;

  // cliente_supervisor: só pode excluir se for supervisor nesta regional
  const level = getUserAccessLevel(user);
  if (level === 'cliente_supervisor') return Boolean(isSupervisor);

  // approver-level (sala_tecnica, gestor_contrato): podem excluir registros do seu tenant
  return canApprove(user);
}

// ── SANITIZAÇÃO XSS — defense-in-depth (importado de backendCommon.ts via sanitizeText) ──
// rejectionReason é texto livre do usuário — sanitiza antes de persistir.
import { sanitizeText } from '../../shared/backendCommon.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized', errorCategory: 'permission' }, { status: 401 });
    }

    const body = await req.json();
    const { action, entityName, recordId, rejectionReason: rawRejectionReason, ncStatus, requestApproval } = body;

    // ── SANITIZAÇÃO XSS ──
    const rejectionReason = rawRejectionReason ? sanitizeText(rawRejectionReason) : rawRejectionReason;

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

    // ── ADAPTER PATTERN: SignatureAdapter ──────────────────────────────
    // Ações de assinatura são delegadas para o adapter de assinatura
    // eletrônica. Hoje: EletronicaSimplesAdapter (assinarEletronicamente).
    // Futuro: PAdESAdapter pode ser adicionado como novo adapter (nova
    // backend function), trocando apenas a chamada abaixo — o restante
    // do fluxo de aprovação permanece inalterado.
    //
    // Por ora, apenas 'approve' (relatório final de ensaio) usa o adapter.
    // 'sign' e 'approve_nc' (termo de fechamento de NC) serão migrados em
    // etapa futura, quando os componentes de UI de NC passarem a exigir
    // reautenticação no momento do ato.
    const SIGNING_ACTIONS = new Set(['approve']);
    if (SIGNING_ACTIONS.has(action)) {
      try {
        const signResult = await base44.functions.invoke('assinarEletronicamente', {
          entityName,
          recordId,
          signatureType: action,
          geolocation: body.geolocation || null,
          totpCode: body.totpCode || null,
        });
        // base44.functions.invoke retorna o envelope HTTP completo (com request/response
        // que têm referências circulares). Extrai apenas o body JSON serializável.
        const signData = signResult?.data ?? signResult;
        return Response.json(signData);
      } catch (signError: any) {
        // Extrai o corpo do erro de assinarEletronicamente que pode estar
        // em diferentes níveis do erro lançado pelo SDK (response.data,
        // data, ou apenas message). Preserva errorCategory para que o
        // frontend possa distinguir erros transitórios de permissão.
        const rawErr = signError?.response?.data || signError?.data || null;
        const errData = rawErr || { error: signError?.message || 'Erro na assinatura eletrônica' };
        const errStatus = signError?.response?.status || signError?.status || (rawErr ? 500 : 500);
        return Response.json(errData, { status: errStatus });
      }
    }

    const now = new Date().toISOString();
    const level = getUserAccessLevel(user);
    const approverName = user.laboratorista_name || user.full_name || '';
    const updateData: Record<string, unknown> = {};

    // ── DEFENSE-IN-DEPTH: buscar registro e validar tenant ────────────
    // Busca o registro uma vez (asServiceRole bypassa RLS) e valida o
    // direito do usuário sobre ele ANTES de qualquer mutação.
    // O registro é reutilizado na normalização de fotos mais abaixo.
    const fetched = await getWithRetry(() => base44.asServiceRole.entities[entityName].get(recordId));
    if (fetched.transient) {
      return Response.json(
        { error: 'Falha temporária ao acessar o registro. Tente novamente.', errorCategory: 'network' },
        { status: 503 }
      );
    }
    if (fetched.notFound) {
      return Response.json(
        { error: 'Registro não encontrado. Ele pode ter sido excluído — recarregue a lista.', errorCategory: 'permission' },
        { status: 404 }
      );
    }
    const existingRecord = fetched.record;

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

    // ── DEFENSE-IN-DEPTH: field whitelist ──────────────────────────────
    // updateData é construído server-side, mas este check explícito garante
    // que apenas campos de aprovação/assinatura sejam persistidos — nenhum
    // campo arbitrário (ex: 'role', 'email', 'created_by') pode chegar ao
    // asServiceRole.update(). Isto previne escalação de privilégios mesmo se
    // a lógica de construção do updateData for estendida no futuro.
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

    // asServiceRole é necessário pois o RLS update das entidades só permite
    // created_by ou admin — approvers (sala_tecnica, gestor_contrato,
    // cliente_supervisor) não podem atualizar via base44.entities.
    // A autorização é enforceada server-side por:
    //   1. ALLOWED_ENTITIES whitelist (entityName validado)
    //   2. verifyTenantAccess (registro → obra → regional → email do usuário)
    //   3. canApprove / canDelete (nível de acesso + per-regional para supervisor)
    //   4. ALLOWED_UPDATE_FIELDS (nenhum campo fora do whitelist é persistido)
    const result = await base44.asServiceRole.entities[entityName].update(recordId, updateData);

    // ── NOTIFICAÇÃO DE REPROVAÇÃO ────────────────────────────────────
    // Cria um alerta para o criador do registro quando ele é reprovado.
    // Falhas de notificação NÃO bloqueiam a operação.
    if ((action === 'reject' || action === 'reject_nc') && existingRecord.created_by && existingRecord.created_by !== user.email) {
      try {
        await base44.asServiceRole.entities.Notificacao.create({
          user_email: existingRecord.created_by,
          entity_name: entityName,
          entity_id: recordId,
          tipo: 'reprovacao',
          message: rejectionReason || '',
          status: 'pendente',
        });
      } catch (notifError) {
        console.error('[gerenciarAprovacao] Notificação error:', notifError?.message);
      }
    }

    // ── LIMPAR NOTIFICAÇÕES DE ASSINATURA PENDENTE ──────────────────
    // Quando o documento é assinado, as notificações "aguarda assinatura"
    // deixam de fazer sentido para todos os destinatários.
    if (action === 'sign' || action === 'approve_nc') {
      await marcarNotificacoesLidas(base44, entityName, recordId, 'assinatura_pendente');
    }

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