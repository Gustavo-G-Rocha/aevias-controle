/**
 * auditTrail.js
 *
 * Utilitários compartilhados para Audit Trail (versionamento de registros).
 *
 * ## Formato do Audit Trail
 *
 * Cada mutação relevante de um registro gera uma entrada na entidade AuditTrail:
 *   - entity_name: nome da entidade auditada
 *   - entity_id: ID do registro
 *   - operation: create | update | delete | approve | reject | sign | ...
 *   - changes: array de { field, old_value, new_value }
 *   - changed_by: email do usuário
 *   - changed_by_name: nome do usuário
 *   - client_timestamp: timestamp do cliente (para edições offline)
 *   - is_offline_sync: se veio de sincronização offline
 *
 * ## Pontos de escrita instrumentados
 *
 * 1. validarESalvarRegistro (entry.ts) — create/update de registros
 * 2. gerenciarAprovacao (entry.ts) — approve/reject/sign/delete
 *
 * Ambos calculam o diff campo-a-campo antes de persistir, garantindo
 * que o histórico registre valor_anterior e valor_novo.
 *
 * ## Performance
 *
 * O diff é computado via JSON.stringify (O(n) em nº de campos), não em
 * profundidade de aninhamento. Falhas de auditoria NÃO bloqueiam a
 * operação principal (try/catch nos entry points).
 */

const AUDIT_SYSTEM_FIELDS = new Set([
  'id', 'created_date', 'updated_date', 'created_by_id', 'created_by', 'is_sample',
]);

/**
 * Computa diff campo-a-campo entre dois estados de um registro.
 * Retorna array de { field, old_value, new_value } apenas para campos que mudaram.
 *
 * @param {object|null} oldData - estado anterior
 * @param {object|null} newData - estado posterior
 * @returns {Array<{field: string, old_value: any, new_value: any}>}
 */
export function computeAuditDiff(oldData, newData) {
  const changes = [];
  if (!oldData || !newData) return changes;

  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  for (const key of allKeys) {
    if (AUDIT_SYSTEM_FIELDS.has(key)) continue;

    const oldVal = oldData[key];
    const newVal = newData[key];

    // Pular null→null / undefined→undefined
    if (oldVal == null && newVal == null) continue;

    // Comparação profunda via JSON (cobre objetos, arrays, primitivos)
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, old_value: oldVal, new_value: newVal });
    }
  }
  return changes;
}

/**
 * Reconstrói o histórico de um registro a partir de suas entradas de auditoria.
 * Retorna as entradas ordenadas cronologicamente (mais antiga primeiro).
 *
 * @param {Array} auditEntries - entradas de AuditTrail (qualquer ordem)
 * @returns {Array} entradas ordenadas por created_date asc
 */
export function reconstructHistory(auditEntries) {
  if (!Array.isArray(auditEntries)) return [];
  return [...auditEntries].sort((a, b) => {
    const timeA = new Date(a.created_date || a.client_timestamp || 0).getTime();
    const timeB = new Date(b.created_date || b.client_timestamp || 0).getTime();
    return timeA - timeB;
  });
}

/**
 * Extrai todos os campos que foram alterados em qualquer ponto do histórico.
 * Útil para responder "este campo já foi modificado?".
 *
 * @param {Array} auditEntries - entradas ordenadas ou não
 * @returns {Set<string>} conjunto de nomes de campos alterados
 */
export function getChangedFields(auditEntries) {
  const fields = new Set();
  for (const entry of auditEntries || []) {
    for (const change of entry.changes || []) {
      fields.add(change.field);
    }
  }
  return fields;
}

/**
 * Reconstrói o valor de um campo específico ao longo do tempo.
 * Retorna array de { timestamp, value, operation, changed_by } em ordem cronológica.
 *
 * @param {Array} auditEntries - entradas de auditoria
 * @param {string} fieldName - nome do campo a rastrear
 * @returns {Array<{timestamp: string, value: any, operation: string, changed_by: string}>}
 */
export function getFieldHistory(auditEntries, fieldName) {
  const ordered = reconstructHistory(auditEntries);
  const history = [];
  for (const entry of ordered) {
    const change = (entry.changes || []).find((c) => c.field === fieldName);
    if (change) {
      history.push({
        timestamp: entry.created_date,
        value: change.new_value,
        oldValue: change.old_value,
        operation: entry.operation,
        changed_by: entry.changed_by,
      });
    }
  }
  return history;
}