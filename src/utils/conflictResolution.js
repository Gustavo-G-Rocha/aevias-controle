/**
 * conflictResolution.js
 *
 * Estratégia de resolução de conflitos para sincronização offline-first.
 *
 * ## Estratégia: Last-Write-Wins (LWW) com detecção e notificação
 *
 * Quando dois dispositivos editam o mesmo registro offline, a sincronização
 * detecta o conflito comparando:
 *   1. base_updated_date: timestamp do servidor quando o formulário foi carregado
 *   2. client_updated_at: timestamp de quando o usuário salvou offline
 * com o updated_date atual do servidor.
 *
 * Se o registro no servidor foi modificado após o carregamento do formulário
 * (base_updated_date !== server.updated_date), ou se o salvamento do cliente
 * é anterior à última atualização do servidor (client_updated_at < server.updated_date),
 * o conflito é sinalizado — NENHUM dado é sobrescrito silenciosamente.
 *
 * O usuário recebe uma notificação e pode escolher:
 *   - "Usar minha versão" → force-overwrite (campos de aprovação são preservados)
 *   - "Manter versão do servidor" → descarta as alterações locais
 *
 * ## Campos server-authoritative
 *
 * Campos de aprovação, assinatura e integridade são sempre controlados
 * pelo servidor via `gerenciarAprovacao`. Um update forçado pelo cliente
 * NUNCA sobrescreve esses campos — eles só mudam através do fluxo de
 * aprovação server-side.
 *
 * ## Campos sensíveis a conflito
 *
 * Dados numéricos de ensaio (densidades, umidades, ISC, CBR) são os
 * mais críticos — um conflito silencioso aqui pode invalidar resultados
 * técnicos. Estes campos exigem revisão manual do usuário.
 *
 * ## Plano de Rollback
 *
 * 1. Reverter `validarESalvarRegistro/entry.ts` ao estado anterior (remover
 *    bloco de conflict detection e force_overwrite).
 * 2. Reverter `syncService.js` para usar `base44.entities.*.create/update`
 *    diretamente em vez de `validarESalvarRegistro`.
 * 3. Reverter `offlineStorageService.js` para DB_VERSION=1 (ou manter v2
 *    com a store de conflitos vazia — não causa danos).
 * 4. Conflitos armazenados em IndexedDB podem ser limpos via `clearConflicts()`.
 * 5. Registros já sincronizados não são afetados — a estratégia só atua
 *    no momento da sincronização, não retroativamente.
 */

// Campos que são sempre controlados pelo servidor.
// Um update forçado pelo cliente nunca deve sobrescrever estes campos.
export const SERVER_AUTHORITATIVE_FIELDS = [
  'approved',
  'approved_by',
  'approved_date',
  'approver_details',
  'rejection_reason',
  'was_rejected',
  'client_signature',
  'manager_signature',
  'integrity_hash',
  'integrity_hash_date',
  'pendente_aprovacao_cliente',
  'cliente_aprovacao',
  'cliente_aprovacao_data',
  'cliente_aprovacao_responsavel',
  'cliente_reprovacao_motivo',
];

// Campos de dados mais sensíveis a conflito, agrupados por entidade.
// Usado para destacar campos críticos na revisão de conflitos.
export const SENSITIVE_FIELDS = {
  EnsaioCAUQ: ['corpos_prova_marshall', 'extracao_ligante', 'densidade_rice', 'teor_ligante_residual'],
  EnsaioMRAF: ['teor_ligante_residual', 'resultados_extracao'],
  EnsaioDensidade: ['pesos', 'densidade_maxima_teorica'],
  EnsaioDensidadeInSitu: ['furos', 'dados_proctor', 'densidade_areia'],
  EnsaioProctor: ['umidades', 'densidades', 'densidade_maxima_seca', 'umidade_otima', 'isc_cbr', 'expansao'],
  EnsaioVigaBenkelman: ['levantamentos', 'controle_estatistico'],
  EnsaioManchaPendulo: ['ensaios_mancha', 'ensaios_pendulo'],
  EnsaioGranulometriaIndividual: ['agregados', 'equivalente_areia'],
  EnsaioTaxaMRAF: ['ensaios'],
  EnsaioTaxaPinturaImprimacao: ['ensaios'],
  AcompanhamentoCarga: ['cargas'],
  AcompanhamentoUsinagem: ['cargas', 'agregados'],
  BoletimSondagem: ['camadas', 'densidades', 'umidade'],
  BoletimSondagemTrado: ['camadas', 'densidades', 'umidade'],
  ChecklistTerraplanagem: ['ensaios_empreiteira', 'acompanhamento_execucao'],
  ChecklistConcretagem: ['cargas_concreto'],
  ChecklistReciclagem: ['ensaios_empreiteira', 'acompanhamento_execucao'],
  DiarioObra: ['efetivo_maquinas', 'efetivo_colaboradores', 'nao_conformidades'],
};

