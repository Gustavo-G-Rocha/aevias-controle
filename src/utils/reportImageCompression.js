/**
 * Utilitário centralizado de compressão de imagens para relatórios impressos.
 * Elimina o mesmo bloco async duplicado em 5+ componentes de relatório.
 */

/**
 * Comprime uma única imagem usando Canvas.
 * @param {string} photoUrl - URL da imagem original
 * @param {object} opts
 * @param {number} opts.maxWidth  - largura máxima (default 800)
 * @param {number} opts.maxHeight - altura máxima (default 600)
 * @param {number} opts.quality   - qualidade JPEG 0–1 (default 0.5)
 * @param {boolean} opts.whiteBg  - preencher fundo branco (default false)
 * @returns {Promise<string>} dataURL comprimida, ou photoUrl original em caso de falha
 */
export async function compressImage(photoUrl, opts = {}) {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.5,
    whiteBg = false,
  } = opts;

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = photoUrl;
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
 * Comprime um array de URLs de imagem de forma SEQUENCIAL (uma por vez).
 *
 * O carregamento sequencial evita picos de rede/memória e travamento da UI
 * ao gerar relatórios com muitas imagens (o carregamento paralelo anterior
 * disparava todas as requisições simultaneamente). A ordem final é preservada
 * e o resultado de cada imagem é idêntico ao da compressão individual.
 *
 * @param {string[]} urls - Array de URLs
 * @param {object} opts   - Mesmas opções de compressImage
 * @returns {Promise<string[]>} Array de dataURLs comprimidas, na ordem original
 */
export async function compressImages(urls, opts = {}) {
  const valid = (urls || []).filter(u => u && u.trim() !== '');
  const results = [];
  for (const url of valid) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await compressImage(url, opts));
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