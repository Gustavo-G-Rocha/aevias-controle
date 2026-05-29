/**
 * Utilitários puros para manipulação de fotos com legenda.
 * Suporta retrocompatibilidade com fotos antigas (string/url).
 */

/**
 * Normaliza foto para estrutura { url, legenda }
 * @param {string | { url: string; legenda?: string }} foto
 * @returns {{ url: string; legenda: string }}
 */
export const normalizarFoto = (foto) => {
  if (!foto) return { url: '', legenda: '' };
  if (typeof foto === 'string') return { url: foto, legenda: '' };
  return { url: foto.url || '', legenda: foto.legenda || '' };
};

/**
 * Extrai apenas URL de uma foto
 * @param {string | { url: string; legenda?: string }} foto
 * @returns {string}
 */
export const extrairUrl = (foto) => {
  if (typeof foto === 'string') return foto;
  return foto?.url || '';
};

/**
 * Extrai legenda de uma foto, com fallback para "Foto N"
 * @param {string | { url: string; legenda?: string }} foto
 * @param {number} indice - índice da foto (começa em 0)
 * @returns {string}
 */
export const extrairLegenda = (foto, indice) => {
  const normalizada = normalizarFoto(foto);
  return normalizada.legenda?.trim() || `Foto ${indice + 1}`;
};

/**
 * Converte array de fotos para URLs apenas (para compatibilidade)
 * @param {Array<string | { url: string; legenda?: string }>} fotos
 * @returns {string[]}
 */
export const extrairUrls = (fotos) => {
  if (!Array.isArray(fotos)) return [];
  return fotos.map(extrairUrl).filter(Boolean);
};

/**
 * Valida se um objeto é uma foto com estrutura { url, legenda }
 * @param {any} obj
 * @returns {boolean}
 */
export const ehFotoComEstrutura = (obj) => {
  return obj && typeof obj === 'object' && typeof obj.url === 'string';
};

/**
 * Cria estrutura de foto com legenda
 * @param {string} url
 * @param {string} legenda
 * @returns {{ url: string; legenda: string }}
 */
export const criarFoto = (url, legenda = '') => ({
  url: url || '',
  legenda: legenda || '',
});