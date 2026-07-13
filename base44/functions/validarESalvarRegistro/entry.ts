import { createClientFromRequest } from 'npm:@base44/sdk@0.8.36';

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
  'EnsaioVigaBenkelman',
  'AcompanhamentoCarga',
  'AcompanhamentoUsinagem',
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

// ── DEFENSE-IN-DEPTH: validação funcional de tenant ──────────────────
// Funções inlinadas (não é possível compartilhar módulos entre functions).
// Espelham src/utils/tenantSecurity.js — testado em src/tests/security/.

function getUserAccessLevel(user) {
  if (!user) return 'user';
  const raw = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
  if (raw === 'cliente_supervisor') return 'cliente';
  if (raw === 'funcionarios_cliente') return 'user';
  return raw;
}

// Verifica direito do usuário sobre um registro existente (update).
async function verifyTenantAccessForRecord(base44, user, record) {
  const level = getUserAccessLevel(user);

  if (level === 'admin') return { allowed: true };

  if (level === 'user') {
    if (record.created_by === user.email || record.created_by_id === user.id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Sem permissão sobre este registro', status: 403 };
  }

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

  if (level === 'cliente') {
    const emails = (regional.clientes_responsaveis || []).map((e) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (level === 'sala_tecnica_afirmaevias') {
    const emails = (regional.salas_tecnicas_responsaveis || []).map((e) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (level === 'gestor_contrato') {
    const emails = (regional.gestores_contrato_responsaveis || []).map((e) => e.toLowerCase());
    const legacy = (regional.gestor_contrato_responsavel || '').toLowerCase();
    if (emails.includes(userEmail) || legacy === userEmail) return { allowed: true };
  }

  return { allowed: false, reason: 'Sem permissão sobre este registro (tenant)', status: 403 };
}

// Verifica direito do usuário sobre uma obra (create/update).
async function verifyObraTenantAccess(base44, user, obraId) {
  const level = getUserAccessLevel(user);

  if (level === 'admin' || level === 'user') {
    return { allowed: true };
  }

  let obra;
  try {
    obra = await base44.asServiceRole.entities.Obra.get(obraId);
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

  if (level === 'cliente') {
    const emails = (regional.clientes_responsaveis || []).map((e) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (level === 'sala_tecnica_afirmaevias') {
    const emails = (regional.salas_tecnicas_responsaveis || []).map((e) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (level === 'gestor_contrato') {
    const emails = (regional.gestores_contrato_responsaveis || []).map((e) => e.toLowerCase());
    const legacy = (regional.gestor_contrato_responsavel || '').toLowerCase();
    if (emails.includes(userEmail) || legacy === userEmail) return { allowed: true };
  }

  return { allowed: false, reason: 'Sem permissão sobre a obra (tenant)', status: 403 };
}

// ── AUDIT TRAIL: Diff computation ──────────────────────────────────────
// Campos gerenciados pelo plataforma — nunca aparecem no diff de auditoria.
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

    // Pular null→null / undefined→undefined
    if (oldVal == null && newVal == null) continue;

    // Comparação profura via JSON (cobre objetos, arrays, primitivos)
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, old_value: oldVal, new_value: newVal });
    }
  }
  return changes;
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

    // Sanitização de texto — defense-in-depth contra XSS (espelha src/utils/dataSanitization.js)
    // Política: texto puro, sem HTML. Tags perigosas removidas com conteúdo.
    // Event handlers, protocolos perigosos e sintaxe de template neutralizados.
    const DANGEROUS_TAGS = 'script|iframe|object|embed|style|svg|math|template|noscript|noframes|applet|xml';
    const DANGEROUS_VOID_TAGS = `${DANGEROUS_TAGS}|link|meta|base|form|input|button`;
    const sanitizeText = (val: unknown): unknown => {
      if (typeof val !== 'string' || !val) return val;
      let s = val;
      // 1. Remover caracteres de controle (exceto \t \n \r)
      s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      // 2. Remover blocos de tags perigosas com conteúdo
      s = s.replace(new RegExp(`<\\s*(${DANGEROUS_TAGS})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi'), '');
      // 3. Remover tags perigosas sem fechamento
      s = s.replace(new RegExp(`<\\s*(?:${DANGEROUS_VOID_TAGS})\\b[^>]*>`, 'gi'), '');
      s = s.replace(new RegExp(`<\\s*\\/\\s*(?:${DANGEROUS_TAGS})\\s*>`, 'gi'), '');
      // 4. Remover atributos de evento (onerror=, onclick=, onload=, etc.)
      s = s.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)?/gi, '');
      // 5. Remover protocolos perigosos
      s = s.replace(/javascript:/gi, '').replace(/vbscript:/gi, '').replace(/data:text\/html/gi, '');
      // 6. Neutralizar sintaxe de template engine (SSTI)
      s = s.replace(/\{\{/g, '{ {').replace(/\}\}/g, '} }');
      s = s.replace(/<%/g, '< %').replace(/%>/g, '% >');
      // 7. Limite de tamanho
      if (s.length > 10000) s = s.substring(0, 10000);
      return s;
    };
    const sanitizeTextFields = (obj: unknown): unknown => {
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
    };
    const sanitizedData = sanitizeTextFields(data);

    // ── Buscar registro antigo (para audit + conflict detection + tenant) ──
    let oldRecord = null;
    if (operation === 'update') {
      try {
        oldRecord = await base44.asServiceRole.entities[entityName].get(recordId);
      } catch {
        return Response.json(
          { error: 'Registro não encontrado', errorCategory: 'permission' },
          { status: 404 }
        );
      }
      if (!oldRecord) {
        return Response.json(
          { error: 'Registro não encontrado', errorCategory: 'permission' },
          { status: 404 }
        );
      }
    }

    // ── DEFENSE-IN-DEPTH: validação funcional de tenant ───────────────
    const userLevel = getUserAccessLevel(user); // já normaliza cliente_supervisor→cliente, funcionarios_cliente→user
    const isTenantScoped = ['cliente', 'sala_tecnica_afirmaevias', 'gestor_contrato'].includes(userLevel);

    // ── DEFENSE-IN-DEPTH: verificar existência da obra para TODOS os usuários ──
    // Previne registros órfãos: mesmo laboratoristas (user) não podem criar
    // registros vinculados a obras inexistentes.
    const obraIdForCheck = sanitizedData.obra_id;
    if (obraIdForCheck) {
      let obraExists = false;
      try {
        const obraCheck = await base44.asServiceRole.entities.Obra.get(obraIdForCheck);
        obraExists = !!obraCheck;
      } catch {
        obraExists = false;
      }
      if (!obraExists) {
        return Response.json(
          { error: 'Obra não encontrada. O registro não pode ser criado sem uma obra válida.', errorCategory: 'schema' },
          { status: 400 }
        );
      }
    }

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
      }
    }

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
      const changedByName = user.laboratorista_name || user.full_name || '';
      const isOfflineSync = !!client_updated_at;

      if (operation === 'create') {
        const newFields = Object.keys(result)
          .filter((k) => !AUDIT_SYSTEM_FIELDS.has(k))
          .map((k) => ({ field: k, old_value: null, new_value: result[k] }))
          .filter((c) => c.new_value != null);

        await base44.asServiceRole.entities.AuditTrail.create({
          entity_name: entityName,
          entity_id: result.id,
          operation: 'create',
          changes: newFields,
          changed_by: user.email,
          changed_by_name: changedByName,
          client_timestamp: client_updated_at || null,
          is_offline_sync: isOfflineSync,
        });
      } else if (operation === 'update' && oldRecord) {
        const diff = computeAuditDiff(oldRecord, result);
        if (diff.length > 0) {
          await base44.asServiceRole.entities.AuditTrail.create({
            entity_name: entityName,
            entity_id: result.id,
            operation: 'update',
            changes: diff,
            changed_by: user.email,
            changed_by_name: changedByName,
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