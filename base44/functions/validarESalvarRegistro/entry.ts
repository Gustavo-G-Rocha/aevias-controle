import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import {
  getUserAccessLevel,
  getWithRetry,
  sanitizeTextFields,
  computeAuditDiff,
  AUDIT_SYSTEM_FIELDS,
  extractIpAddress,
  extractDeviceInfo,
  createAuditEntry,
  verifyTenantAccessForRecord,
  verifyObraTenantAccess,
} from '../../shared/backendCommon.ts';

/**
 * Backend function: validarESalvarRegistro
 *
 * Valida e persiste registros de checklists/ensaios/diários no server-side,
 * espelhando as regras de checklistValidation.js e ensaioValidation.js.
 * Impede bypass de validação via chamada direta à API.
 *
 * Payload: { entityName, data, operation: 'create'|'update', recordId? }
 * Retorna:  { success: true, data: <record> } | { error: <message> }
 */

const ALLOWED_ENTITIES = [
  // Checklists
  'CertificacaoUsina',
  'ChecklistUsina',
  'ChecklistAplicacao',
  'ChecklistMRAF',
  'ChecklistConcretagem',
  'ChecklistTerraplanagem',
  'ChecklistReciclagem',
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
  // Diário
  'DiarioObra',
];

/**
 * Valida o registro conforme as regras de negócio (espelha client-side).
 * @returns {{ valid: boolean, message?: string }}
 */
