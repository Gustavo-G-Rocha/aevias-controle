import { describe, it, expect } from "vitest";

/**
 * Testes para AcompanhamentoCargaContext
 * Ambiente node (sem jsdom) — testes de importabilidade e contrato
 */

describe("AcompanhamentoCargaContext", () => {
  it("Provider é exportado e é uma função", async () => {
    const mod = await import("@/components/acompanhamento-carga/AcompanhamentoCargaContext");
    expect(typeof mod.AcompanhamentoCargaProvider).toBe("function");
  });

  it("useAcompanhamentoCargaCtx é exportado e é uma função", async () => {
    const mod = await import("@/components/acompanhamento-carga/AcompanhamentoCargaContext");
    expect(typeof mod.useAcompanhamentoCargaCtx).toBe("function");
  });

  it("componentes filhos permanecem importáveis após refatoração", async () => {
    const header = await import("@/components/acompanhamento-carga/AcompanhamentoCargaHeader");
    const dadosObra = await import("@/components/acompanhamento-carga/AcompanhamentoCargaDadosObra");
    const cargas = await import("@/components/acompanhamento-carga/AcompanhamentoCargaCargas");
    const actions = await import("@/components/acompanhamento-carga/AcompanhamentoCargaActions");

    expect(typeof header.default).toBe("function");
    expect(typeof dadosObra.default).toBe("function");
    expect(typeof cargas.default).toBe("function");
    expect(typeof actions.default).toBe("function");
  });

  it("página AcompanhamentoCarga permanece importável e é função default", async () => {
    const mod = await import("@/pages/AcompanhamentoCarga");
    expect(typeof mod.default).toBe("function");
  });
});