const BUILT_IN_FIELDS = new Set([
  'id', 'created_date', 'updated_date', 'created_by_id', 'created_by',
]);

/**
 * Verifica se um campo é sensível a conflito para uma entidade.
 */
export function isSensitiveField(entityName, fieldName) {
  const fields = SENSITIVE_FIELDS[entityName] || [];
  return fields.some((f) => fieldName === f || fieldName.startsWith(f + '.'));
}

/**
 * Detecta conflito comparando timestamps do cliente e servidor.
 *
 * @param {string|number|null} clientUpdatedAt - timestamp ISO do salvamento do cliente
 * @param {string|number|null} serverUpdatedDate - timestamp ISO do updated_date do servidor
 * @returns {{ conflict: boolean, reason?: string }}
 */
export function detectConflict(clientUpdatedAt, serverUpdatedDate) {
  if (!clientUpdatedAt || !serverUpdatedDate) {
    return { conflict: false };
  }

  const clientTime = new Date(clientUpdatedAt).getTime();
  const serverTime = new Date(serverUpdatedDate).getTime();

  if (isNaN(clientTime) || isNaN(serverTime)) {
    return { conflict: false };
  }

  // Conflito: o servidor foi atualizado DEPOIS do salvamento do cliente.
  // O cliente estava trabalhando sobre uma versão desatualizada.
  if (clientTime < serverTime) {
    return {
      conflict: true,
      reason: 'O registro foi modificado por outro usuário após o seu salvamento.',
    };
  }

  return { conflict: false };
}

/**
 * Detecta conflito comparando base_updated_date com server.updated_date.
 * Se diferentes, o registro foi modificado após o formulário ser carregado.
 *
 * @param {string|null} baseUpdatedDate - updated_date do servidor quando o formulário foi carregado
 * @param {string|null} serverUpdatedDate - updated_date atual do servidor
 * @returns {{ conflict: boolean, reason?: string }}
 */
export function detectBaseConflict(baseUpdatedDate, serverUpdatedDate) {
  if (!baseUpdatedDate || !serverUpdatedDate) {
    return { conflict: false };
  }

  const baseTime = new Date(baseUpdatedDate).getTime();
  const serverTime = new Date(serverUpdatedDate).getTime();

  if (isNaN(baseTime) || isNaN(serverTime)) {
    return { conflict: false };
  }

  if (baseTime !== serverTime) {
    return {
      conflict: true,
      reason: 'O registro foi modificado por outro usuário enquanto você editava.',
    };
  }

  return { conflict: false };
}

/**
 * Compara campos entre versão local e versão do servidor,
 * retornando lista de campos divergentes com flag de sensibilidade.
 *
 * @param {string} entityName
 * @param {object} localData - dados salvos localmente pelo cliente
 * @param {object} serverData - dados atuais do servidor
 * @returns {Array<{ field: string, sensitive: boolean, localValue: any, serverValue: any }>}
 */
export function compareFields(entityName, localData, serverData) {
  if (!localData || !serverData) return [];

  const allKeys = new Set([
    ...Object.keys(localData),
    ...Object.keys(serverData),
  ]);

  const differences = [];

  for (const key of allKeys) {
    if (BUILT_IN_FIELDS.has(key)) continue;
    if (SERVER_AUTHORITATIVE_FIELDS.includes(key)) continue;

    const localVal = localData[key];
    const serverVal = serverData[key];

    if (JSON.stringify(localVal) !== JSON.stringify(serverVal)) {
      differences.push({
        field: key,
        sensitive: isSensitiveField(entityName, key),
        localValue: localVal,
        serverValue: serverVal,
      });
    }
  }

  return differences;
}