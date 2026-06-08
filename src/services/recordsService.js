// recordsService.js — Fonte única de verdade para carregamento de registros
// ETAPA 6+7: elimina duplicação entre dataLoader.jsx e dashboardService.js
// Paginação inteligente: limites distintos por contexto (dashboard vs lista completa)

import { base44 } from '@/api/base44Client';

// ─── Mapa canônico de todas as entidades de registro ──────────────────────────
// Limite único por entidade — cache unificado entre Dashboard e MeusEnsaios
export const ALL_RECORD_ENTITIES = [
  'DiarioObra',
  'EnsaioCAUQ',
  'EnsaioMRAF',
  'EnsaioDensidade',
  'EnsaioDensidadeInSitu',
  'EnsaioTaxaPinturaImprimacao',
  'ChecklistUsina',
  'ChecklistAplicacao',
  'ChecklistMRAF',
  'ChecklistConcretagem',
  'ChecklistTerraplanagem',
  'ChecklistReciclagem',
  'EnsaioSondagem',
  'EnsaioGranulometriaIndividual',
  'AcompanhamentoUsinagem',
  'AcompanhamentoCarga',
  'EnsaioManchaPendulo',
  'EnsaioVigaBenkelman',
  'EnsaioTaxaMRAF',
  'BoletimSondagem',
  'BoletimSondagemTrado',
  'EnsaioProctor',
  'EnsaioRompimentoConcreto',
  'GranuMistura',
  'CertificacaoUsina',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Carrega uma entidade com fallback silencioso para não bloquear o Promise.all.
 * @param {string} entityType
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
const RECORD_PAGE_SIZE = 2000;

async function loadEntity(entityType) {
  try {
    return await base44.entities[entityType].list('-created_date', RECORD_PAGE_SIZE);
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

// Deduplicação por ID — evita registros duplicados em caso de race conditions
export function deduplicateRecords(records) {
  const seen = new Set();
  return records.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ─── Carregamento em lote ─────────────────────────────────────────────────────

/**
 * Carrega todos os registros em paralelo.
 * @param {'dashboard' | 'list'} mode - controla o limite por entidade
 * @returns {Promise<object[]>} array normalizado com `entityType`
 */
export async function loadAllRecords() {
  const settled = await Promise.allSettled(
    ALL_RECORD_ENTITIES.map(type => loadEntity(type))
  );
  const results = settled.map((r, i) => {
    if (r.status === 'rejected') {
      console.warn(`[recordsService] loadAllRecords: ${ALL_RECORD_ENTITIES[i]} rejeitou:`, r.reason?.message || r.reason);
      return [];
    }
    return r.value;
  });
  const normalized = normalizeRecords(results, ALL_RECORD_ENTITIES);
  return deduplicateRecords(normalized);
}

/**
 * Carrega todos os registros de uma obra específica em paralelo (filtrado server-side).
 * Mais eficiente que carregar tudo e filtrar no cliente.
 * @param {string} obraId
 * @returns {Promise<object[]>}
 */
export async function loadRecordsByObra(obraId) {
  const settled = await Promise.allSettled(
    ALL_RECORD_ENTITIES.map(type =>
      base44.entities[type].filter({ obra_id: obraId }, '-created_date', RECORD_PAGE_SIZE)
    )
  );
  const results = settled.map((r, i) => {
    if (r.status === 'rejected') {
      console.warn(`[recordsService] loadRecordsByObra: ${ALL_RECORD_ENTITIES[i]} rejeitou:`, r.reason?.message || r.reason);
      return [];
    }
    return r.value;
  });
  const normalized = normalizeRecords(results, ALL_RECORD_ENTITIES);
  return deduplicateRecords(normalized);
}

/**
 * Carrega dados auxiliares (Obra, Regional, Project, User) em paralelo.
 * @param {{ needsRegionais?: boolean, needsUsers?: boolean }} opts
 */
export async function loadAuxData({ needsRegionais = true, needsUsers = false } = {}) {
  const results = await Promise.allSettled([
    base44.entities.Obra.list('-created_date', 500),
    base44.entities.Project.list('-created_date', 500),
    needsRegionais ? base44.entities.Regional.list() : Promise.resolve([]),
    needsUsers ? base44.entities.User.list() : Promise.resolve([]),
  ]);
  
  const [obrasResult, projectsResult, regionaisResult, usersResult] = results;
  
  if (obrasResult.status    === 'rejected') console.warn('[recordsService] loadAuxData: Obra falhou:',     obrasResult.reason?.message);
  if (projectsResult.status === 'rejected') console.warn('[recordsService] loadAuxData: Project falhou:', projectsResult.reason?.message);
  if (regionaisResult.status === 'rejected') console.warn('[recordsService] loadAuxData: Regional falhou:', regionaisResult.reason?.message);
  if (usersResult.status    === 'rejected') console.warn('[recordsService] loadAuxData: User falhou:',     usersResult.reason?.message);
  
  return {
    obras:     obrasResult.status    === 'fulfilled' ? obrasResult.value    : [],
    projects:  projectsResult.status === 'fulfilled' ? projectsResult.value : [],
    regionais: regionaisResult.status === 'fulfilled' ? regionaisResult.value : [],
    users:     usersResult.status    === 'fulfilled' ? usersResult.value    : [],
  };
}