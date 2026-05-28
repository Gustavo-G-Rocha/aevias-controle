import { describe, it, expect } from "vitest";
import {
  PENEIRAS_PADRAO,
  extrairAberturaNumero,
  obterPeneiraPadrao,
  mapPeneiraFaixaToDisponivel,
  INITIAL_FORM_DATA,
  mapProjectToFormData,
  resolveFaixaTrabalhoType,
} from "@/utils/projectFormUtils";

// ─────────────────────────────────────────────────────────────────
// extrairAberturaNumero
// ─────────────────────────────────────────────────────────────────
describe("extrairAberturaNumero", () => {
  it("extrai número de string simples", () => {
    expect(extrairAberturaNumero("75")).toBe(75);
  });

  it("extrai número de string com vírgula decimal", () => {
    expect(extrairAberturaNumero("6,3")).toBe(6.3);
  });

  it("extrai número de string com ponto decimal", () => {
    expect(extrairAberturaNumero("0.075")).toBe(0.075);
  });

  it("extrai número de string com unidade (mm)", () => {
    expect(extrairAberturaNumero("19.0 mm")).toBe(19);
  });

  it("retorna null para string sem número", () => {
    expect(extrairAberturaNumero("abc")).toBeNull();
  });

  it("normaliza '75.0' para 75", () => {
    expect(extrairAberturaNumero("75.0")).toBe(75);
  });
});

// ─────────────────────────────────────────────────────────────────
// obterPeneiraPadrao
// ─────────────────────────────────────────────────────────────────
describe("obterPeneiraPadrao", () => {
  it("retorna entrada para peneira 75mm", () => {
    const result = obterPeneiraPadrao("75");
    expect(result).toEqual(PENEIRAS_PADRAO["75"]);
  });

  it("retorna entrada para peneira com vírgula (6,3)", () => {
    const result = obterPeneiraPadrao("6,3");
    expect(result).toEqual(PENEIRAS_PADRAO["6.3"]);
  });

  it("retorna entrada para peneira 0.075mm", () => {
    const result = obterPeneiraPadrao("0.075");
    expect(result).toEqual(PENEIRAS_PADRAO["0.075"]);
  });

  it("retorna null para abertura inexistente", () => {
    expect(obterPeneiraPadrao("99")).toBeNull();
  });

  it("retorna null para string inválida", () => {
    expect(obterPeneiraPadrao("abc")).toBeNull();
  });

  it("normaliza '75.0' para encontrar a peneira", () => {
    expect(obterPeneiraPadrao("75.0")).toEqual(PENEIRAS_PADRAO["75"]);
  });
});

// ─────────────────────────────────────────────────────────────────
// mapPeneiraFaixaToDisponivel
// ─────────────────────────────────────────────────────────────────
describe("mapPeneiraFaixaToDisponivel", () => {
  it("mapeia peneira válida corretamente", () => {
    const result = mapPeneiraFaixaToDisponivel({ abertura: "19", min: 60, max: 100 });
    expect(result).toEqual({
      key: "peneira_19_0mm",
      nome: "19.0 mm",
      astm: "3/4\"",
      especificacao_min: 60,
      especificacao_max: 100,
    });
  });

  it("retorna null para peneira com abertura inexistente", () => {
    expect(mapPeneiraFaixaToDisponivel({ abertura: "99", min: 0, max: 100 })).toBeNull();
  });

  it("preserva min/max como especificação", () => {
    const result = mapPeneiraFaixaToDisponivel({ abertura: "4.75", min: 35, max: 65 });
    expect(result.especificacao_min).toBe(35);
    expect(result.especificacao_max).toBe(65);
  });
});

// ─────────────────────────────────────────────────────────────────
// INITIAL_FORM_DATA
// ─────────────────────────────────────────────────────────────────
describe("INITIAL_FORM_DATA", () => {
  it("tem tipo_projeto padrão CAUQ", () => {
    expect(INITIAL_FORM_DATA.tipo_projeto).toBe("CAUQ");
  });

  it("tem agregados como array vazio", () => {
    expect(INITIAL_FORM_DATA.agregados).toEqual([]);
  });

  it("tem status padrão ativo", () => {
    expect(INITIAL_FORM_DATA.status).toBe("ativo");
  });

  it("tem estrutura de temperaturas completa", () => {
    expect(INITIAL_FORM_DATA.temperaturas).toHaveProperty("mistura");
    expect(INITIAL_FORM_DATA.temperaturas).toHaveProperty("compactacao");
    expect(INITIAL_FORM_DATA.temperaturas).toHaveProperty("espalhamento");
  });
});

