// recordsService.js — Fonte única de verdade para carregamento de registros
// ETAPA 6+7: elimina duplicação entre dataLoader.jsx e dashboardService.js
// Paginação inteligente: limites distintos por contexto (dashboard vs lista completa)

import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';
import { logger } from '@/utils/logger';
import { toast } from '@/components/ui/use-toast';

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
 * No modo "list", usa limite de 1000 por entidade (2 × 500) em chamada única.
 * @param {string} entityType
 * @param {number} limit
 * @param {boolean} paginate - se true, busca com limite ampliado (modo list)
 * @returns {Promise<object[]>}
 */
const RECORD_PAGE_SIZE = 500;     // lista completa e loadRecordsByObra — reduz volume em memória
const DASHBOARD_PAGE_SIZE = 200; // dashboard — só registros recentes para stats/charts
// 10 × 500 = 5000 por entidade — usado por loadRecordsByObra (escopo de obra única).
export const MAX_PAGES = 10;
// modo 'list' (loadAllRecords): paginação completa via filter+skip.
// 40 × 500 = 20.000 por entidade — folga de ~4× sobre o maior volume atual
// (DiarioObra: ~5.500). O loop para automaticamente quando uma página retorna
// menos que o limite, então o teto só custa rede para entidades que o atingem.
// Se ainda assim o teto for atingido, o usuário é avisado (ver loadEntity).
export const LIST_MAX_PAGES = 40;

