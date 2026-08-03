/**
 * Reconstrução server-side do RelatorioUnificado.
 *
 * O RelatorioUnificado é um relatório virtual (composição de registros de
 * várias entidades) sem registro próprio no banco. Para assinatura eletrônica,
 * o conteúdo assinado NUNCA pode vir do cliente — o backend reconstrói o
 * relatório a partir dos filtros (obra_id + período + tipos) e calcula o hash
 * de integridade sobre os registros reais persistidos.
 *
 * Espelha src/utils/relatorioUnificadoEntityMap.js (UNIFIED_ENTITY_TYPES) e
 * src/components/ensaios/ensaioMappers.jsx (dateField por entidade).
 */

export const UNIFIED_ENTITY_TYPES = [
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
  'ControleExecucaoServicos',
  'RegistroFresagemCBUQ',
  'EnsaioTaxaInsumos',
];

const UNIFIED_ENTITY_SET = new Set(UNIFIED_ENTITY_TYPES);

export const isTipoSuportado = (tipo: string): boolean => UNIFIED_ENTITY_SET.has(tipo);

// dateField por entidade — espelha ENSAIO_CONFIG em ensaioMappers.jsx
const DATE_FIELDS: Record<string, string> = {
  DiarioObra: 'data',
  EnsaioCAUQ: 'data_ensaio',
  EnsaioMRAF: 'data_ensaio',
  EnsaioDensidade: 'extraction_date',
  EnsaioDensidadeInSitu: 'data_ensaio',
  EnsaioTaxaPinturaImprimacao: 'data_ensaio',
  ChecklistUsina: 'data',
  ChecklistAplicacao: 'data',
  ChecklistMRAF: 'data',
  ChecklistConcretagem: 'data',
  ChecklistTerraplanagem: 'data',
  ChecklistReciclagem: 'data',
  EnsaioSondagem: 'data',
  EnsaioGranulometriaIndividual: 'data_ensaio',
  AcompanhamentoUsinagem: 'data',
  AcompanhamentoCarga: 'data',
  EnsaioManchaPendulo: 'data_ensaio',
  EnsaioVigaBenkelman: 'data_realizacao',
  EnsaioTaxaMRAF: 'data_ensaio',
  BoletimSondagem: 'data',
  BoletimSondagemTrado: 'data',
  EnsaioProctor: 'data_ensaio',
  EnsaioRompimentoConcreto: 'data_ensaio',
  GranuMistura: 'data_ensaio',
  CertificacaoUsina: 'data_vistoria',
  ControleExecucaoServicos: 'data',
  RegistroFresagemCBUQ: 'data',
  EnsaioTaxaInsumos: 'data_ensaio',
};

// Espelha getDataEnsaio (ensaioMappers.jsx): dateField ?? data_ensaio ?? created_date
function getRecordDate(entityType: string, record: any): string | null {
  const dateField = DATE_FIELDS[entityType] || 'created_date';
  return record?.[dateField] ?? record?.data_ensaio ?? record?.created_date ?? null;
}

export interface RelatorioUnificadoFilters {
  obra_id: string;
  data_inicio: string;
  data_fim: string;
  tipos: string[];
}

export interface ReconstructedRecord {
  entityType: string;
  id: string;
  recordDate: string | null;
  record: any;
}

/**
 * Extrai e valida filtros a partir do payload do cliente.
 * Apenas campos conhecidos são aceitos — conteúdo arbitrário é ignorado.
 */
export function extractFilters(payload: any): RelatorioUnificadoFilters | null {
  const obra_id = payload?.obra_id;
  const data_inicio = payload?.data_inicio;
  const data_fim = payload?.data_fim;
  const tipos = payload?.tipos;

  if (!obra_id || typeof obra_id !== 'string') return null;
  if (!data_inicio || typeof data_inicio !== 'string') return null;
  if (!data_fim || typeof data_fim !== 'string') return null;
  if (!Array.isArray(tipos) || tipos.length === 0) return null;

  const tiposValidos = tipos.filter((t) => typeof t === 'string' && isTipoSuportado(t));
  if (tiposValidos.length === 0) return null;

  // Valida formato de data (YYYY-MM-DD)
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (!DATE_RE.test(data_inicio) || !DATE_RE.test(data_fim)) return null;

  return { obra_id, data_inicio, data_fim, tipos: tiposValidos };
}

/**
 * Reconstruct o compositeId a partir dos filtros validados.
 * Espelha useRelatorioUnificadoSignature.js.
 */
export function buildCompositeId(filters: RelatorioUnificadoFilters): string {
  return `${filters.obra_id}_${filters.data_inicio}_${filters.data_fim}_${filters.tipos.join('-')}`;
}

/**
 * Reconstrói os registros do relatório a partir do banco de dados.
 * Busca cada tipo de entidade por obra_id, filtra pelo período e ordena
 * canonicalmente por (data, entityType, id) — determinismo para o hash.
 *
 * Limite de 2000 por entidade — espelha useRelatorioUnificadoRecords.js.
 */
export async function reconstructRecords(
  base44: any,
  filters: RelatorioUnificadoFilters
): Promise<ReconstructedRecord[]> {
  const inicio = new Date(filters.data_inicio + 'T00:00:00');
  const fim = new Date(filters.data_fim + 'T23:59:59');

  // Cada fetch captura erros individualmente para que uma entidade com falha
  // não aborte todo o relatório. Mas se TODAS as fetches falharem, é uma
  // falha transitória de rede/backend — propagamos o erro para que o caller
  // retorne 503 em vez de assinar silenciosamente um relatório vazio.
  const fetchByType = filters.tipos.map((tipo) =>
    base44.asServiceRole.entities[tipo]
      .filter({ obra_id: filters.obra_id }, '-created_date', 2000)
      .then((rows: any[]) => (Array.isArray(rows) ? rows : []).map((r) => ({ ...r, entityType: tipo })))
      .then(
        (rows: any[]) => ({ ok: true, rows }),
        (err: any) => ({ ok: false, err, tipo }),
      )
  );

  const results = await Promise.all(fetchByType);
  const allFailures = results.every((r: any) => !r.ok);
  if (allFailures) {
    throw new Error('Falha temporária ao acessar os registros do relatório');
  }
  const rawByType = results.filter((r: any) => r.ok).flatMap((r: any) => r.rows);
  const allRecords = rawByType as any[];

  const inRange = allRecords.filter((r) => {
    const d = getRecordDate(r.entityType, r);
    if (!d) return false;
    const date = new Date(d);
    return date >= inicio && date <= fim;
  });

  // Ordenação canônica determinística: data → entityType → id
  return inRange
    .map((r) => ({
      entityType: r.entityType,
      id: r.id,
      recordDate: getRecordDate(r.entityType, r),
      record: r,
    }))
    .sort((a, b) => {
      const da = a.recordDate || '';
      const db = b.recordDate || '';
      if (da !== db) return da < db ? -1 : 1;
      if (a.entityType !== b.entityType) return a.entityType < b.entityType ? -1 : 1;
      return (a.id || '') < (b.id || '') ? -1 : 1;
    });
}