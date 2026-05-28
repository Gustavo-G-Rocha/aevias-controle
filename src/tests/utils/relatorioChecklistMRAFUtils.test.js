import { describe, it, expect } from "vitest";
import {
  createPhotoPages,
  shouldShowActionsPage,
  formatReportDate,
} from "@/utils/relatorioChecklistMRAFUtils";

describe("relatorioChecklistMRAFUtils", () => {
  describe("createPhotoPages", () => {
    it("agrupa fotos em páginas de 6 cada", () => {
      const photos = Array.from({ length: 13 }, (_, i) => `foto${i}.jpg`);
      const result = createPhotoPages(photos);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(6);
      expect(result[1]).toHaveLength(6);
      expect(result[2]).toHaveLength(1);
    });

    it("retorna array vazio se fotos null", () => {
      expect(createPhotoPages(null)).toEqual([]);
    });

    it("retorna array vazio se fotos undefined", () => {
      expect(createPhotoPages(undefined)).toEqual([]);
    });

    it("retorna array vazio se fotos vazias", () => {
      expect(createPhotoPages([])).toEqual([]);
    });

    it("agrupa com tamanho customizado", () => {
      const photos = Array.from({ length: 10 }, (_, i) => `foto${i}.jpg`);
      const result = createPhotoPages(photos, 4);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(4);
      expect(result[2]).toHaveLength(2);
    });

    it("mantém URLs intactas em cada página", () => {
      const photos = ["url1", "url2", "url3"];
      const result = createPhotoPages(photos);
      expect(result[0]).toEqual(["url1", "url2", "url3"]);
    });
  });

  describe("shouldShowActionsPage", () => {
    it("retorna true com ações corretivas e descrição", () => {
      const checklist = {
        acoes_corretivas_realizado: true,
        acoes_corretivas_descricao: "Descrição da ação",
      };
      expect(shouldShowActionsPage(checklist)).toBe(true);
    });

    it("retorna false sem descrição mesmo com realizado=true", () => {
      const checklist = {
        acoes_corretivas_realizado: true,
        acoes_corretivas_descricao: null,
      };
      expect(shouldShowActionsPage(checklist)).toBe(false);
    });

    it("retorna true com não conformidades", () => {
      const checklist = {
        acoes_corretivas_realizado: false,
        nao_conformidades: [{ local_nc: "Campo 1" }],
      };
      expect(shouldShowActionsPage(checklist)).toBe(true);
    });

    it("retorna false sem ações nem não conformidades", () => {
      const checklist = {
        acoes_corretivas_realizado: false,
        nao_conformidades: [],
      };
      expect(shouldShowActionsPage(checklist)).toBe(false);
    });

    it("retorna false com checklist null", () => {
      expect(shouldShowActionsPage(null)).toBe(false);
    });

    it("retorna false com checklist undefined", () => {
      expect(shouldShowActionsPage(undefined)).toBe(false);
    });

    it("retorna true com ambas ações e não conformidades", () => {
      const checklist = {
        acoes_corretivas_realizado: true,
        acoes_corretivas_descricao: "Ação",
        nao_conformidades: [{ local_nc: "NC1" }],
      };
      expect(shouldShowActionsPage(checklist)).toBe(true);
    });
  });

  describe("formatReportDate", () => {
    it("formata data ISO para pt-BR", () => {
      const result = formatReportDate("2026-05-28");
      expect(result).toBe("28/5/2026");
    });

    it("retorna '-' se data null", () => {
      expect(formatReportDate(null)).toBe("-");
    });

    it("retorna '-' se data undefined", () => {
      expect(formatReportDate(undefined)).toBe("-");
    });

    it("retorna '-' se data inválida", () => {
      expect(formatReportDate("data-invalida")).toBe("-");
    });

    it("formata data com timestamp", () => {
      const result = formatReportDate("2026-05-28T10:30:00");
      expect(result).toContain("28");
      expect(result).toContain("5");
      expect(result).toContain("2026");
    });
  });
});