async function loadEntity(entityType, limit = RECORD_PAGE_SIZE, paginate = false, maxPages = MAX_PAGES) {
  try {
    if (!paginate) {
      return await base44.entities[entityType].list('-created_date', limit);
    }

    // Paginação via filter + skip — carrega TODOS os registros da entidade.
    // (list() limita a 5000 por chamada; filter com skip não tem esse teto.)
    const all = [];
    let skip = 0;
    let capReached = true;
    for (let page = 0; page < maxPages; page++) {
      const batch = await base44.entities[entityType].filter({}, '-created_date', limit, skip);
      all.push(...batch);
      if (batch.length < limit) {
        capReached = false;
        break;
      }
      skip += limit;
    }
    // Teto de paginação atingido — antes os registros mais antigos eram
    // silenciosamente omitidos da lista. Agora o usuário é avisado.
    if (capReached) {
      logger.warn(`[recordsService] Teto de paginação atingido em ${entityType} (${all.length} registros carregados)`);
      toast({
        title: `Volume muito alto em ${entityType}`,
        description: `Apenas os ${all.length} registros mais recentes foram carregados. Registros mais antigos podem não aparecer na lista.`,
        variant: 'destructive',
      });
    }
    return all;
  } catch (e) {
    logger.error(`[recordsService] Falha ao carregar ${entityType}:`, e?.message || e);
    toast({
      title: `Falha ao carregar ${entityType}`,
      description: 'Alguns registros podem não aparecer na lista.',
      variant: 'destructive',
    });
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

// Deduplicação apenas por ID — remove registros duplicados vindos da paginação.
// O dedup semântico anterior usava campos opcionais (tipo_local, trecho, etc.)
// que quando nulos faziam registros distintos colapsarem na mesma chave,
// escondendo registros legítimos do usuário.
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
const BATCH_SIZE = 10; // máximo de requests simultâneos — 3 lotes para 25+ entidades

async function loadEntitiesInBatches(entityList, limit, paginate = false, maxPages = MAX_PAGES) {
  const allResults = [];
  for (let i = 0; i < entityList.length; i += BATCH_SIZE) {
    const batch = entityList.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(batch.map(type => loadEntity(type, limit, paginate, maxPages)));
    settled.forEach((r, idx) => {
      if (r.status === 'rejected') {
        logger.warn(`[recordsService] loadAllRecords: ${batch[idx]} rejeitou:`, r.reason?.message || r.reason);
        allResults.push([]);
      } else {
        allResults.push(r.value);
      }
    });
  }
  return allResults;
}

export async function loadAllRecords(mode = 'list', maxPages = mode === 'list' ? LIST_MAX_PAGES : MAX_PAGES) {
  const limit = mode === 'dashboard' ? DASHBOARD_PAGE_SIZE : RECORD_PAGE_SIZE;
  const paginate = mode === 'list';
  const results = await loadEntitiesInBatches(ALL_RECORD_ENTITIES, limit, paginate, maxPages);
  const normalized = normalizeRecords(results, ALL_RECORD_ENTITIES);
  return deduplicateRecords(normalized);
}

/**
 * Carrega todos os registros de uma entidade para uma obra específica,
 * com paginação por cursor para não cortar registros antigos.
 * @param {string} entityType
 * @param {string} obraId
 * @returns {Promise<object[]>}
 */
async function loadEntityByObra(entityType, obraId) {
  try {
    return await base44.entities[entityType].filter(
      { obra_id: obraId },
      '-created_date',
      RECORD_PAGE_SIZE * MAX_PAGES
    );
  } catch (e) {
    logger.error(`[recordsService] Falha ao carregar ${entityType} por obra:`, e?.message || e);
    return [];
  }
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
      loadEntityByObra(type, obraId)
    )
  );
  const results = settled.map((r, i) => {
    if (r.status === 'rejected') {
      logger.warn(`[recordsService] loadRecordsByObra: ${ALL_RECORD_ENTITIES[i]} rejeitou:`, r.reason?.message || r.reason);
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
  // Retry único: sob carga (muitas requisições paralelas), uma falha transitória
  // aqui deixava obras/regionais vazias — todas as linhas exibiam "N/A" e os
  // formulários perdiam o dropdown de Obra. Uma nova tentativa resolve a maioria.
  const withRetry = (fn) => fn().catch(() => new Promise(r => setTimeout(r, 800)).then(fn));
  const results = await Promise.allSettled([
    withRetry(() => base44.entities.Obra.list('-created_date', 500)),
    withRetry(() => base44.entities.Project.list('-created_date', 500)),
    needsRegionais ? withRetry(() => base44.entities.Regional.list()) : Promise.resolve([]),
    needsUsers ? withRetry(() => base44.entities.User.list()) : Promise.resolve([]),
  ]);
  
  const [obrasResult, projectsResult, regionaisResult, usersResult] = results;
  
  if (obrasResult.status    === 'rejected') logger.warn('[recordsService] loadAuxData: Obra falhou:',     obrasResult.reason?.message);
  if (projectsResult.status === 'rejected') logger.warn('[recordsService] loadAuxData: Project falhou:', projectsResult.reason?.message);
  if (regionaisResult.status === 'rejected') logger.warn('[recordsService] loadAuxData: Regional falhou:', regionaisResult.reason?.message);
  if (usersResult.status    === 'rejected') logger.warn('[recordsService] loadAuxData: User falhou:',     usersResult.reason?.message);
  
  return {
    obras:     obrasResult.status    === 'fulfilled' ? obrasResult.value    : [],
    projects:  projectsResult.status === 'fulfilled' ? projectsResult.value : [],
    regionais: regionaisResult.status === 'fulfilled' ? regionaisResult.value : [],
    users:     usersResult.status    === 'fulfilled' ? usersResult.value    : [],
  };
}

/**
 * Carrega registros de um subconjunto específico de entidades em paralelo
 * e retorna um array plano (concatenado, sem normalização nem deduplicação).
 * Preserva o comportamento de páginas que agregam contagens sobre múltiplas
 * entidades sem precisar do entityType/dedup de loadAllRecords.
 * @param {string[]} entityList
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function loadRecordsByEntities(entityList, limit = 500) {
  const results = await Promise.all(entityList.map(type => loadEntity(type, limit)));
  return results.flat();
}

/**
 * Carrega registros de um subconjunto específico de entidades em paralelo
 * e retorna um array de arrays alinhado com a ordem de `entityList`
 * (cada posição contém os registros da entidade correspondente).
 * Tolerante a erros: entidades que falham retornam [] sem interromper o lote.
 * @param {string[]} entityList
 * @param {number} limit
 * @returns {Promise<object[][]>}
 */
export async function loadRecordsGrouped(entityList, limit = 500) {
  return loadEntitiesInBatches(entityList, limit);
}

/**
 * Lista registros de uma entidade específica (server-side) com tratamento de erro.
 * @param {string} entityName
 * @param {string} sort
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function listarRegistros(entityName, sort = '-created_date', limit = 500) {
  try {
    return await base44.entities[entityName].list(sort, limit);
  } catch (e) {
    logger.error(`[recordsService] Falha ao listar ${entityName}:`, e?.message || e);
    return [];
  }
}

/**
 * Filtra registros de uma entidade específica (server-side) com tratamento de erro.
 * @param {string} entityName
 * @param {object} filtro
 * @param {string} sort
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function filtrarRegistros(entityName, filtro, sort = '-created_date', limit = 500) {
  try {
    return await base44.entities[entityName].filter(filtro, sort, limit);
  } catch (e) {
    logger.error(`[recordsService] Falha ao filtrar ${entityName}:`, e?.message || e);
    return [];
  }
}

/**
 * Atualiza um registro de qualquer entidade (camada de serviço genérica).
 * @param {string} entityName
 * @param {string} id
 * @param {object} data
 */
export async function atualizarRegistro(entityName, id, data) {
  return withServiceCall(
    () => base44.entities[entityName].update(id, data),
    'Falha ao atualizar registro'
  );
}

/**
 * Obtém um registro de qualquer entidade por id (camada de serviço genérica).
 * @param {string} entityName
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function obterRegistro(entityName, id) {
  return withServiceCall(
    () => base44.entities[entityName].get(id),
    'Falha ao carregar registro'
  );
}

/**
 * Exclui um registro de qualquer entidade (camada de serviço genérica).
 * @param {string} entityName
 * @param {string} id
 */
export async function deletarRegistro(entityName, id) {
  return withServiceCall(
    () => base44.entities[entityName].delete(id),
    'Falha ao excluir registro'
  );
}

/**
 * Cria um registro de qualquer entidade (camada de serviço genérica).
 * @param {string} entityName
 * @param {object} data
 */
export async function criarRegistro(entityName, data) {
  return withServiceCall(
    () => base44.entities[entityName].create(data),
    'Falha ao criar registro'
  );
}