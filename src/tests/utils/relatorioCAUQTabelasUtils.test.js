import { describe, it, expect } from "vitest";
import {
  getPaddingClass,
  getTableFontSize,
  estáForaDaFaixa,
  estáAbaixoMin,
  estáForaDaFaixaMinMax,
  temDadosRTCD,
  temDadosEstabilidade,
  extrairConstPrensa,
  fmtNum,
} from "@/utils/relatorioCAUQTabelasUtils";

describe("relatorioCAUQTabelasUtils", () => {
  describe("getPaddingClass", () => {
    it("retorna px-0.5 py-0 quando realizar_marshall é true", () => {
      expect(getPaddingClass(true)).toBe("px-0.5 py-0");
    });

    it("retorna px-2 py-1.5 quando realizar_marshall é false", () => {
      expect(getPaddingClass(false)).toBe("px-2 py-1.5");
    });
  });

  describe("getTableFontSize", () => {
    it("retorna text-[7px] para Marshall (default)", () => {
      expect(getTableFontSize(true)).toBe("text-[7px]");
    });

    it("retorna text-[9px] sem Marshall (default)", () => {
      expect(getTableFontSize(false)).toBe("text-[9px]");
    });

    it("retorna text-[9px] para granulometria_header com Marshall", () => {
      expect(getTableFontSize(true, "granulometria_header")).toBe("text-[9px]");
    });

    it("retorna text-[11px] para extracao_header sem Marshall", () => {
      expect(getTableFontSize(false, "extracao_header")).toBe("text-[11px]");
    });
  });

  describe("estáForaDaFaixa", () => {
    it("retorna true se valor < min", () => {
      expect(estáForaDaFaixa(5, 10, 20)).toBe(true);
    });

    it("retorna true se valor > max", () => {
      expect(estáForaDaFaixa(25, 10, 20)).toBe(true);
    });

    it("retorna false se valor dentro da faixa", () => {
      expect(estáForaDaFaixa(15, 10, 20)).toBe(false);
    });

    it("retorna false se min ou max são null", () => {
      expect(estáForaDaFaixa(15, null, 20)).toBe(false);
      expect(estáForaDaFaixa(15, 10, null)).toBe(false);
    });

    it("retorna false se valor é null", () => {
      expect(estáForaDaFaixa(null, 10, 20)).toBe(false);
    });
  });

  describe("estáAbaixoMin", () => {
    it("retorna true se valor < min", () => {
      expect(estáAbaixoMin(5, 10)).toBe(true);
    });

    it("retorna false se valor >= min", () => {
      expect(estáAbaixoMin(10, 10)).toBe(false);
      expect(estáAbaixoMin(15, 10)).toBe(false);
    });

    it("retorna false se min é null", () => {
      expect(estáAbaixoMin(5, null)).toBe(false);
    });

    it("retorna false se valor é null", () => {
      expect(estáAbaixoMin(null, 10)).toBe(false);
    });
  });

  describe("estáForaDaFaixaMinMax", () => {
    it("retorna true se valor < min ou valor > max", () => {
      expect(estáForaDaFaixaMinMax(5, 10, 20)).toBe(true);
      expect(estáForaDaFaixaMinMax(25, 10, 20)).toBe(true);
    });

    it("retorna false se valor dentro [min, max]", () => {
      expect(estáForaDaFaixaMinMax(10, 10, 20)).toBe(false);
      expect(estáForaDaFaixaMinMax(15, 10, 20)).toBe(false);
      expect(estáForaDaFaixaMinMax(20, 10, 20)).toBe(false);
    });

    it("retorna false se min/max null", () => {
      expect(estáForaDaFaixaMinMax(15, null, 20)).toBe(false);
    });
  });

  describe("temDadosRTCD", () => {
    it("retorna true se algum CP tem rtcd_leitura não null", () => {
      const cps = [
        { rtcd_leitura: 10 },
        { rtcd_leitura: null },
      ];
      expect(temDadosRTCD(cps)).toBe(true);
    });

    it("retorna false se nenhum CP tem rtcd_leitura", () => {
      const cps = [{ rtcd_leitura: null }, { rtcd_leitura: "" }];
      expect(temDadosRTCD(cps)).toBe(false);
    });

    it("retorna false se array vazio", () => {
      expect(temDadosRTCD([])).toBe(false);
    });
  });

  describe("temDadosEstabilidade", () => {
    it("retorna true se algum CP tem estabilidade_leitura não null", () => {
      const cps = [{ estabilidade_leitura: 20 }, { estabilidade_leitura: null }];
      expect(temDadosEstabilidade(cps)).toBe(true);
    });

    it("retorna false se nenhum CP tem estabilidade_leitura", () => {
      const cps = [{ estabilidade_leitura: null }, { estabilidade_leitura: "" }];
      expect(temDadosEstabilidade(cps)).toBe(false);
    });
  });

  describe("extrairConstPrensa", () => {
    it("extrai const_prensa do primeiro CP e formata com 4 decimais", () => {
      const cps = [{ const_prensa: 1.2345 }, { const_prensa: 2 }];
      expect(extrairConstPrensa(cps)).toBe("1.2345");
    });

    it("retorna fallback 1.0000 se CP vazio", () => {
      expect(extrairConstPrensa([])).toBe("1.0000");
      expect(extrairConstPrensa(null)).toBe("1.0000");
    });

    it("retorna fallback 1.0000 se const_prensa null", () => {
      const cps = [{ const_prensa: null }];
      expect(extrairConstPrensa(cps)).toBe("1.0000");
    });

    it("retorna fallback se const_prensa inválido", () => {
      const cps = [{ const_prensa: "abc" }];
      expect(extrairConstPrensa(cps)).toBe("1.0000");
    });
  });

  describe("fmtNum", () => {
    it("formata número com decimais", () => {
      expect(fmtNum(10.456, 1)).toBe("10.5");
      expect(fmtNum(10.456, 2)).toBe("10.46");
    });

    it("retorna '-' se null", () => {
      expect(fmtNum(null)).toBe("-");
      expect(fmtNum(undefined)).toBe("-");
    });

    it("retorna '-' se string vazia", () => {
      expect(fmtNum("")).toBe("-");
    });

    it("retorna '-' se string não-numérica", () => {
      expect(fmtNum("abc")).toBe("-");
    });

    it("formata com 1 decimal por padrão", () => {
      expect(fmtNum(10.456)).toBe("10.5");
    });
  });
});