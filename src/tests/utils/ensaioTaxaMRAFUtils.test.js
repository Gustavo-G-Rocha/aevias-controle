import { describe, it, expect } from "vitest";
import {
  getEnsaioInicial,
  calcularEnsaio,
  calcularMedias,
  isNaoConforme,
  calcularAreaBandeja,
  formatarTaxa,
  formatarPeso
} from "@/utils/ensaioTaxaMRAFUtils";

describe("ensaioTaxaMRAFUtils", () => {
  describe("getEnsaioInicial", () => {
    it("deve retornar template vazio com número", () => {
      const result = getEnsaioInicial(1);
      expect(result.numero).toBe(1);
      expect(result.estaca).toBe("");
      expect(result.taxa_mraf_aplicada).toBeNull();
    });

    it("deve retornar templates diferentes para números diferentes", () => {
      const e1 = getEnsaioInicial(1);
      const e2 = getEnsaioInicial(2);
      expect(e1.numero).toBe(1);
      expect(e2.numero).toBe(2);
    });
  });

  describe("calcularEnsaio", () => {
    it("deve calcular peso da amostra: PA = P1 - P2", () => {
      const ensaio = { numero: 1, peso_bandeja_amostra: 150, peso_bandeja: 50 };
      const result = calcularEnsaio(ensaio, 0.1);
      expect(result.peso_amostra).toBe(100);
    });

    it("deve calcular taxa MRAF: Tx = PA / (1000 * A)", () => {
      const ensaio = {
        numero: 1,
        peso_bandeja_amostra: 150,
        peso_bandeja: 50
      };
      const result = calcularEnsaio(ensaio, 0.1);
      // PA = 100, Tx = 100 / (1000 * 0.1) = 100 / 100 = 1.0
      expect(result.taxa_mraf_aplicada).toBe(1);
    });

    it("deve calcular taxa ligante: TL = (Tx * L) / (100 + L)", () => {
      const ensaio = {
        numero: 1,
        peso_bandeja_amostra: 150,
        peso_bandeja: 50,
        teor_ligante: 5
      };
      const result = calcularEnsaio(ensaio, 0.1);
      // Tx = 1.0, TL = (1.0 * 5) / (100 + 5) = 5 / 105 ≈ 0.048
      expect(result.taxa_ligante).toBeCloseTo(0.048, 2);
    });

    it("deve calcular taxa emulsão: TE = TL / R", () => {
      const ensaio = {
        numero: 1,
        peso_bandeja_amostra: 150,
        peso_bandeja: 50,
        teor_ligante: 5,
        residuo_emulsao: 65
      };
      const result = calcularEnsaio(ensaio, 0.1);
      // TL ≈ 0.048, TE = 0.048 / (65/100) = 0.048 / 0.65 ≈ 0.074
      expect(result.taxa_emulsao).toBeCloseTo(0.074, 2);
    });

    it("deve calcular taxa agregado: TA = Tx - TL", () => {
      const ensaio = {
        numero: 1,
        peso_bandeja_amostra: 150,
        peso_bandeja: 50,
        teor_ligante: 5,
        residuo_emulsao: 65
      };
      const result = calcularEnsaio(ensaio, 0.1);
      // Tx = 1.0, TL ≈ 0.048, TA = 1.0 - 0.048 ≈ 0.952
      expect(result.taxa_agregado).toBeCloseTo(0.952, 2);
    });

    it("não deve calcular se faltarem valores", () => {
      const ensaio = { numero: 1, peso_bandeja_amostra: null, peso_bandeja: 50 };
      const result = calcularEnsaio(ensaio, 0.1);
      expect(result.peso_amostra).toBeNull();
      expect(result.taxa_mraf_aplicada).toBeNull();
    });

    it("não deve calcular taxa emulsão se residuo for zero", () => {
      const ensaio = {
        numero: 1,
        peso_bandeja_amostra: 150,
        peso_bandeja: 50,
        teor_ligante: 5,
        residuo_emulsao: 0
      };
      const result = calcularEnsaio(ensaio, 0.1);
      expect(result.taxa_emulsao).toBeNull();
    });
  });

  describe("calcularMedias", () => {
    it("deve calcular médias corretamente", () => {
      const ensaios = [
        { taxa_mraf_aplicada: 1.0, taxa_emulsao: 0.1, taxa_agregado: 0.9 },
        { taxa_mraf_aplicada: 2.0, taxa_emulsao: 0.2, taxa_agregado: 1.8 }
      ];
      const result = calcularMedias(ensaios);
      expect(result.media_taxa_mraf).toBe(1.5);
      expect(result.media_taxa_emulsao).toBe(0.15);
      expect(result.media_taxa_agregado).toBe(1.35);
    });

    it("deve retornar null se não houver ensaios válidos", () => {
      const ensaios = [{ taxa_mraf_aplicada: null }];
      const result = calcularMedias(ensaios);
      expect(result.media_taxa_mraf).toBeNull();
    });

    it("deve ignorar ensaios sem taxa emulsão ao calcular média", () => {
      const ensaios = [
        { taxa_mraf_aplicada: 1.0, taxa_emulsao: 0.1, taxa_agregado: 0.9 },
        { taxa_mraf_aplicada: 2.0, taxa_emulsao: null, taxa_agregado: 1.8 }
      ];
      const result = calcularMedias(ensaios);
      expect(result.media_taxa_emulsao).toBe(0.1);
    });

    it("deve retornar null para arrays vazios", () => {
      const result = calcularMedias([]);
      expect(result.media_taxa_mraf).toBeNull();
    });
  });

  describe("isNaoConforme", () => {
    it("deve retornar true se taxa < mínima", () => {
      expect(isNaoConforme(11.5, 12)).toBe(true);
    });

    it("deve retornar false se taxa >= mínima", () => {
      expect(isNaoConforme(12, 12)).toBe(false);
      expect(isNaoConforme(13, 12)).toBe(false);
    });

    it("deve retornar false se taxa mínima for null", () => {
      expect(isNaoConforme(10, null)).toBe(false);
    });

    it("deve retornar false se taxa for null", () => {
      expect(isNaoConforme(null, 12)).toBe(false);
    });
  });

  describe("calcularAreaBandeja", () => {
    it("deve calcular área em m² de dimensões em cm", () => {
      // A = (50 * 50) / 10000 = 2500 / 10000 = 0.25 m²
      const result = calcularAreaBandeja(50, 50);
      expect(result).toBe(0.25);
    });

    it("deve retornar null se faltarem dimensões", () => {
      expect(calcularAreaBandeja(null, 50)).toBeNull();
      expect(calcularAreaBandeja(50, null)).toBeNull();
      expect(calcularAreaBandeja(null, null)).toBeNull();
    });

    it("deve formatar com 4 casas decimais", () => {
      const result = calcularAreaBandeja(12.5, 15.75);
      expect(result).toBe(0.0197);
    });
  });

  describe("formatarTaxa", () => {
    it("deve formatar com 1 casa decimal", () => {
      expect(formatarTaxa(1.456)).toBe("1.5");
      expect(formatarTaxa(0.04)).toBe("0.0");
    });

    it("deve retornar - se null", () => {
      expect(formatarTaxa(null)).toBe('-');
      expect(formatarTaxa(undefined)).toBe('-');
    });
  });

  describe("formatarPeso", () => {
    it("deve formatar com 2 casas decimais", () => {
      expect(formatarPeso(100.123)).toBe("100.12");
      expect(formatarPeso(50.1)).toBe("50.10");
    });

    it("deve retornar - se null", () => {
      expect(formatarPeso(null)).toBe('-');
      expect(formatarPeso(undefined)).toBe('-');
    });
  });
});