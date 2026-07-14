/**
 * Utilitário centralizado de compressão de imagens para relatórios impressos.
 * Elimina o mesmo bloco async duplicado em 5+ componentes de relatório.
 */
import { isLocalPhotoRef, getPhotoIdFromRef } from '@/services/offlinePhotoService';
import { getOfflinePhoto } from '@/services/offlineStorageService';

/**
 * Extrai a URL de string ou objeto { url, legenda }.
 */
const toUrl = (foto) =>
  typeof foto === 'string' ? foto : foto?.url || '';

/**
 * Comprime uma única imagem usando Canvas.
 * @param {string} photoUrl - URL da imagem original
 * @param {object} opts
 * @param {number} opts.maxWidth  - largura máxima (default 800)
 * @param {number} opts.maxHeight - altura máxima (default 600)
 * @param {number} opts.quality   - qualidade JPEG 0–1 (default 0.5)
 * @param {boolean} opts.whiteBg  - preencher fundo branco (default false)
 * @param {number} opts.timeout   - tempo máximo de carregamento em ms (default 10000)
 * @returns {Promise<string>} dataURL comprimida, ou photoUrl original em caso de falha
 */
export async function compressImage(photoUrl, opts = {}) {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.5,
    whiteBg = false,
    timeout = 10000,
  } = opts;

  try {
    let resolvedUrl = photoUrl;
    if (isLocalPhotoRef(photoUrl)) {
      const photo = await getOfflinePhoto(getPhotoIdFromRef(photoUrl));
      if (!photo?.base64) throw new Error('foto offline não encontrada');
      const mimeType = photo.mimeType || 'image/jpeg';
      resolvedUrl = photo.base64.startsWith('data:')
        ? photo.base64
        : `data:${mimeType};base64,${photo.base64}`;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), timeout);
      img.onload = () => { clearTimeout(timer); resolve(); };
      img.onerror = () => { clearTimeout(timer); reject(new Error('load error')); };
      img.src = resolvedUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;

    if (whiteBg) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return photoUrl;
  }
}

/**
 * Comprime um array de fotos de forma SEQUENCIAL (uma por vez).
 *
 * Aceita tanto strings (URLs) quanto objetos { url, legenda }.
 * Preserva a legenda original: retorna o mesmo formato de entrada,
 * substituindo apenas a URL pela dataURL comprimida.
 *
 * O carregamento sequencial evita picos de rede/memória e travamento da UI
 * ao gerar relatórios com muitas imagens. A ordem final é preservada.
 *
 * @param {(string|{url:string,legenda?:string})[]} fotos - Array de fotos
 * @param {object} opts   - Mesmas opções de compressImage
 * @returns {Promise<(string|{url:string,legenda?:string})[]>} Array no mesmo formato
 */
export async function compressImages(fotos, opts = {}) {
  const valid = (fotos || []).filter(f => f && toUrl(f).trim() !== '');
  const results = [];
  for (const foto of valid) {
    const url = toUrl(foto);
    // eslint-disable-next-line no-await-in-loop
    const compressed = await compressImage(url, opts);
    if (typeof foto === 'string') {
      results.push(compressed);
    } else {
      results.push({ ...foto, url: compressed });
    }
  }
  return results;
}

/**
 * Divide um array em chunks de tamanho fixo.
 * @param {any[]} array
 * @param {number} size
 * @returns {any[][]}
 */
export function chunkArray(array, size) {
  const chunks = [];
  if (!array) return chunks;
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}