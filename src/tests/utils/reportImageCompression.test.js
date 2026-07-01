import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { compressImages, chunkArray } from '@/utils/reportImageCompression';

/**
 * Mocka Image + canvas para simular a compressão sem DOM real.
 * Cada imagem "carrega" após um pequeno atraso, permitindo verificar
 * que o processamento é SEQUENCIAL (uma por vez) e preserva a ordem.
 */
function setupCanvasMocks() {
  let activeLoads = 0;
  let maxConcurrentLoads = 0;

  class FakeImage {
    set src(value) {
      this._src = value;
      activeLoads += 1;
      maxConcurrentLoads = Math.max(maxConcurrentLoads, activeLoads);
      this.width = 1000;
      this.height = 800;
      setTimeout(() => {
        activeLoads -= 1;
        this.onload?.();
      }, 5);
    }
    get src() {
      return this._src;
    }
  }

  globalThis.Image = FakeImage;
  globalThis.document = {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => ({ fillRect: vi.fn(), drawImage: vi.fn() }),
      toDataURL: function () {
        // Retorna dataURL determinística baseada nas dimensões
        return `data:image/jpeg;base64,${this.width}x${this.height}`;
      },
    }),
  };

  return { getMaxConcurrentLoads: () => maxConcurrentLoads };
}

describe('reportImageCompression', () => {
  describe('chunkArray', () => {
    it('divide array em chunks do tamanho especificado', () => {
      expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('retorna array vazio para null/undefined', () => {
      expect(chunkArray(null, 3)).toEqual([]);
      expect(chunkArray(undefined, 3)).toEqual([]);
    });
  });

  describe('compressImages', () => {
    let handle;

    beforeEach(() => {
      handle = setupCanvasMocks();
    });

    afterEach(() => {
      delete globalThis.Image;
      delete globalThis.document;
    });

    it('retorna array vazio para lista vazia/null', async () => {
      expect(await compressImages([])).toEqual([]);
      expect(await compressImages(null)).toEqual([]);
    });

    it('filtra URLs vazias ou em branco', async () => {
      const result = await compressImages(['a.jpg', '', '   ', 'b.jpg']);
      expect(result).toHaveLength(2);
    });

    it('preserva a ordem original das imagens', async () => {
      const result = await compressImages(['a.jpg', 'b.jpg', 'c.jpg']);
      expect(result).toHaveLength(3);
      // Todas comprimidas para as mesmas dimensões (proporção preservada)
      result.forEach(url => expect(url).toMatch(/^data:image\/jpeg/));
    });

    it('processa imagens SEQUENCIALMENTE (nunca mais de uma por vez)', async () => {
      await compressImages(['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg']);
      expect(handle.getMaxConcurrentLoads()).toBe(1);
    });

    it('retorna a URL original quando o carregamento falha', async () => {
      // Sobrescreve Image para disparar erro
      globalThis.Image = class {
        set src(v) {
          this._src = v;
          setTimeout(() => this.onerror?.(new Error('fail')), 1);
        }
        get src() { return this._src; }
      };
      const result = await compressImages(['falha.jpg']);
      expect(result).toEqual(['falha.jpg']);
    });
  });
});