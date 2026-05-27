import { describe, it, expect } from "vitest";
import {
  fmtDate,
  fmtN,
  fmtDateTime,
  agruparEmSeries,
  resistenciaExemplar,
  getValorLinha,
  calcularTotalColunas,
} from "@/utils/relatorioRompimentoConcretoUtils";

describe("relatorioRompimentoConcretoUtils", () => {
  describe("fmtDate", () => {
    it("deve formatar data YYYY-MM-DD", () => {
      const result = fmtDate("2026-05-27");
      expect(result).toMatch(/27\/0?5\/2026/);
    });

    it("deve retornar '-' se null", () => {
      expect(fmtDate(null)).toBe("-");
      expect(fmtDate(undefined)).toBe("-");
    });

    it("deve formatar ISO datetime", () => {
      const result = fmtDate("2026-05-27T14:30:00Z");
      expect(result).toContain("2026");
    });
  });

  describe("fmtN", () => {
    it("deve formatar número com 2 casas decimais", () => {
      expect(fmtN(10.456)).toBe("10.46");
      expect(fmtN(10.1)).toBe("10.10");
    });

    it("deve formatar com casas decimais customizadas", () => {
      expect(fmtN(10.456, 3)).toBe("10.456");
      expect(fmtN(10.456, 1)).toBe("10.5");
    });

    it("deve retornar '-' se null", () => {
      expect(fmtN(null)).toBe("-");
      expect(fmtN(undefined)).toBe("-");
      expect(fmtN("abc")).toBe("-");
    });
  });

  describe("fmtDateTime", () => {
    it("deve formatar datetime com timezone", () => {
      const result = fmtDateTime("2026-05-27T14:30:00");
      expect(result).toMatch(/27/);
      expect(result).toMatch(/2026/);
    });

    it("deve retornar '-' se null", () => {
      expect(fmtDateTime(null)).toBe("-");
      expect(fmtDateTime(undefined)).toBe("-");
    });
  });

  describe("agruparEmSeries", () => {
    it("deve agrupar em pares", () => {
      const cps = [
        { numero_cp: 1 },
        { numero_cp: 2 },
        { numero_cp: 3 },
      ];
      const result = agruparEmSeries(cps);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(1);
    });

    it("deve retornar array vazio se input vazio", () => {
      expect(agruparEmSeries([])).toEqual([]);
      expect(agruparEmSeries(null)).toEqual([]);
    });

    it("deve agrupar 4 CPs em 2 séries", () => {
      const cps = [
        { numero_cp: 1 },
        { numero_cp: 2 },
        { numero_cp: 3 },
        { numero_cp: 4 },
      ];
      const result = agruparEmSeries(cps);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(2);
    });
  });

  describe("resistenciaExemplar", () => {
    it("deve retornar maior resistência da série", () => {
      const serie = [
        { resistencia: 25.5 },
        { resistencia: 28.3 },
      ];
      const result = resistenciaExemplar(serie);
      expect(result).toBe("28.30");
    });

    it("deve retornar '-' se série vazia", () => {
      expect(resistenciaExemplar([])).toBe("-");
      expect(resistenciaExemplar([{ resistencia: null }])).toBe("-");
    });

    it("deve filtrar valores inválidos", () => {
      const serie = [
        { resistencia: 25.5 },
        { resistencia: "abc" },
        { resistencia: 28.3 },
      ];
      const result = resistenciaExemplar(serie);
      expect(result).toBe("28.30");
    });
  });

  describe("getValorLinha", () => {
    it("deve retornar data formatada para DATA DA RUPTURA", () => {
      const cp = { data_ruptura: "2026-05-27" };
      const row = { label: "DATA DA RUPTURA" };
      const result = getValorLinha(row, cp);
      expect(result).toMatch(/27\/0?5\/2026/);
    });

    it("deve retornar carga formatada para CARGA DE RUPTURA", () => {
      const cp = { carga_ruptura: 25.456 };
      const row = { label: "CARGA DE RUPTURA" };
      const result = getValorLinha(row, cp);
      expect(result).toBe("25.46");
    });

    it("deve retornar string vazia se cp null", () => {
      const row = { label: "DATA DA RUPTURA" };
      const result = getValorLinha(row, null);
      expect(result).toBe("");
    });

    it("deve retornar null para RESIST. DO EXEMPLAR", () => {
      const cp = { resistencia: 28 };
      const row = { label: "RESIST. DO EXEMPLAR" };
      const result = getValorLinha(row, cp);
      expect(result).toBeNull();
    });
  });

  describe("calcularTotalColunas", () => {
    it("deve calcular total de colunas para séries", () => {
      const series = [[], []]; // 2 séries = 4 CPs
      const result = calcularTotalColunas(series);
      expect(result).toBe(4);
    });

    it("deve retornar mínimo 4", () => {
      expect(calcularTotalColunas([])).toBe(4);
      expect(calcularTotalColunas([{}])).toBe(4);
    });

    it("deve calcular para 3 séries = 6 colunas", () => {
      const series = [{}, {}, {}];
      const result = calcularTotalColunas(series);
      expect(result).toBe(6);
    });
  });
});