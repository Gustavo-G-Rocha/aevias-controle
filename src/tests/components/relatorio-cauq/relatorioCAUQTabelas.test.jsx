import { describe, it, expect } from "vitest";
import React from "react";

/**
 * Testes para RelatorioCAUQTabelas
 * Ambiente node (sem jsdom) — testes de lógica pura + importabilidade
 */

describe("subcomponentes de RelatorioCAUQTabelas", () => {
  describe("CellsCP importável", () => {
    it("módulo CellsCP existe e é função", async () => {
      const mod = await import("@/components/relatorio-cauq/tabelas/CellsCP");
      expect(typeof mod.default).toBe("function");
    });
  });

  describe("MarshallRowSimples importável", () => {
    it("módulo MarshallRowSimples existe e é função", async () => {
      const mod = await import("@/components/relatorio-cauq/tabelas/MarshallRowSimples");
      expect(typeof mod.default).toBe("function");
    });
  });

  describe("MarshallSecaoRTCDEstabilidade importável", () => {
    it("módulo MarshallSecaoRTCDEstabilidade existe e é função", async () => {
      const mod = await import("@/components/relatorio-cauq/tabelas/MarshallSecaoRTCDEstabilidade");
      expect(typeof mod.default).toBe("function");
    });
  });

  describe("RelatorioCAUQTabelas principal importável", () => {
    it("módulo RelatorioCAUQTabelas existe e é função", async () => {
      const mod = await import("@/components/relatorio-cauq/RelatorioCAUQTabelas");
      expect(typeof mod.default).toBe("function");
    });
  });
});

// ── Testes de lógica pura de dados ──────────────────────────────────────────
describe("lógica de dados para tabelas Marshall", () => {
  describe("agrupamento de CPs válidos", () => {
    it("slice(0, 6) retorna até 6 CPs", () => {
      const corposProva = [
        { numero: 1 },
        { numero: 2 },
        { numero: 3 },
        { numero: 4 },
        { numero: 5 },
        { numero: 6 },
        { numero: 7 }, // será removido
      ];
      const cpsValidos = corposProva.slice(0, 6);
      expect(cpsValidos).toHaveLength(6);
      expect(cpsValidos[5].numero).toBe(6);
    });

    it("retorna [] se corposProva vazio", () => {
      const cpsValidos = [].slice(0, 6);
      expect(cpsValidos).toEqual([]);
    });
  });

  describe("cálculo de média de campo", () => {
    it("calcula média de densidade_aparente", () => {
      const cpsValidos = [
        { densidade_aparente: 2.4 },
        { densidade_aparente: 2.5 },
        { densidade_aparente: 2.6 },
      ];
      const soma = cpsValidos.reduce((sum, cp) => sum + (parseFloat(cp.densidade_aparente) || 0), 0);
      const media = (soma / cpsValidos.length).toFixed(2);
      expect(media).toBe("2.50");
    });

    it("ignora valores undefined/null na média", () => {
      const cpsValidos = [
        { vam: 15 },
        { vam: null },
        { vam: 17 },
      ];
      const validVals = cpsValidos
        .map((cp) => parseFloat(cp.vam))
        .filter((v) => !isNaN(v) && v != null);
      const media = (validVals.reduce((a, b) => a + b, 0) / validVals.length).toFixed(2);
      expect(media).toBe("16.00");
    });
  });

  describe("detecção de dados RTCD/Estabilidade", () => {
    it("detecta RTCD se algum CP tem rtcd_leitura", () => {
      const cpsValidos = [
        { rtcd_leitura: null },
        { rtcd_leitura: 10 },
        { rtcd_leitura: null },
      ];
      const temRTCD = cpsValidos.some((cp) => cp?.rtcd_leitura != null && cp?.rtcd_leitura !== "");
      expect(temRTCD).toBe(true);
    });

    it("detecta Estabilidade se algum CP tem estabilidade_leitura", () => {
      const cpsValidos = [
        { estabilidade_leitura: null },
        { estabilidade_leitura: "" },
        { estabilidade_leitura: 20 },
      ];
      const temEst = cpsValidos.some(
        (cp) => cp?.estabilidade_leitura != null && cp?.estabilidade_leitura !== ""
      );
      expect(temEst).toBe(true);
    });
  });
});

// ── Testes de conformidade de dados ─────────────────────────────────────────
describe("conformidade de dados com limites", () => {
  describe("validação de granulometria", () => {
    it("detecta % passante fora da faixa de trabalho", () => {
      const dado = {
        percentualPassante: 35,
        faixaTrabalhoMin: 40,
        faixaTrabalhoMax: 60,
      };
      const foraFaixa =
        parseFloat(dado.percentualPassante) < parseFloat(dado.faixaTrabalhoMin) ||
        parseFloat(dado.percentualPassante) > parseFloat(dado.faixaTrabalhoMax);
      expect(foraFaixa).toBe(true);
    });

    it("aceita % passante dentro da faixa", () => {
      const dado = {
        percentualPassante: 50,
        faixaTrabalhoMin: 40,
        faixaTrabalhoMax: 60,
      };
      const foraFaixa =
        parseFloat(dado.percentualPassante) < parseFloat(dado.faixaTrabalhoMin) ||
        parseFloat(dado.percentualPassante) > parseFloat(dado.faixaTrabalhoMax);
      expect(foraFaixa).toBe(false);
    });
  });

  describe("validação de volume de vazios Marshall", () => {
    it("valida volume_vazios contra limites do projeto", () => {
      const media = 3.5;
      const projeto = { volume_vazios: { min: 3.0, max: 5.0 } };
      const foraFaixa =
        parseFloat(media) < parseFloat(projeto.volume_vazios.min) ||
        parseFloat(media) > parseFloat(projeto.volume_vazios.max);
      expect(foraFaixa).toBe(false);
    });

    it("detecta volume_vazios abaixo do mínimo", () => {
      const media = 2.5;
      const projeto = { volume_vazios: { min: 3.0, max: 5.0 } };
      const abaixoMin = parseFloat(media) < parseFloat(projeto.volume_vazios.min);
      expect(abaixoMin).toBe(true);
    });
  });

  describe("validação de teor de ligante", () => {
    it("valida teor_ligante extraído", () => {
      const teorLigante = 5.5;
      const projeto = { teor_ligante: { min: 5.0, max: 6.0 } };
      const foraFaixa =
        parseFloat(teorLigante) < parseFloat(projeto.teor_ligante.min) ||
        parseFloat(teorLigante) > parseFloat(projeto.teor_ligante.max);
      expect(foraFaixa).toBe(false);
    });

    it("detecta teor_ligante acima do máximo", () => {
      const teorLigante = 6.5;
      const projeto = { teor_ligante: { min: 5.0, max: 6.0 } };
      const foraFaixa =
        parseFloat(teorLigante) < parseFloat(projeto.teor_ligante.min) ||
        parseFloat(teorLigante) > parseFloat(projeto.teor_ligante.max);
      expect(foraFaixa).toBe(true);
    });
  });
});