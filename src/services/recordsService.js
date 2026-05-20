// recordsService.js — Fonte única de verdade para carregamento de registros
// ETAPA 6+7: elimina duplicação entre dataLoader.jsx e dashboardService.js
// Paginação inteligente: limites distintos por contexto (dashboard vs lista completa)

import { base44 } from '@/api/base44Client';

// ─── Mapa canônico de todas as entidades de registro ──────────────────────────
// [ entityType, pageSizeForDashboard, pageSizeForList ]
export const ALL_RECORD_ENTITIES = [
  ['DiarioObra',                    200, 500],
  ['EnsaioCAUQ',                    200, 500],
  ['EnsaioMRAF',                    200, 500],
  ['EnsaioDensidade',               200, 500],
  ['EnsaioDensidadeInSitu',         200, 500],
  ['EnsaioTaxaPinturaImprimacao',   200, 500],
  ['ChecklistUsina',                200, 500],
  ['ChecklistAplicacao',            200, 500],
  ['ChecklistMRAF',                 200, 500],
  ['ChecklistConcretagem',          200, 500],
  ['ChecklistTerraplanagem',        200, 500],
  ['ChecklistReciclagem',           200, 500],
  ['EnsaioSondagem',                200, 500],
  ['EnsaioGranulometriaIndividual', 200, 500],
  ['AcompanhamentoUsinagem',        200, 500],
  ['AcompanhamentoCarga',           200, 500],
  ['EnsaioManchaPendulo',           200, 500],
  ['EnsaioVigaBenkelman',           200, 500],
  ['EnsaioTaxaMRAF',                200, 500],
  ['BoletimSondagem',               200, 500],
  ['BoletimSondagemTrado',          200, 500],
  ['EnsaioProctor',                 200, 500],
  ['EnsaioRompimentoConcreto',      200, 500],
  ['GranuMistura',                  200, 500],
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Carrega uma entidade com fallback silencioso para não bloquear o Promise.all.
 * @param {string} entityType
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
async function loadEntity(entityType, limit) {
  try {
    return await base44.entities[entityType].list('-created_date', limit);
  } catch (e) {
    console.error(`[recordsService] Falha ao carregar ${entityType}:`, e?.message || e);
    return [];
  }
}

/**
 * Normaliza um array de registros adicionando a propriedade `entityType`.
 * @param {object[][]} results - resultados paralelos, um por entidade
 * @param {string[]} entityTypes - na mesma ordem de `results`
 * @returns {object[]}
 */
export function normalizeRecords(results, entityTypes) {
  const out = [];
  for (let i = 0; i < entityTypes.length; i++) {
    const rows = results[i];
    const type = entityTypes[i];
    for (const row of rows) {
      out.push({ ...row, entityType: type });
    }
  }
  return out;
}

// ─── Carregamento em lote ─────────────────────────────────────────────────────

/**
 * Carrega todos os registros em paralelo.
 * @param {'dashboard' | 'list'} mode - controla o limite por entidade
 * @returns {Promise<object[]>} array normalizado com `entityType`
 */
export async function loadAllRecords(mode = 'list') {
  const limitIndex = mode === 'dashboard' ? 1 : 2;
  const entityTypes = ALL_RECORD_ENTITIES.map(([type]) => type);
  const promises = ALL_RECORD_ENTITIES.map(([type, dashLimit, listLimit]) =>
    loadEntity(type, limitIndex === 1 ? dashLimit : listLimit)
  );

  const results = await Promise.all(promises);
  return normalizeRecords(results, entityTypes);
}

/**
 * Carrega todos os registros de uma obra específica em paralelo (filtrado server-side).
 * Mais eficiente que carregar tudo e filtrar no cliente.
 * @param {string} obraId
 * @returns {Promise<object[]>}
 */
export async function loadRecordsByObra(obraId) {
  const entityTypes = ALL_RECORD_ENTITIES.map(([type]) => type);
  const promises = ALL_RECORD_ENTITIES.map(([type]) =>
    base44.entities[type]
      .filter({ obra_id: obraId }, '-created_date', 500)
      .catch(e => {
        console.error(`[recordsService] Falha ao filtrar ${type} por obra:`, e?.message || e);
        return [];
      })
  );

  const results = await Promise.all(promises);
  return normalizeRecords(results, entityTypes);
}

/**
 * Carrega dados auxiliares (Obra, Regional, Project, User) em paralelo.
 * @param {{ needsRegionais?: boolean, needsUsers?: boolean }} opts
 */
export async function loadAuxData({ needsRegionais = true, needsUsers = false } = {}) {
  const [obras, projects, regionais, users] = await Promise.all([
    base44.entities.Obra.list('-created_date', 500).catch(() => []),
    base44.entities.Project.list('-created_date', 500).catch(() => []),
    needsRegionais
      ? base44.entities.Regional.list().catch(() => [])
      : Promise.resolve([]),
    needsUsers
      ? base44.entities.User.list().catch(() => [])
      : Promise.resolve([]),
  ]);
  return { obras, projects, regionais, users };
}