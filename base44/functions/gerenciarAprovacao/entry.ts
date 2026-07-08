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

const APPROVER_LEVELS = ['admin', 'sala_tecnica_afirmaevias', 'gestor_contrato'];

function getUserAccessLevel(user) {
  if (!user) return 'user';
  return user.access_level || (user.role === 'admin' ? 'admin' : 'user');
}

function canApprove(user) {
  const level = getUserAccessLevel(user);
  return APPROVER_LEVELS.includes(level) || user.role === 'admin';
}

// Permissão de exclusão: criador do registro OU approver-level
// (espelha a RLS de delete das entidades)
function canDelete(user, record) {
  const level = getUserAccessLevel(user);
  if (APPROVER_LEVELS.includes(level) || user.role === 'admin') return true;
  // created_by (email, resolvido pelo RLS) ou created_by_id (ID do usuário)
  return record?.created_by === user.email || record?.created_by_id === user.id;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized', errorCategory: 'permission' }, { status: 401 });
    }

    const body = await req.json();
    const { action, entityName, recordId, rejectionReason, ncStatus, requestApproval } = body;

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

    if (action === 'approve') {
      if (!canApprove(user)) {
        return Response.json(
          { error: 'Sem permissão para aprovar registros', errorCategory: 'permission' },
          { status: 403 }
        );
      }
      updateData.approved = true;
      updateData.approved_by = user.email;
      updateData.approved_date = now;
      updateData.approver_details = {
        name: approverName,
        position: level,
        crea_number: user.crea_number || '',
      };
      updateData.rejection_reason = null;
    } else if (action === 'reject') {
      if (!canApprove(user)) {
        return Response.json(
          { error: 'Sem permissão para reprovar registros', errorCategory: 'permission' },
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
      updateData.client_signature = {
        signed_by: user.email,
        signed_date: now,
        engineer_name: approverName,
        crea_number: user.crea_number || '',
      };
    } else if (action === 'approve_nc') {
      // Cliente aprova NC
      if (level !== 'cliente' && !canApprove(user)) {
        return Response.json(
          { error: 'Sem permissão para aprovar NC', errorCategory: 'permission' },
          { status: 403 }
        );
      }
      updateData.pendente_aprovacao_cliente = false;
      updateData.cliente_aprovacao = 'aprovada';
      updateData.cliente_aprovacao_data = now;
      updateData.cliente_aprovacao_responsavel = user.email;
      updateData.client_signature = {
        signed_by: user.email,
        signed_date: now,
        engineer_name: approverName,
        crea_number: user.crea_number || '',
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
      // Busca o registro para verificar autoria (asServiceRole bypassa RLS)
      let record;
      try {
        record = await base44.asServiceRole.entities[entityName].get(recordId);
      } catch {
        return Response.json(
          { error: 'Registro não encontrado', errorCategory: 'permission' },
          { status: 404 }
        );
      }
      if (!record) {
        return Response.json(
          { error: 'Registro não encontrado', errorCategory: 'permission' },
          { status: 404 }
        );
      }
      // Permissão: criador OU approver-level
      if (!canDelete(user, record)) {
        return Response.json(
          { error: 'Sem permissão para excluir este registro', errorCategory: 'permission' },
          { status: 403 }
        );
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
    // ChecklistTerraplanagem usa {url, legenda}[] — registros antigos podem ter strings.
    // Demais entidades usam string[] — registros podem ter objetos por erro de migração.
    const OBJECT_FOTOS_ENTITIES = new Set(['ChecklistTerraplanagem']);
    try {
      const existing = await base44.asServiceRole.entities[entityName].get(recordId);
      if (existing?.fotos && Array.isArray(existing.fotos)) {
        if (OBJECT_FOTOS_ENTITIES.has(entityName)) {
          // Entidade espera {url, legenda}[] — normaliza strings → objetos
          const needsNorm = existing.fotos.some((f) => typeof f === 'string');
          if (needsNorm) {
            updateData.fotos = existing.fotos.map((f) =>
              typeof f === 'string' ? { url: f, legenda: '' } : f
            );
          }
        } else {
          // Entidade espera string[] — normaliza objetos → strings
          const needsNorm = existing.fotos.some((f) => typeof f !== 'string');
          if (needsNorm) {
            updateData.fotos = existing.fotos
              .map((f) => (typeof f === 'string' ? f : (f?.url || '')))
              .filter(Boolean);
          }
        }
      }
    } catch {
      // Se não conseguir buscar, segue com updateData apenas (comportamento original)
    }

    // Service role bypassa RLS — permissões já verificadas server-side acima
    const result = await base44.asServiceRole.entities[entityName].update(recordId, updateData);
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message, errorCategory: 'unknown' }, { status: 500 });
  }
});