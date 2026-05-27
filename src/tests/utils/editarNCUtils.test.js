import { describe, it, expect } from "vitest";
import {
  extractNCIdFromUrl,
  initializeNCForm,
  validateNCForm,
  buildNCUpdatePayload,
  removePhotoByIndex,
  removePdfByIndex,
  hasRejectionReason,
} from "@/utils/editarNCUtils";

describe("editarNCUtils", () => {

  describe("initializeNCForm", () => {
    it("deve inicializar form com dados da NC", () => {
      const nc = {
        numero_rnc: "RNC-001",
        cliente: "Cliente X",
        rodovia: "BR-101",
        data_nc: "2024-05-01",
      };
      const form = initializeNCForm(nc);
      expect(form.numero_rnc).toBe("RNC-001");
      expect(form.cliente).toBe("Cliente X");
      expect(form.rodovia).toBe("BR-101");
    });

    it("deve preencher campos vazios com string vazia", () => {
      const nc = { id: "1" };
      const form = initializeNCForm(nc);
      expect(form.numero_rnc).toBe("");
      expect(form.cliente).toBe("");
    });
  });

  describe("validateNCForm", () => {
    it("deve retornar true com data_nc e descricao_nc", () => {
      const form = {
        data_nc: "2024-05-01",
        descricao_nc: "Descrição válida",
      };
      expect(validateNCForm(form)).toBe(true);
    });

    it("deve retornar false sem data_nc", () => {
      const form = {
        data_nc: "",
        descricao_nc: "Descrição válida",
      };
      expect(validateNCForm(form)).toBe(false);
    });

    it("deve retornar false sem descricao_nc", () => {
      const form = {
        data_nc: "2024-05-01",
        descricao_nc: "",
      };
      expect(validateNCForm(form)).toBe(false);
    });

    it("deve retornar false sem ambos os campos", () => {
      const form = {
        data_nc: "",
        descricao_nc: "",
      };
      expect(validateNCForm(form)).toBe(false);
    });
  });

  describe("buildNCUpdatePayload", () => {
    it("deve construir payload corretamente", () => {
      const form = { numero_rnc: "RNC-001" };
      const fotos = ["foto1.jpg"];
      const pdfs = [{ nome: "doc.pdf", url: "url" }];

      const payload = buildNCUpdatePayload(form, fotos, pdfs);
      expect(payload.numero_rnc).toBe("RNC-001");
      expect(payload.fotos).toEqual(fotos);
      expect(payload.pdfs).toEqual(pdfs);
      expect(payload.pendente_aprovacao_cliente).toBe(true);
      expect(payload.cliente_aprovacao).toBeNull();
      expect(payload.cliente_reprovacao_motivo).toBeNull();
    });
  });

  describe("removePhotoByIndex", () => {
    it("deve remover foto pelo índice", () => {
      const fotos = ["foto1.jpg", "foto2.jpg", "foto3.jpg"];
      const result = removePhotoByIndex(fotos, 1);
      expect(result).toEqual(["foto1.jpg", "foto3.jpg"]);
    });

    it("deve retornar array vazio se única foto removida", () => {
      const fotos = ["foto1.jpg"];
      const result = removePhotoByIndex(fotos, 0);
      expect(result).toEqual([]);
    });
  });

  describe("removePdfByIndex", () => {
    it("deve remover PDF pelo índice", () => {
      const pdfs = [
        { nome: "doc1.pdf", url: "url1" },
        { nome: "doc2.pdf", url: "url2" },
      ];
      const result = removePdfByIndex(pdfs, 0);
      expect(result).toEqual([{ nome: "doc2.pdf", url: "url2" }]);
    });
  });

  describe("hasRejectionReason", () => {
    it("deve retornar true se NC tem motivo de reprovação", () => {
      const nc = { cliente_reprovacao_motivo: "Motivo X" };
      expect(hasRejectionReason(nc)).toBe(true);
    });

    it("deve retornar false se não tem motivo", () => {
      const nc = { cliente_reprovacao_motivo: null };
      expect(hasRejectionReason(nc)).toBe(false);
    });

    it("deve retornar false se NC é null", () => {
      expect(hasRejectionReason(null)).toBe(false);
    });
  });
});