// ─────────────────────────────────────────────────────────────────
// mapProjectToFormData
// ─────────────────────────────────────────────────────────────────
describe("mapProjectToFormData", () => {
  it("hidrata campos básicos do projeto", () => {
    const project = { tipo_projeto: "MRAF", name: "Obra A", client: "Cliente X", status: "inativo" };
    const result = mapProjectToFormData(project);
    expect(result.tipo_projeto).toBe("MRAF");
    expect(result.name).toBe("Obra A");
    expect(result.client).toBe("Cliente X");
    expect(result.status).toBe("inativo");
  });

  it("usa defaults para campos ausentes", () => {
    const result = mapProjectToFormData({ tipo_projeto: "BGS" });
    expect(result.name).toBe("");
    expect(result.agregados).toEqual([]);
  });

  it("hidrata carta_traco_concreto para CARTA_TRACO_CONCRETO", () => {
    const project = {
      tipo_projeto: "CARTA_TRACO_CONCRETO",
      fck: 30,
      slump_projeto: 10,
      concreteira: "Concre SA",
    };
    const result = mapProjectToFormData(project);
    expect(result.carta_traco_concreto.fck).toBe(30);
    expect(result.carta_traco_concreto.concreteira).toBe("Concre SA");
  });

  it("retorna carta_traco_concreto vazio para tipo não concreto", () => {
    const result = mapProjectToFormData({ tipo_projeto: "CAUQ" });
    expect(result.carta_traco_concreto.fck).toBe("");
    expect(result.carta_traco_concreto.concreteira).toBe("");
  });

  it("hidrata carta_traco via _isCartaTraco flag", () => {
    const project = { tipo_projeto: "CAUQ", _isCartaTraco: true, fck: 25 };
    const result = mapProjectToFormData(project);
    expect(result.carta_traco_concreto.fck).toBe(25);
  });

  it("hidrata camadas_granulares para CAMADAS_GRANULARES", () => {
    const project = {
      tipo_projeto: "CAMADAS_GRANULARES",
      melhorador_utilizado: "Cal",
      umidade_otima: 12.5,
    };
    const result = mapProjectToFormData(project);
    expect(result.camadas_granulares.melhorador_utilizado).toBe("Cal");
    expect(result.camadas_granulares.umidade_otima).toBe(12.5);
  });

  it("retorna camadas_granulares vazio para tipo não granular", () => {
    const result = mapProjectToFormData({ tipo_projeto: "CAUQ" });
    expect(result.camadas_granulares.melhorador_utilizado).toBe("");
  });

  it("preserva agregados do projeto", () => {
    const project = {
      tipo_projeto: "CAUQ",
      agregados: [{ nome: "Brita 0", percentual_mistura: 40 }],
    };
    const result = mapProjectToFormData(project);
    expect(result.agregados).toHaveLength(1);
    expect(result.agregados[0].nome).toBe("Brita 0");
  });
});

// ─────────────────────────────────────────────────────────────────
// resolveFaixaTrabalhoType
// ─────────────────────────────────────────────────────────────────
describe("resolveFaixaTrabalhoType", () => {
  it("retorna faixa_trabalho_min para 'min'", () => {
    expect(resolveFaixaTrabalhoType("min")).toBe("faixa_trabalho_min");
  });

  it("retorna faixa_trabalho_max para 'max'", () => {
    expect(resolveFaixaTrabalhoType("max")).toBe("faixa_trabalho_max");
  });

  it("retorna faixa_trabalho para qualquer outro valor", () => {
    expect(resolveFaixaTrabalhoType("otimo")).toBe("faixa_trabalho");
    expect(resolveFaixaTrabalhoType("")).toBe("faixa_trabalho");
  });
});

// ─────────────────────────────────────────────────────────────────
// PENEIRAS_PADRAO — sanidade do mapa
// ─────────────────────────────────────────────────────────────────
describe("PENEIRAS_PADRAO", () => {
  it("tem 20 entradas", () => {
    expect(Object.keys(PENEIRAS_PADRAO)).toHaveLength(20);
  });

  it("a peneira 0.075 aponta para peneira_0_075mm", () => {
    expect(PENEIRAS_PADRAO["0.075"].key).toBe("peneira_0_075mm");
  });

  it("cada entrada tem key, nome e astm", () => {
    Object.values(PENEIRAS_PADRAO).forEach(entry => {
      expect(entry).toHaveProperty("key");
      expect(entry).toHaveProperty("nome");
      expect(entry).toHaveProperty("astm");
    });
  });
});