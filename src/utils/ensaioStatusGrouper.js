/**
 * ensaioStatusGrouper.js
 *
 * Mapper responsável por separar a lógica de categorização de ensaios
 * por status de workflow (Data Model → Presentation Model agrupado).
 *
 * Antes: a lógica de filtro estava inline no LaboratoristaInterface,
 * misturada com useMemo e JSX. Agora: função pura, testável isoladamente,
 * reutilizável em qualquer componente/relatório que precise agrupar ensaios.
 *
 * Critério de aceite: o componente de visualização recebe os grupos já
 * prontos, sem nenhuma lógica de filtragem/transformação no JSX.
 */

// ── Predicados de categoria (puros, sem dependências) ─────────────────────────

/**
 * Em Execução: rascunho (em preenchimento) ou reprovado (precisa correção),
 * desde que ainda não assinado pelo cliente.
 */
export const isEmExecucao = (ensaio) =>
  (ensaio.status === 'rascunho' || ensaio.approved === false) &&
  !ensaio.client_signature?.signed_by;

/**
 * Pendentes: finalizado aguardando aprovação, sem assinatura e sem reprovação.
 */
export const isPendente = (ensaio) => {
  const isFinalizadoOuSemStatus =
    ensaio.status === 'finalizado' || (!ensaio.status && ensaio.status !== 'rascunho');
  return (
    isFinalizadoOuSemStatus &&
    ensaio.approved === null &&
    !ensaio.client_signature?.signed_by &&
    ensaio.approved !== false
  );
};

/**
 * Aprovados: aprovado pelo admin ou assinado pelo cliente.
 */
export const isAprovado = (ensaio) =>
  ensaio.approved === true || !!ensaio.client_signature?.signed_by;

// ── Mapper principal: lista bruta → grupos de apresentação ────────────────────

/**
 * Agrupa uma lista de ensaios em três categorias de workflow.
 *
 * @param {Array} ensaios — lista bruta de registros do backend
 * @returns {{ emExecucao: Array, pendentes: Array, aprovados: Array }}
 */
export const groupEnsaiosByStatus = (ensaios = []) => {
  const emExecucao = [];
  const pendentes = [];
  const aprovados = [];

  // Single-pass: cada ensaio é classificado exatamente uma vez
  for (const ensaio of ensaios) {
    if (isEmExecucao(ensaio)) {
      emExecucao.push(ensaio);
    } else if (isPendente(ensaio)) {
      pendentes.push(ensaio);
    } else if (isAprovado(ensaio)) {
      aprovados.push(ensaio);
    }
    // Ensaios que não se encaixam em nenhuma categoria são ignorados
    // (comportamento equivalente ao filtro original que usava && implícito)
  }

  return { emExecucao, pendentes, aprovados };
};