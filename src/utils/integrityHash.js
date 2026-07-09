/**
 * integrityHash.js — Hash de Integridade para Registros Assinados
 *
 * Calcula um hash SHA-256 determinístico do conteúdo relevante de um
 * registro no momento da aprovação. Permite detectar alterações
 * posteriores à assinatura, garantindo a integridade legal/técnica
 * do documento assinado.
 *
 * DEFENSE-IN-DEPTH: Esta camada não substitui o RLS nem a validação
 * de tenant — complementa-as. Mesmo que um atacante bypassse o RLS
 * e alterasse um campo do registro, a divergência de hash seria
 * detectada ao exibir/exportar o registro assinado.
 *
 * EXCLUDED_FIELDS: campos administrativos que mudam legitimamente
 * após a assinatura (status, approved, approver_details,
 * client_signature, etc.) NÃO entram no hash.
 */

// ── Campos excluídos do hash ──────────────────────────────────────────
// Estes campos mudam legitimamente após a assinatura e não devem
// invalidar o hash.
const EXCLUDED_FIELDS = new Set([
  // Built-in metadata (sempre presentes, nunca no hash)
  'id',
  'created_date',
  'updated_date',
  'created_by_id',

  // Workflow status
  'status',

  // Approval / signature metadata
  'approved',
  'approved_by',
  'approved_date',
  'approver_details',
  'rejection_reason',
  'was_rejected',
  'client_signature',

  // Integrity hash fields (auto-referência)
  'integrity_hash',
  'integrity_hash_date',

  // NC client approval workflow (RelatorioNC)
  'pendente_aprovacao_cliente',
  'cliente_aprovacao',
  'cliente_aprovacao_data',
  'cliente_aprovacao_responsavel',
  'cliente_reprovacao_motivo',

  // Manager signature (RelatorioNC)
  'manager_signature',
]);

/**
 * Serialização determinística para o hash.
 * - Ordena chaves de objeto alfabeticamente.
 * - Remove campos excluídos.
 * - Lida com nested objects e arrays.
 * - Converte undefined/null para string consistente.
 */
function serializeForHash(record) {
  if (record === null || record === undefined) return 'null';

  if (typeof record !== 'object') {
    return JSON.stringify(record);
  }

  if (Array.isArray(record)) {
    return '[' + record.map(serializeForHash).join(',') + ']';
  }

  const keys = Object.keys(record)
    .filter((k) => !EXCLUDED_FIELDS.has(k))
    .sort();

  const parts = keys.map((k) => {
    const val = record[k];
    return JSON.stringify(k) + ':' + serializeForHash(val);
  });

  return '{' + parts.join(',') + '}';
}

/**
 * Calcula o hash SHA-256 do conteúdo do registro.
 * Usa crypto.subtle (disponível em browser, Deno e Node 18+).
 * @param {object} record - O registro a ser hasheado
 * @returns {Promise<string>} Hash hex string (64 chars)
 */
export async function computeIntegrityHash(record) {
  const serialized = serializeForHash(record);

  // crypto.subtle está disponível em browser, Deno e Node 18+
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    // Fallback: hash simples não-criptográfico (apenas para ambientes
    // sem Web Crypto API — não deveria acontecer em produção)
    return simpleHash(serialized);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(serialized);
  const hashBuffer = await subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Extrai o hash armazenado de um registro.
 * Suporta hash em approver_details (aprovação gestor) e em
 * client_signature (assinatura do cliente / aprovação NC).
 * Retorna o primeiro hash encontrado.
 */
export function getStoredHash(record) {
  return record?.approver_details?.integrity_hash
    || record?.client_signature?.integrity_hash
    || null;
}

/**
 * Verifica a integridade de um registro assinado.
 * Compara o hash armazenado (em approver_details.integrity_hash ou
 * client_signature.integrity_hash) com o hash recalculado do conteúdo atual.
 *
 * @param {object} record - O registro a verificar
 * @returns {Promise<{hasHash: boolean, valid: boolean, storedHash?: string, computedHash?: string}>}
 */
export async function verifyIntegrity(record) {
  const storedHash = getStoredHash(record);

  if (!storedHash) {
    // Registro não assinado — nada a verificar
    return { hasHash: false, valid: true };
  }

  const computedHash = await computeIntegrityHash(record);

  return {
    hasHash: true,
    valid: storedHash === computedHash,
    storedHash,
    computedHash,
  };
}

/**
 * Verifica se um registro possui hash de integridade (foi assinado/aprovado).
 * Suporta hash em approver_details (aprovação) e client_signature (assinatura).
 */
export function hasIntegrityHash(record) {
  return !!(record?.approver_details?.integrity_hash || record?.client_signature?.integrity_hash);
}

// ── Fallback: hash simples (não-criptográfico) ─────────────────────────
// Apenas para ambientes sem Web Crypto API. Em produção, crypto.subtle
// deve estar sempre disponível (browser, Deno, Node 18+).
function simpleHash(str) {
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

export { EXCLUDED_FIELDS, serializeForHash };