function validateRecord(entityName, data) {
  // Rascunho mínimo: obra_id sempre obrigatório
  if (!data.obra_id) {
    return { valid: false, message: 'Por favor, selecione uma obra.' };
  }

  // Validações específicas por entidade quando finalizado
  const isFinalizado = data.status === 'finalizado';

  if (isFinalizado) {
    // ChecklistUsina — regras de checklistValidation.js
    if (entityName === 'ChecklistUsina') {
      const requiredFields = {
        project_id: 'Projeto',
        usina: 'Usina',
        pedreira: 'Pedreira',
        faixa_especificada: 'Faixa especificada',
        ligante: 'Ligante asfáltico',
      };
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!data[field]) {
          return { valid: false, message: `Por favor, preencha ${label}.` };
        }
      }
    }

    // EnsaioGranulometriaIndividual — regras de ensaioValidation.js
    if (entityName === 'EnsaioGranulometriaIndividual') {
      if (!data.tipo_material) {
        return { valid: false, message: 'Por favor, selecione o tipo de material.' };
      }
      if (!data.data_ensaio) {
        return { valid: false, message: 'Por favor, informe a data do ensaio.' };
      }
    }

    // EnsaioCAUQ — regras de ensaioValidation.js
    if (entityName === 'EnsaioCAUQ') {
      if (!data.data_ensaio) {
        return { valid: false, message: 'Por favor, informe a data do ensaio.' };
      }
    }

    // Entidades com data_ensaio ou data no schema required
    const dateField = data.data_ensaio || data.data || data.data_vistoria;
    if (!dateField) {
      return { valid: false, message: 'Por favor, informe a data do registro.' };
    }
  }

  return { valid: true };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized', errorCategory: 'permission' }, { status: 401 });
    }

    const body = await req.json();
    const { entityName, data, operation, recordId, client_updated_at, force_overwrite, base_updated_date } = body;

    // Whitelist de entidades permitidas
    if (!ALLOWED_ENTITIES.includes(entityName)) {
      return Response.json(
        { error: `Entidade não suportada: ${entityName}`, errorCategory: 'schema' },
        { status: 400 }
      );
    }

    if (operation !== 'create' && operation !== 'update') {
      return Response.json(
        { error: 'Operação inválida. Use "create" ou "update".', errorCategory: 'schema' },
        { status: 400 }
      );
    }

    if (operation === 'update' && !recordId) {
      return Response.json(
        { error: 'recordId é obrigatório para operação de update.', errorCategory: 'schema' },
        { status: 400 }
      );
    }

    // Validação server-side (espelha checklistValidation.js + ensaioValidation.js)
    const validation = validateRecord(entityName, data);
    if (!validation.valid) {
      return Response.json(
        { error: validation.message, validationError: true, errorCategory: 'schema' },
        { status: 400 }
      );
    }

    // Sanitização de texto — defense-in-depth contra XSS (importado de backendCommon.ts)
    const sanitizedData = sanitizeTextFields(data);

    // ── Buscar registro antigo (para audit + conflict detection + tenant) ──
    let oldRecord = null;
    if (operation === 'update') {
      const fetched = await getWithRetry(() => base44.asServiceRole.entities[entityName].get(recordId));
      if (fetched.transient) {
        return Response.json(
          { error: 'Falha temporária ao acessar o registro. Tente salvar novamente.', errorCategory: 'network' },
          { status: 503 }
        );
      }
      if (fetched.notFound) {
        // Diagnóstico: registra o id exato que o cliente enviou e não existe.
        console.error(`[validarESalvarRegistro] Registro não encontrado: ${entityName}/${recordId} (user: ${user.email})`);
        return Response.json(
          { error: `Registro não encontrado (${entityName} ${recordId}). Ele pode ter sido excluído — recarregue a lista.`, errorCategory: 'permission' },
          { status: 404 }
        );
      }
      oldRecord = fetched.record;
    }

    // ── DEFENSE-IN-DEPTH: validação funcional de tenant ───────────────
    const userLevel = getUserAccessLevel(user); // já normaliza cliente_supervisor→cliente, funcionarios_cliente→user
    const isTenantScoped = ['cliente', 'sala_tecnica_afirmaevias', 'gestor_contrato'].includes(userLevel);

    // Observação: a verificação de existência da obra para admin/user foi
    // removida. Ela duplicava a validação client-side e bloqueava salvamentos
    // legítimos quando o get(obra_id) no service role falhava de forma
    // transitória (retornando 404 sob carga), produzindo o falso erro
    // "Obra não encontrada". Para usuários scoped, o verifyObraTenantAccess
    // abaixo já valida a existência da obra e o pertencimento ao tenant —
    // preservando a defesa em profundidade onde há risco cross-tenant. Para
    // admin/user, a validação client-side (obra selecionada do dropdown
    // carregado via SDK) é a guarda primária.

    // ── DENORMALIZATION: obra_name / obra_code ──────────────────────────
    // Salva nome e código da obra no registro para que a lista e o relatório
    // continuem exibindo a obra mesmo se ela for posteriormente excluída.
    // Para tenant-scoped users, reutiliza a obra validada em verifyObraTenantAccess;
    // para admin/user, busca aqui (apenas para denormalização).
    let denormObra = null;

    if (isTenantScoped) {
      if (operation === 'update') {
        const tenantResult = await verifyTenantAccessForRecord(base44, user, oldRecord);
        if (!tenantResult.allowed) {
          return Response.json(
            { error: tenantResult.reason, errorCategory: 'permission' },
            { status: tenantResult.status || 403 }
          );
        }
      }

      // Para create e update: validar que o obra_id pertence ao tenant do usuário
      const obraId = sanitizedData.obra_id;
      if (obraId) {
        const obraResult = await verifyObraTenantAccess(base44, user, obraId);
        if (!obraResult.allowed) {
          return Response.json(
            { error: obraResult.reason, errorCategory: 'permission' },
            { status: obraResult.status || 403 }
          );
        }
        denormObra = obraResult.obra || null;
      }
    } else if (sanitizedData.obra_id) {
      // admin/user: buscar obra apenas para denormalização (sem validação tenant)
      const obraFetch = await getWithRetry(() => base44.asServiceRole.entities.Obra.get(sanitizedData.obra_id));
      denormObra = obraFetch.record || null;
    }

    if (denormObra) {
      sanitizedData.obra_name = denormObra.name;
      sanitizedData.obra_code = denormObra.code;
    }
    // Se a obra não existe mais, mantém os valores existentes em sanitizedData
    // (obra_name/obra_code podem ter sido enviados pelo cliente ou preservados
    // do registro antigo em um update).

    // ── CONFLICT DETECTION (LWW) ──────────────────────────────────────
    // Detecta conflitos quando o cliente está sincronizando uma edição
    // feita sobre uma versão desatualizada do registro.
    // Estratégia: Last-Write-Wins com notificação ao usuário.
    if (operation === 'update' && !force_overwrite) {
      const serverRecord = oldRecord;

      if (serverRecord) {
        // Check 1: base_updated_date mismatch (registro modificado após carregar formulário)
        if (base_updated_date && serverRecord.updated_date) {
          const baseTime = new Date(base_updated_date).getTime();
          const serverTime = new Date(serverRecord.updated_date).getTime();
          if (!isNaN(baseTime) && !isNaN(serverTime) && baseTime !== serverTime) {
            return Response.json({
              error: 'Conflito de sincronização: o registro foi modificado por outro usuário enquanto você editava.',
              conflict: true,
              serverData: serverRecord,
              clientUpdatedAt: client_updated_at,
              serverUpdatedDate: serverRecord.updated_date,
              errorCategory: 'conflict',
            }, { status: 409 });
          }
        }

        // Check 2: client_updated_at < server.updated_date (cliente salvou antes do servidor atualizar)
        if (client_updated_at && serverRecord.updated_date) {
          const clientTime = new Date(client_updated_at).getTime();
          const serverTime = new Date(serverRecord.updated_date).getTime();
          if (!isNaN(clientTime) && !isNaN(serverTime) && clientTime < serverTime) {
            return Response.json({
              error: 'Conflito de sincronização: o registro foi modificado por outro usuário após o seu salvamento.',
              conflict: true,
              serverData: serverRecord,
              clientUpdatedAt: client_updated_at,
              serverUpdatedDate: serverRecord.updated_date,
              errorCategory: 'conflict',
            }, { status: 409 });
          }
        }
      }
    }

    // ── SERVER-AUTHORITATIVE FIELDS ────────────────────────────────────
    // Campos de aprovação, assinatura e integridade são SEMPRE controlados
    // pelo servidor (via gerenciarAprovacao). O cliente nunca pode defini-los
    // ou sobrescrevê-los via este endpoint — mesmo em force_overwrite.
    // Isso impede que um atacante injete um integrity_hash forjado ou
    // sobrescreva o hash armazenado para mascarar uma adulteração.
    if (operation === 'update') {
      const SERVER_AUTH_FIELDS = [
        'approved', 'approved_by', 'approved_date', 'approver_details',
        'rejection_reason', 'was_rejected', 'client_signature', 'manager_signature',
        'integrity_hash', 'integrity_hash_date',
        'pendente_aprovacao_cliente', 'cliente_aprovacao', 'cliente_aprovacao_data',
        'cliente_aprovacao_responsavel', 'cliente_reprovacao_motivo',
      ];
      for (const field of SERVER_AUTH_FIELDS) {
        delete sanitizedData[field];
      }

      // ── RESET DE REPROVAÇÃO AO RE-FINALIZAR ───────────────────────────
      // Quando um registro reprovado (approved === false) é re-finalizado
      // pelo laboratorista (corrige e envia novamente), o servidor reset
      // approved → null automaticamente. Sem isso, approved=false persiste
      // e o registro fica preso em "Em Execução" no dashboard, pois o
      // grouper considera approved===false como "precisa correção".
      // Server-authoritative: o cliente não controla esse reset.
      if (oldRecord && oldRecord.approved === false && sanitizedData.status === 'finalizado') {
        sanitizedData.approved = null;
        sanitizedData.rejection_reason = null;
        sanitizedData.approved_by = null;
        sanitizedData.approved_date = null;
        sanitizedData.was_rejected = true;
      }
    }

    // Persistir (user-scoped — respeita RLS da entidade)
    let result;
    if (operation === 'create') {
      result = await base44.entities[entityName].create(sanitizedData);
    } else {
      result = await base44.entities[entityName].update(recordId, sanitizedData);
    }

    // ── AUDIT TRAIL ──────────────────────────────────────────────────
    // Registra diff campo-a-campo. Falhas de auditoria NÃO bloqueiam o salvamento.
    try {
      const isOfflineSync = !!client_updated_at;

      if (operation === 'create') {
        const newFields = Object.keys(result)
          .filter((k) => !AUDIT_SYSTEM_FIELDS.has(k))
          .map((k) => ({ field: k, old_value: null, new_value: result[k] }))
          .filter((c) => c.new_value != null);

        await createAuditEntry(base44, req, user, {
          entity_name: entityName,
          entity_id: result.id,
          operation: 'create',
          changes: newFields,
          client_timestamp: client_updated_at || null,
          is_offline_sync: isOfflineSync,
        });
      } else if (operation === 'update' && oldRecord) {
        const diff = computeAuditDiff(oldRecord, result);
        if (diff.length > 0) {
          await createAuditEntry(base44, req, user, {
            entity_name: entityName,
            entity_id: result.id,
            operation: 'update',
            changes: diff,
            client_timestamp: client_updated_at || null,
            is_offline_sync: isOfflineSync,
          });
        }
      }
    } catch (auditError) {
      console.error('[validarESalvarRegistro] Audit error:', auditError?.message);
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message, errorCategory: 'unknown' }, { status: 500 });
  }
});