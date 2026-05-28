import { describe, it, expect } from "vitest";
import {
  chunkArray,
  calculateTotalPages,
  calculatePhotoPageNumber,
  calculateAcoesPageNumber,
  formatResultado,
} from "@/utils/relatorioChecklistUtils";

describe("relatorioChecklistUtils", () => {
  describe("chunkArray", () => {
    it("agrupa array em chunks de tamanho especificado", () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const result = chunkArray(array, 3);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    });

    it("retorna chunks incompleto no final", () => {
      const array = [1, 2, 3, 4, 5];
      const result = chunkArray(array, 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it("retorna array vazio se input é null", () => {
      expect(chunkArray(null, 3)).toEqual([]);
    });

    it("retorna array vazio se input é undefined", () => {
      expect(chunkArray(undefined, 3)).toEqual([]);
    });

    it("retorna chunks com tamanho 6 para fotos", () => {
      const array = Array.from({ length: 13 }, (_, i) => `foto${i}`);
      const result = chunkArray(array, 6);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(6);
      expect(result[1]).toHaveLength(6);
      expect(result[2]).toHaveLength(1);
    });
  });

  describe("calculateTotalPages", () => {
    it("calcula total correto para configuração básica", () => {
      const total = calculateTotalPages({
        temControleLigante: false,
        temAcoesCorretivas: false,
        temMedicaoUsina: false,
        photoChunksLength: 0,
      });
      expect(total).toBe(2); // Página 1 + Página 2
    });

    it("inclui página de ligante quando temControleLigante=true", () => {
      const total = calculateTotalPages({
        temControleLigante: true,
        temAcoesCorretivas: false,
        temMedicaoUsina: false,
        photoChunksLength: 0,
      });
      expect(total).toBe(3);
    });

    it("inclui página de ações corretivas quando temAcoesCorretivas=true", () => {
      const total = calculateTotalPages({
        temControleLigante: false,
        temAcoesCorretivas: true,
        temMedicaoUsina: false,
        photoChunksLength: 0,
      });
      expect(total).toBe(3);
    });

    it("inclui página de medição quando temMedicaoUsina=true", () => {
      const total = calculateTotalPages({
        temControleLigante: false,
        temAcoesCorretivas: false,
        temMedicaoUsina: true,
        photoChunksLength: 0,
      });
      expect(total).toBe(3);
    });

    it("inclui páginas de fotos quando photoChunksLength > 0", () => {
      const total = calculateTotalPages({
        temControleLigante: false,
        temAcoesCorretivas: false,
        temMedicaoUsina: false,
        photoChunksLength: 3,
      });
      expect(total).toBe(5); // 2 + 3 fotos
    });

    it("calcula total com todas as seções ativas", () => {
      const total = calculateTotalPages({
        temControleLigante: true,
        temAcoesCorretivas: true,
        temMedicaoUsina: true,
        photoChunksLength: 2,
      });
      expect(total).toBe(7); // 2 + 1 + 1 + 1 + 2
    });
  });

  describe("calculatePhotoPageNumber", () => {
    it("calcula número de página corretamente para primeira foto", () => {
      const pageNum = calculatePhotoPageNumber(0, {
        temControleLigante: false,
        temAcoesCorretivas: false,
        temMedicaoUsina: false,
      });
      expect(pageNum).toBe(3);
    });

    it("incrementa página com ligante ativo", () => {
      const pageNum = calculatePhotoPageNumber(0, {
        temControleLigante: true,
        temAcoesCorretivas: false,
        temMedicaoUsina: false,
      });
      expect(pageNum).toBe(4);
    });

    it("incrementa página com ações corretivas", () => {
      const pageNum = calculatePhotoPageNumber(0, {
        temControleLigante: false,
        temAcoesCorretivas: true,
        temMedicaoUsina: false,
      });
      expect(pageNum).toBe(4);
    });

    it("incrementa para múltiplos chunks de foto", () => {
      const pageNum0 = calculatePhotoPageNumber(0, {
        temControleLigante: false,
        temAcoesCorretivas: false,
        temMedicaoUsina: false,
      });
      const pageNum1 = calculatePhotoPageNumber(1, {
        temControleLigante: false,
        temAcoesCorretivas: false,
        temMedicaoUsina: false,
      });
      expect(pageNum1).toBe(pageNum0 + 1);
    });
  });

  describe("calculateAcoesPageNumber", () => {
    it("retorna página 3 sem ligante", () => {
      expect(calculateAcoesPageNumber({ temControleLigante: false })).toBe(3);
    });

    it("retorna página 4 com ligante", () => {
      expect(calculateAcoesPageNumber({ temControleLigante: true })).toBe(4);
    });
  });

  describe("formatResultado", () => {
    it("retorna '-' se dados nulos", () => {
      expect(formatResultado(null)).toBe("-");
      expect(formatResultado(undefined)).toBe("-");
    });

    it("formata array de resultados com um valor", () => {
      const resultado = formatResultado({
        resultados: [5.5],
      });
      expect(resultado).toBe("5.5");
    });

    it("junta múltiplos resultados com '/'", () => {
      const resultado = formatResultado({
        resultados: [5.5, 6.0, 5.8],
      });
      expect(resultado).toBe("5.5 / 6.0 / 5.8");
    });

    it("ignora valores null/undefined no array", () => {
      const resultado = formatResultado({
        resultados: [5.5, null, 6.0, undefined],
      });
      expect(resultado).toBe("5.5 / 6.0");
    });

    it("retorna '-' se array vazio", () => {
      expect(formatResultado({ resultados: [] })).toBe("-");
    });

    it("retorna '-' se todos valores null/undefined", () => {
      expect(formatResultado({ resultados: [null, undefined] })).toBe("-");
    });

    it("usa campo resultado se não há array", () => {
      expect(formatResultado({ resultado: 5.5 })).toBe(5.5);
    });

    it("prioriza array sobre resultado único", () => {
      const resultado = formatResultado({
        resultados: [5.5, 6.0],
        resultado: 5.7,
      });
      expect(resultado).toBe("5.5 / 6.0");
    });
  });
});