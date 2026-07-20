import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * Backend function: verificarAssinatura
 *
 * Endpoint público para verificação de assinatura eletrônica via QR code.
 * Compara o hash SHA-256 do documento atual com o hash armazenado no
 * momento da assinatura (em AssinaturaEletronica). Não requer autenticação
 * — usa service role para leitura, permitindo verificação por terceiros
 * (clientes, auditores) que escanearam o QR code do PDF impresso.
 *
 * Se o hash bater: retorna "íntegro" + metadados da assinatura.
 * Se o hash divergir: retorna aviso explícito de divergência.
 * Se não houver assinatura: retorna "não assinado".
 *
 * Payload (POST): { entityName, recordId }
 * Ou GET: ?entityName=X&recordId=Y
 * Retorna: { signed, intact, storedHash?, computedHash?, signature? }
 */

// ── INTEGRITY HASH (espelha assinarEletronicamente.ts) ──
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

// ── ALLOWED ENTITIES (espelha assinarEletronicamente.ts) ──
const ALLOWED_ENTITIES = new Set([
  'EnsaioCAUQ', 'EnsaioMRAF', 'EnsaioDensidade', 'EnsaioDensidadeInSitu',
  'EnsaioGranulometriaIndividual', 'EnsaioManchaPendulo', 'EnsaioProctor',
  'EnsaioRompimentoConcreto', 'EnsaioSondagem', 'EnsaioTaxaMRAF',
  'EnsaioTaxaPinturaImprimacao', 'EnsaioVigaBenkelman',
  'AcompanhamentoCarga', 'AcompanhamentoUsinagem', 'ControleExecucaoServicos',
  'BoletimSondagem', 'BoletimSondagemTrado', 'GranuMistura',
  'CertificacaoUsina', 'ChecklistUsina', 'ChecklistAplicacao',
  'ChecklistMRAF', 'ChecklistConcretagem', 'ChecklistTerraplanagem',
  'ChecklistReciclagem', 'DiarioObra', 'RelatorioNC',
]);

const VALID_ID_REGEX = /^[a-zA-Z0-9\-_]{1,128}$/;

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);

    // Aceita POST (body JSON) ou GET (query params)
    let entityName: string;
    let recordId: string;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      entityName = url.searchParams.get('entityName') || '';
      recordId = url.searchParams.get('recordId') || '';
    } else {
      const body = await req.json();
      entityName = body.entityName || '';
      recordId = body.recordId || '';
    }

    // ── VALIDAÇÃO ──
    if (!entityName || !ALLOWED_ENTITIES.has(entityName)) {
      return Response.json(
        { signed: false, intact: null, error: 'Entidade inválida ou não suportada' },
        { status: 400 }
      );
    }

    if (!recordId || !VALID_ID_REGEX.test(recordId)) {
      return Response.json(
        { signed: false, intact: null, error: 'ID inválido' },
        { status: 400 }
      );
    }

    // ── BUSCAR REGISTRO (asServiceRole — bypassa RLS para verificação pública) ──
    let record: any;
    try {
      record = await base44.asServiceRole.entities[entityName].get(recordId);
    } catch {
      return Response.json(
        { signed: false, intact: null, error: 'Registro não encontrado' },
        { status: 404 }
      );
    }

    if (!record) {
      return Response.json(
        { signed: false, intact: null, error: 'Registro não encontrado' },
        { status: 404 }
      );
    }

    // ── BUSCAR ASSINATURA ELETRÔNICA ──
    let signatures: any[] = [];
    try {
      signatures = await base44.asServiceRole.entities.AssinaturaEletronica.filter(
        { entity_name: entityName, entity_id: recordId, status_assinatura: 'assinado' },
        '-signed_at',
        1
      );
    } catch {
      // Entidade pode não existir ainda durante migração
    }

    if (!signatures || signatures.length === 0) {
      return Response.json({
        signed: false,
        intact: null,
        message: 'Documento não possui assinatura eletrônica',
      });
    }

    const signature = signatures[0];
    const storedHash = signature.signature_hash;
    const computedHash = await computeIntegrityHash(record);
    const intact = storedHash === computedHash;

    return Response.json({
      signed: true,
      intact,
      storedHash,
      computedHash,
      signature: {
        signed_by: signature.signed_by || '',
        signed_by_name: signature.signed_by_name || '',
        signed_by_role: signature.signed_by_role || '',
        signed_by_crea: signature.signed_by_crea || '',
        signed_at: signature.signed_at || '',
        signature_method: signature.signature_method || 'eletronica_simples_reforcada',
        signature_type: signature.signature_type || '',
        signature_hash: signature.signature_hash || '',
      },
    });
  } catch (error: any) {
    return Response.json(
      { signed: false, intact: null, error: error.message },
      { status: 500 }
    );
  }
});