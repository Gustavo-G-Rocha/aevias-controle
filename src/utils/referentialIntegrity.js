/**
 * referentialIntegrity.js
 *
 * Validação de integridade referencial para operações offline-first.
 *
 * Antes de enfileirar um registro para sincronização offline, verifica
 * se as entidades pai referenciadas (Obra, Project) existem no cache
 * local do dispositivo. Isso previne registros órfãos que falhariam
 * na sincronização ou gerariam dados inconsistentes no backend.
 *
 * Estratégia: checagem local contra dados já sincronizados (React Query cache).
 * Não exige migração destrutiva — apenas adiciona um gate antes do enqueue.
 */

import { logger } from '@/utils/logger';

/**
 * Campos de referência estrangeira comuns a todas as entidades
 * que suportam operação offline.
 *
 * `required` = true  → bloqueia o salvamento offline se ausente
 * `required` = false → valida apenas se o campo tiver valor
 */
const REFERENCE_FIELDS = [
  {
    field: 'obra_id',
    parentEntity: 'Obra',
    cacheKey: 'obras',
    required: true,
    label: 'obra',
  },
  {
    field: 'project_id',
    parentEntity: 'Project',
    cacheKey: 'projects',
    required: false,
    label: 'projeto',
  },
];

/**
 * Valida integridade referencial de um payload contra o cache local.
 *
 * @param {object} payload — dados do registro a ser salvo offline
 * @param {object} localCache — { obras: [], projects: [] } do cache local
 * @returns {{ valid: boolean, missing: array, errorMessage: string|null }}
 */
export function validateReferentialIntegrity(payload, localCache = {}) {
  const missing = [];

  for (const ref of REFERENCE_FIELDS) {
    const refValue = payload?.[ref.field];

    // Campo não presente no payload — pular
    if (refValue === undefined || refValue === null) continue;

    // Campo vazio e opcional — nada a validar
    if (!refValue) continue;

    const cache = localCache[ref.cacheKey] || [];

    if (!cache.some((item) => item?.id === refValue)) {
      missing.push({
        field: ref.field,
        parentEntity: ref.parentEntity,
        parentId: refValue,
        label: ref.label,
        reason: 'not_found_locally',
      });
    }
  }

  if (missing.length === 0) {
    return { valid: true, missing: [], errorMessage: null };
  }

  // Mensagem clara e acionável para o usuário
  const labels = missing.map((m) => m.label);
  const labelStr =
    missing.length === 1 ? `a ${labels[0]}` : `${labels.length} referências (${labels.join(', ')})`;

  const errorMessage =
    `Não foi possível salvar offline: ${labelStr} referenciada(s) não existe(m) no cache local. ` +
    `Conecte-se à internet para sincronizar os dados mais recentes e tente novamente.`;

  logger.warn('[referentialIntegrity] Validação falhou:', missing);

  return { valid: false, missing, errorMessage };
}