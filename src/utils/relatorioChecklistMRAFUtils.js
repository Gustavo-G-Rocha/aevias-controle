/**
 * Utilitários puros para RelatorioChecklistMRAF
 */

/**
 * Agrupa fotos em páginas de X fotos cada
 * @param {Array<string>} photos - URLs das fotos
 * @param {number} photosPerPage - Quantidade de fotos por página (padrão: 6)
 * @returns {Array<Array<string>>}
 */
export const createPhotoPages = (photos, photosPerPage = 6) => {
  if (!photos || photos.length === 0) return [];
  
  return Array.from(
    { length: Math.ceil(photos.length / photosPerPage) },
    (_, i) => photos.slice(i * photosPerPage, (i + 1) * photosPerPage)
  );
};

/**
 * Verifica se deve renderizar página de ações/não conformidades
 * @param {Object} checklist
 * @returns {boolean}
 */
export const shouldShowActionsPage = (checklist) => {
  const hasActions = checklist?.acoes_corretivas_realizado === true && checklist?.acoes_corretivas_descricao;
  const hasNaoConformidades = checklist?.nao_conformidades && checklist.nao_conformidades.length > 0;
  return hasActions || hasNaoConformidades;
};

/**
 * Formata data para exibição em relatório
 * @param {string} dateString - Data em formato ISO
 * @returns {string}
 */
export const formatReportDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return '-';
  }
};