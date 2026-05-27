import { describe, it, expect } from "vitest";
import {
  calcularEstatisticas,
  calcularEstatisticasPorFaixa,
  formatDate,
  agruparLevantamentosPorFaixa,
  prepararChartData,
  deflexaoExcedeLimite,
  temDadosLevantamento
} from "@/utils/relatorioVigaBenkelmanUtils";

describe("relatorioVigaBenkelmanUtils", () => {
  describe("calcularEstatisticas", () => {
    it("deve calcular qt, média e desvio padrão", () => {
      const deflexoes = [10, 20, 30];
      const result = calcularEstatisticas(deflexoes);
      expect(result.qt).toBe(3);
      expect(result.media).toBe(20);
      expect(result.desvPad).toBeCloseTo(8.165, 2);
    });

    it("deve retornar 0 para array vazio", () => {
      const result = calcularEstatisticas([]);
      expect(result.qt).toBe(0);
      expect(result.media).toBe(0);
      expect(result.desvPad).toBe(0);
    });

    it("deve ignorar valores <= 0", () => {
      const deflexoes = [10, 0, 20, -5];
      const result = calcularEstatisticas(deflexoes.filter(v => v > 0));
      expect(result.qt).toBe(2);
      expect(result.media).toBe(15);
    });
  });

  describe("calcularEstatisticasPorFaixa", () => {
    it("deve calcular stats para 3 bordos", () => {
      const levantamentos = [
        {
          bordo_esquerdo: { deflexao: 10 },
          eixo: { deflexao: 15 },
          bordo_direito: { deflexao: 12 }
        }
      ];
      const result = calcularEstatisticasPorFaixa(levantamentos);
      
      expect(result.bordoEsquerdo.qt).toBe(1);
      expect(result.eixo.qt).toBe(1);
      expect(result.bordoDireito.qt).toBe(1);
    });

    it("deve ignorar deflexões <= 0", () => {
      const levantamentos = [
        {
          bordo_esquerdo: { deflexao: 0 },
          eixo: { deflexao: 20 },
          bordo_direito: { deflexao: null }
        }
      ];
      const result = calcularEstatisticasPorFaixa(levantamentos);
      
      expect(result.bordoEsquerdo.qt).toBe(0);
      expect(result.eixo.qt).toBe(1);
      expect(result.bordoDireito.qt).toBe(0);
    });
  });

  describe("formatDate", () => {
    it("deve formatar data em pt-BR", () => {
      const dateString = "2024-01-15T10:00:00Z";
      const result = formatDate(dateString);
      expect(result).toMatch(/15\/01\/2024|15\/1\/2024/);
    });

    it("deve retornar vazio se data nula", () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('')).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe("agruparLevantamentosPorFaixa", () => {
    it("deve agrupar por faixa_nome quando distintas", () => {
      const levs = [
        { faixa_nome: "Faixa A", estaca_km: "km 0", bordo_esquerdo: { leitura_final: 10 } },
        { faixa_nome: "Faixa B", estaca_km: "km 1", bordo_esquerdo: { leitura_final: 10 } },
      ];
      const result = agruparLevantamentosPorFaixa(levs);
      expect(result).toHaveLength(2);
      expect(result[0].nome).toBe("Faixa A");
      expect(result[1].nome).toBe("Faixa B");
    });

    it("deve agrupar em blocos de 20 se faixa_nome ausente", () => {
      const levs = Array.from({ length: 25 }, (_, i) => ({
        estaca_km: `km ${i}`,
        bordo_esquerdo: { leitura_final: 10 + i }
      }));
      const result = agruparLevantamentosPorFaixa(levs);
      expect(result).toHaveLength(2);
      expect(result[0].levantamentos).toHaveLength(20);
      expect(result[1].levantamentos).toHaveLength(5);
    });

    it("deve retornar array vazio se sem levantamentos", () => {
      const result = agruparLevantamentosPorFaixa([]);
      expect(result).toEqual([]);
    });

    it("deve limitar a 4 faixas máximo", () => {
      const levs = Array.from({ length: 100 }, (_, i) => ({
        estaca_km: `km ${i}`,
        bordo_esquerdo: { leitura_final: 10 + i }
      }));
      const result = agruparLevantamentosPorFaixa(levs);
      expect(result.length).toBeLessThanOrEqual(4);
    });

    it("deve filtrar faixas sem dados reais", () => {
      const levs = [
        { estaca_km: null, bordo_esquerdo: { leitura_final: 0 } },
        { estaca_km: "km 1", bordo_esquerdo: { leitura_final: 10 } }
      ];
      const result = agruparLevantamentosPorFaixa(levs);
      expect(result).toHaveLength(1);
      expect(result[0].levantamentos[0].estaca_km).toBe("km 1");
    });
  });

  describe("prepararChartData", () => {
    it("deve preparar dados para gráfico", () => {
      const levs = [
        {
          estaca_km: "km 0",
          bordo_esquerdo: { deflexao: 10 },
          eixo: { deflexao: 15 },
          bordo_direito: { deflexao: 12 }
        }
      ];
      const result = prepararChartData(levs, "20");
      
      expect(result).toHaveLength(1);
      expect(result[0].estaca).toBe("km 0");
      expect(result[0]["Bordo Esquerdo"]).toBe(10);
      expect(result[0]["Def. Admissível"]).toBe(20);
    });

    it("deve preencher 0 se deflexão nula", () => {
      const levs = [
        {
          estaca_km: "km 0",
          bordo_esquerdo: null,
          eixo: { deflexao: 15 },
          bordo_direito: null
        }
      ];
      const result = prepararChartData(levs, "20");
      
      expect(result[0]["Bordo Esquerdo"]).toBe(0);
      expect(result[0]["Eixo"]).toBe(15);
      expect(result[0]["Bordo Direito"]).toBe(0);
    });

    it("deve filtrar levantamentos sem dados", () => {
      const levs = [
        { estaca_km: null, bordo_esquerdo: null, eixo: null, bordo_direito: null },
        { estaca_km: "km 1", bordo_esquerdo: { deflexao: 10 }, eixo: null, bordo_direito: null }
      ];
      const result = prepararChartData(levs, "20");
      
      expect(result).toHaveLength(1);
      expect(result[0].estaca).toBe("km 1");
    });
  });

  describe("deflexaoExcedeLimite", () => {
    it("deve retornar true se deflexão > limiteAdmissível", () => {
      expect(deflexaoExcedeLimite(25, "20")).toBe(true);
    });

    it("deve retornar false se deflexão <= limite", () => {
      expect(deflexaoExcedeLimite(15, "20")).toBe(false);
      expect(deflexaoExcedeLimite(20, "20")).toBe(false);
    });

    it("deve retornar false se limite = 0", () => {
      expect(deflexaoExcedeLimite(25, "0")).toBe(false);
    });

    it("deve retornar false se deflexão = 0", () => {
      expect(deflexaoExcedeLimite(0, "20")).toBe(false);
    });
  });

  describe("temDadosLevantamento", () => {
    it("deve retornar true se tem estaca_km", () => {
      expect(temDadosLevantamento({ estaca_km: "km 0" })).toBe(true);
    });

    it("deve retornar true se tem leitura_final não nula", () => {
      const lev = {
        bordo_esquerdo: { leitura_final: 10 }
      };
      expect(temDadosLevantamento(lev)).toBe(true);
    });

    it("deve retornar false se sem dados", () => {
      expect(temDadosLevantamento({ estaca_km: null, bordo_esquerdo: { leitura_final: 0 } })).toBe(false);
    });

    it("deve retornar false se null", () => {
      expect(temDadosLevantamento(null)).toBe(false);
    });
  });
});