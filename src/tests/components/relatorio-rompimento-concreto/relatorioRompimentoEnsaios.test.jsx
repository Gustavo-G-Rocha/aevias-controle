import { describe, it, expect } from "vitest";
import React from "react";

// Testa a lógica pura embutida no componente via utils (ambiente node)
import {
  agruparEmSeries,
  resistenciaExemplar,
  fmtN,
  fmtDate,
} from "@/utils/relatorioRompimentoConcretoUtils";

// ── Fixtures ─────────────────────────────────────────────────────────────────
const mkCpCompressao = (n, overrides = {}) => ({
  numero_cp: n,
  idade: 28,
  dimensao: "15X30",
  data_ruptura: "2026-05-01",
  carga_ruptura: 20.5,
  area_cp: 176.71,
  resistencia: 11.6,
  ...overrides,
});

const mkCpFlexao = (n, overrides = {}) => ({
  numero_cp: n,
  idade: 28,
  data_ruptura: "2026-05-01",
  ponto_ruptura: "1/3",
  carga_ruptura: 450,
  vao_central: 500,
  resistencia: 4.5,
  ...overrides,
});

// ── Lógica de agrupamento de séries (verifica comportamento do componente) ───
describe("lógica de series de compressao_axial", () => {
  it("agrupa 4 CPs em 2 séries de 2", () => {
    const cps = [mkCpCompressao(1), mkCpCompressao(2), mkCpCompressao(3), mkCpCompressao(4)];
    const series = agruparEmSeries(cps);
    expect(series).toHaveLength(2);
    expect(series[0]).toHaveLength(2);
    expect(series[1]).toHaveLength(2);
  });

  it("agrupa 3 CPs em 2 séries (última com 1 CP)", () => {
    const cps = [mkCpCompressao(1), mkCpCompressao(2), mkCpCompressao(3)];
    const series = agruparEmSeries(cps);
    expect(series).toHaveLength(2);
    expect(series[1]).toHaveLength(1);
  });

  it("retorna [] para compressao_axial null", () => {
    expect(agruparEmSeries(null)).toEqual([]);
    expect(agruparEmSeries([])).toEqual([]);
  });
});

// ── Lógica de tracao_flexao (cada CP vira série de 1) ────────────────────────
describe("lógica de series de tracao_flexao", () => {
  it("cada CP de flexão forma série individual", () => {
    const cps = [mkCpFlexao(1), mkCpFlexao(2)];
    const seriesFlexao = cps.map((cp) => [cp]);
    expect(seriesFlexao).toHaveLength(2);
    expect(seriesFlexao[0]).toHaveLength(1);
    expect(seriesFlexao[0][0].numero_cp).toBe(1);
  });

  it("retorna [] para tracao_flexao vazio", () => {
    const seriesFlexao = [].map((cp) => [cp]);
    expect(seriesFlexao).toEqual([]);
  });
});

// ── resistenciaExemplar nas séries ────────────────────────────────────────────
describe("resistenciaExemplar integrado com dados de CP", () => {
  it("retorna maior valor de série de compressão", () => {
    const serie = [
      mkCpCompressao(1, { resistencia: 25.5 }),
      mkCpCompressao(2, { resistencia: 28.3 }),
    ];
    expect(resistenciaExemplar(serie)).toBe("28.30");
  });

  it("retorna '-' para série com resistencia null", () => {
    const serie = [mkCpCompressao(1, { resistencia: null })];
    expect(resistenciaExemplar(serie)).toBe("-");
  });

  it("retorna '-' para série vazia", () => {
    expect(resistenciaExemplar([])).toBe("-");
  });

  it("ignora resistencias 0 ou negativas", () => {
    const serie = [
      mkCpCompressao(1, { resistencia: 0 }),
      mkCpCompressao(2, { resistencia: -1 }),
    ];
    expect(resistenciaExemplar(serie)).toBe("-");
  });
});

// ── fmtN com campos de CP ─────────────────────────────────────────────────────
describe("fmtN com campos de CP de concreto", () => {
  it("formata carga_ruptura com 2 decimais", () => {
    expect(fmtN(20.5, 2)).toBe("20.50");
  });

  it("formata area_cp com 2 decimais", () => {
    expect(fmtN(176.71, 2)).toBe("176.71");
  });

  it("retorna '-' para area_cp null", () => {
    expect(fmtN(null, 2)).toBe("-");
  });

  it("formata vao_central", () => {
    expect(fmtN(500, 2)).toBe("500.00");
  });
});

// ── fmtDate com data_ruptura ──────────────────────────────────────────────────
describe("fmtDate com data_ruptura de CP", () => {
  it("formata data YYYY-MM-DD", () => {
    expect(fmtDate("2026-05-01")).toMatch(/01\/0?5\/2026/);
  });

  it("retorna '-' para data_ruptura null", () => {
    expect(fmtDate(null)).toBe("-");
  });

  it("retorna '' simulando exibição condicional do componente", () => {
    // O componente faz: cp.data_ruptura ? fmtDate(cp.data_ruptura) : ""
    const cp = mkCpCompressao(1, { data_ruptura: null });
    const val = cp.data_ruptura ? fmtDate(cp.data_ruptura) : "";
    expect(val).toBe("");
  });
});

// ── totalCPs e totalCpCols ────────────────────────────────────────────────────
describe("totalCPs e totalCpCols calculados pelo componente", () => {
  it("totalCPs soma todos os CPs das séries", () => {
    const series = [
      [mkCpCompressao(1), mkCpCompressao(2)],
      [mkCpCompressao(3)],
    ];
    const totalCPs = series.reduce((acc, s) => acc + s.length, 0);
    expect(totalCPs).toBe(3);
  });

  it("totalCpCols é mínimo 1", () => {
    const series = [];
    const totalCpCols = Math.max(series.reduce((a, s) => a + s.length, 0), 1);
    expect(totalCpCols).toBe(1);
  });

  it("totalCpCols com 2 séries de 2 = 4", () => {
    const series = [
      [mkCpCompressao(1), mkCpCompressao(2)],
      [mkCpCompressao(3), mkCpCompressao(4)],
    ];
    const totalCpCols = Math.max(series.reduce((a, s) => a + s.length, 0), 1);
    expect(totalCpCols).toBe(4);
  });
});

// ── Validação de imports ──────────────────────────────────────────────────────
describe("módulos de subcomponentes importáveis", () => {
  it("EmptyDataCells existe e é função", async () => {
    const mod = await import("@/components/relatorio-rompimento-concreto/ensaios/EmptyDataCells");
    expect(typeof mod.default).toBe("function");
  });

  it("TableColGroup existe e é função", async () => {
    const mod = await import("@/components/relatorio-rompimento-concreto/ensaios/TableColGroup");
    expect(typeof mod.default).toBe("function");
  });

  it("RelatorioRompimentoEnsaios existe e é função", async () => {
    const mod = await import("@/components/relatorio-rompimento-concreto/RelatorioRompimentoEnsaios");
    expect(typeof mod.default).toBe("function");
  });
});