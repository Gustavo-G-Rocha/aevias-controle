/**
 * Utilitários puros para RelatorioChecklist
 */

/**
 * Agrupa array em chunks de tamanho especificado
 * @param {Array} array
 * @param {number} size
 * @returns {Array<Array>}
 */
export const chunkArray = (array, size) => {
  const chunks = [];
  if (!array) return chunks;
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Calcula número de páginas do relatório
 * @param {Object} config
 * @returns {number}
 */
export const calculateTotalPages = ({
  temControleLigante,
  temAcoesCorretivas,
  temNC,
  temMedicaoUsina,
  photoChunksLength,
}) => {
  const temPaginaAcoesNC = temAcoesCorretivas || temNC;
  return 1 + 1 + (temControleLigante ? 1 : 0) + (temPaginaAcoesNC ? 1 : 0) + (temMedicaoUsina ? 1 : 0) + photoChunksLength;
};

/**
 * Calcula número da página para seção de fotos
 * @param {number} pageIndex - índice da foto (começando em 0)
 * @param {Object} config
 * @returns {number}
 */
export const calculatePhotoPageNumber = (
  pageIndex,
  { temControleLigante, temAcoesCorretivas, temNC, temMedicaoUsina }
) => {
  const temPaginaAcoesNC = temAcoesCorretivas || temNC;
  return pageIndex + 3 + (temControleLigante ? 1 : 0) + (temPaginaAcoesNC ? 1 : 0) + (temMedicaoUsina ? 1 : 0);
};

/**
 * Calcula número da página para seção de ações corretivas
 * @param {Object} config
 * @returns {number}
 */
export const calculateAcoesPageNumber = ({ temControleLigante }) => {
  return temControleLigante ? 4 : 3;
};

/**
 * Determina se a página de Ações Corretivas / NC deve ser exibida
 * @param {Object} checklist
 * @returns {boolean}
 */
export const temPaginaAcoesNC = (checklist) => {
  const temAcoes = checklist.acoes_corretivas_realizado === true && !!checklist.acoes_corretivas_descricao;
  const temNC = Array.isArray(checklist.nao_conformidades) && checklist.nao_conformidades.length > 0;
  return temAcoes || temNC;
};

/**
 * Formata resultado de ensaio para tabela CAUQ
 * @param {Object} ensaioData
 * @returns {string}
 */
export const formatResultado = (ensaioData) => {
  if (!ensaioData) return '-';
  if (Array.isArray(ensaioData.resultados) && ensaioData.resultados.length > 0) {
    const validos = ensaioData.resultados.filter(r => r !== null && r !== undefined);
    if (validos.length === 0) return '-';
    return validos.map(v => String(v)).join(' / ');
  }
  if (ensaioData.resultado !== null && ensaioData.resultado !== undefined) {
    return String(ensaioData.resultado);
  }
  return '-';
};