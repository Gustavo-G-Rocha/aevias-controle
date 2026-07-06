import { createClientFromRequest } from 'npm:@base44/sdk@0.8.35';

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
  'EnsaioGranMistura',
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { entityName, data, operation, recordId } = body;

    // Whitelist de entidades permitidas
    if (!ALLOWED_ENTITIES.includes(entityName)) {
      return Response.json(
        { error: `Entidade não suportada: ${entityName}` },
        { status: 400 }
      );
    }

    if (operation !== 'create' && operation !== 'update') {
      return Response.json(
        { error: 'Operação inválida. Use "create" ou "update".' },
        { status: 400 }
      );
    }

    if (operation === 'update' && !recordId) {
      return Response.json(
        { error: 'recordId é obrigatório para operação de update.' },
        { status: 400 }
      );
    }

    // Validação server-side (espelha checklistValidation.js + ensaioValidation.js)
    const validation = validateRecord(entityName, data);
    if (!validation.valid) {
      return Response.json(
        { error: validation.message, validationError: true },
        { status: 400 }
      );
    }

    // Sanitização de texto — remove tags HTML de todos os campos string (defense-in-depth contra XSS)
    const sanitizeText = (val: unknown): unknown => {
      if (typeof val !== 'string' || !val) return val;
      return val.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '');
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

    // Persistir (user-scoped — respeita RLS da entidade)
    let result;
    if (operation === 'create') {
      result = await base44.entities[entityName].create(sanitizedData);
    } else {
      result = await base44.entities[entityName].update(recordId, sanitizedData);
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});