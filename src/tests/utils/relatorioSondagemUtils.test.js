import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateBrasilia,
  extrairCpsValidos,
  calcularLimitesGC,
  isForaLimitesGCProjeto,
  isForaLimitesGCRice,
  prepararDadosGrafico,
  formatarDensidade,
  formatarGC
} from "@/utils/relatorioSondagemUtils";

describe("relatorioSondagemUtils", () => {
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

  describe("formatDateBrasilia", () => {
    it("deve formatar data em Brasília (pt-BR)", () => {
      const dateString = "2024-01-15T10:00:00Z";
      const result = formatDateBrasilia(dateString);
      expect(result).toContain('2024');
    });

    it("deve retornar N/A se data nula", () => {
      expect(formatDateBrasilia(null)).toBe('N/A');
      expect(formatDateBrasilia('')).toBe('N/A');
    });

    it("deve normalizar data sem sufixo timezone", () => {
      const dateString = "2024-01-15T10:00:00";
      const result = formatDateBrasilia(dateString);
      expect(result).toContain('2024');
    });
  });

  describe("extrairCpsValidos", () => {
    it("deve extrair CPs com peso ou densidade ou leitura", () => {
      const cps = [
        { numero: 1, peso_ao_ar: 100 },
        { numero: 2, densidade: 2.0 },
        { numero: 3, leitura: 50 },
        { numero: 4 }
      ];
      const result = extrairCpsValidos(cps);
      expect(result).toHaveLength(3);
    });

    it("deve retornar array vazio se sem CPs válidos", () => {
      const cps = [{ numero: 1 }, { numero: 2 }];
      const result = extrairCpsValidos(cps);
      expect(result).toHaveLength(0);
    });

    it("deve retornar array vazio se null", () => {
      const result = extrairCpsValidos(null);
      expect(result).toHaveLength(0);
    });
  });

  describe("calcularLimitesGC", () => {
    it("deve retornar 97-101 para Capa/Reperfilagem", () => {
      const result = calcularLimitesGC("Capa/Reperfilagem");
      expect(result.min).toBe(97);
      expect(result.max).toBe(101);
    });

    it("deve retornar 95-101 para Remendos", () => {
      const result = calcularLimitesGC("Remendos");
      expect(result.min).toBe(95);
      expect(result.max).toBe(101);
    });

    it("deve retornar 0-0 para serviço desconhecido", () => {
      const result = calcularLimitesGC("Outro");
      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
    });
  });

  describe("isForaLimitesGCProjeto", () => {
    it("deve retornar true se valor < mínimo", () => {
      expect(isForaLimitesGCProjeto(96, "Capa/Reperfilagem")).toBe(true);
    });

    it("deve retornar true se valor > máximo", () => {
      expect(isForaLimitesGCProjeto(102, "Capa/Reperfilagem")).toBe(true);
    });

    it("deve retornar false se dentro dos limites", () => {
      expect(isForaLimitesGCProjeto(99, "Capa/Reperfilagem")).toBe(false);
    });

    it("deve retornar false se serviço sem limites", () => {
      expect(isForaLimitesGCProjeto(50, "Outro")).toBe(false);
    });

    it("deve retornar false se valor nulo", () => {
      expect(isForaLimitesGCProjeto(null, "Capa/Reperfilagem")).toBe(false);
    });
  });

  describe("isForaLimitesGCRice", () => {
    it("deve retornar true se valor < 92", () => {
      expect(isForaLimitesGCRice(91.9)).toBe(true);
    });

    it("deve retornar false se valor >= 92", () => {
      expect(isForaLimitesGCRice(92)).toBe(false);
      expect(isForaLimitesGCRice(100)).toBe(false);
    });

    it("deve retornar false se valor nulo", () => {
      expect(isForaLimitesGCRice(null)).toBe(false);
    });
  });

  describe("prepararDadosGrafico", () => {
    it("deve preparar dados do gráfico corretamente", () => {
      const ensaio = { servico: "Capa/Reperfilagem" };
      const cpsValidos = [
        { gc_dens_projeto: 99, gc_dens_rice_dia: 98, media_espessura: 5 },
        { gc_dens_projeto: 100, gc_dens_rice_dia: 99, media_espessura: 5.2 }
      ];
      const result = prepararDadosGrafico(ensaio, cpsValidos);
      
      expect(result.gcDensProjeto).toHaveLength(2);
      expect(result.gcDensRice).toHaveLength(2);
      expect(result.limiteMin).toBe(97);
      expect(result.limiteMax).toBe(101);
    });

    it("deve calcular escala dinâmica", () => {
      const ensaio = { servico: "Remendos", espessura_projeto: 5 };
      const cpsValidos = [
        { gc_dens_projeto: 96, gc_dens_rice_dia: 95, media_espessura: 5 }
      ];
      const result = prepararDadosGrafico(ensaio, cpsValidos);
      
      expect(result.minGCChart).toBeGreaterThanOrEqual(0);
      expect(result.maxGCChart).toBeGreaterThan(result.minGCChart);
    });
  });

  describe("formatarDensidade", () => {
    it("deve formatar densidade com 3 casas decimais", () => {
      expect(formatarDensidade(2.456789)).toBe("2.457");
    });

    it("deve retornar traço se nulo", () => {
      expect(formatarDensidade(null)).toBe('-');
      expect(formatarDensidade(undefined)).toBe('-');
    });
  });

  describe("formatarGC", () => {
    it("deve formatar GC com 1 casa decimal", () => {
      expect(formatarGC(99.56)).toBe("99.6");
    });

    it("deve retornar traço se nulo", () => {
      expect(formatarGC(null)).toBe('-');
      expect(formatarGC(undefined)).toBe('-');
    });
  });
});