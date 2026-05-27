import { describe, it, expect } from "vitest";
import {
  getInitialFormData,
  getInitialCarga,
  filtrarObras,
  filtrarProjetosDisponiveis,
  calcCanEdit,
  addCarga,
  removeCarga,
  updateCarga,
  validateFormData,
  buildDataToSave,
  MAX_CARGAS,
} from "@/utils/acompanhamentoCargaUtils";

// ── getInitialFormData ────────────────────────────────────────────────────────
describe("getInitialFormData", () => {
  it("obra_id vazio",            () => expect(getInitialFormData().obra_id).toBe(""));
  it("cargas é array vazio",     () => expect(getInitialFormData().cargas).toEqual([]));
  it("status é rascunho",        () => expect(getInitialFormData().status).toBe("rascunho"));
  it("jornada possui os campos", () => {
    const j = getInitialFormData().jornada;
    expect(j).toHaveProperty("horario_inicio", "");
    expect(j).toHaveProperty("horario_fim", "");
  });
  it("data é string no formato ISO",  () =>
    expect(getInitialFormData().data).toMatch(/^\d{4}-\d{2}-\d{2}$/));
});

// ── getInitialCarga ───────────────────────────────────────────────────────────
describe("getInitialCarga", () => {
  it("define numero_carga corretamente", () => expect(getInitialCarga(3).numero_carga).toBe(3));
  it("placa vazia",                      () => expect(getInitialCarga(1).placa).toBe(""));
  it("peso_toneladas null",              () => expect(getInitialCarga(1).peso_toneladas).toBeNull());
  it("todos os campos de tempo vazios",  () => {
    const c = getInitialCarga(1);
    expect(c.hora_saida).toBe("");
    expect(c.hora_chegada).toBe("");
    expect(c.hora_aplicacao).toBe("");
  });
});

// ── filtrarObras ──────────────────────────────────────────────────────────────
describe("filtrarObras", () => {
  const obras = [
    { id: "1", tipo_obra: "conservacao" },
    { id: "2", tipo_obra: "implantacao" },
    { id: "3", tipo_obra: "supervisao" },
    { id: "4", tipo_obra: "sondagem" },
  ];

  it("mantém conservacao e implantacao",  () => {
    const r = filtrarObras(obras);
    expect(r).toHaveLength(2);
    expect(r.map(o => o.id)).toEqual(["1", "2"]);
  });
  it("exclui supervisao e sondagem",      () => {
    const r = filtrarObras(obras);
    expect(r.map(o => o.tipo_obra)).not.toContain("supervisao");
    expect(r.map(o => o.tipo_obra)).not.toContain("sondagem");
  });
  it("retorna [] para lista vazia",        () => expect(filtrarObras([])).toEqual([]));
});

// ── filtrarProjetosDisponiveis ────────────────────────────────────────────────
describe("filtrarProjetosDisponiveis", () => {
  const obras     = [{ id: "o1", regional_id: "r1" }];
  const regionais = [{ id: "r1", project_ids: ["p1", "p2", "p3"] }];
  const projects  = [
    { id: "p1", tipo_projeto: "CAUQ" },
    { id: "p2", tipo_projeto: "MRAF" },
    { id: "p3", tipo_projeto: "CAUQ" },
    { id: "p4", tipo_projeto: "CAUQ" }, // fora da regional
  ];

  it("retorna apenas projetos CAUQ da regional", () => {
    const r = filtrarProjetosDisponiveis("o1", obras, regionais, projects);
    expect(r).toHaveLength(2);
    expect(r.map(p => p.id)).toEqual(["p1", "p3"]);
  });
  it("retorna [] quando obra não encontrada", () =>
    expect(filtrarProjetosDisponiveis("x", obras, regionais, projects)).toEqual([]));
  it("retorna [] quando regional sem project_ids", () => {
    const reg = [{ id: "r1" }];
    expect(filtrarProjetosDisponiveis("o1", obras, reg, projects)).toEqual([]);
  });
  it("exclui projetos não-CAUQ",  () => {
    const r = filtrarProjetosDisponiveis("o1", obras, regionais, projects);
    expect(r.every(p => p.tipo_projeto === "CAUQ")).toBe(true);
  });
});

// ── calcCanEdit ───────────────────────────────────────────────────────────────
describe("calcCanEdit", () => {
  it("sempre true quando não é editMode",             () =>
    expect(calcCanEdit(false, {}, "any@email")).toBe(true));
  it("true quando editMode mas não aprovado e owner",  () =>
    expect(calcCanEdit(true, { approved: null, created_by: "a@b.com" }, "a@b.com")).toBe(true));
  it("false quando aprovado",                          () =>
    expect(calcCanEdit(true, { approved: true, created_by: "a@b.com" }, "a@b.com")).toBe(false));
  it("false quando editMode e não é owner",            () =>
    expect(calcCanEdit(true, { approved: null, created_by: "other@b.com" }, "a@b.com")).toBe(false));
});

// ── addCarga ──────────────────────────────────────────────────────────────────
describe("addCarga", () => {
  it("adiciona uma carga à lista vazia",  () => {
    const r = addCarga([]);
    expect(r).toHaveLength(1);
    expect(r[0].numero_carga).toBe(1);
  });
  it("numero_carga é length + 1",         () => {
    const cargas = [{ numero_carga: 1 }, { numero_carga: 2 }];
    expect(addCarga(cargas)[2].numero_carga).toBe(3);
  });
  it(`retorna null ao atingir limite de ${MAX_CARGAS}`, () => {
    const cargas = Array.from({ length: MAX_CARGAS }, (_, i) => ({ numero_carga: i + 1 }));
    expect(addCarga(cargas)).toBeNull();
  });
  it("não muta o array original",         () => {
    const original = [];
    addCarga(original);
    expect(original).toHaveLength(0);
  });
});

// ── removeCarga ───────────────────────────────────────────────────────────────
describe("removeCarga", () => {
  const cargas = [{ numero_carga: 1 }, { numero_carga: 2 }, { numero_carga: 3 }];

  it("remove pelo índice correto",        () => {
    expect(removeCarga(cargas, 1)).toHaveLength(2);
    expect(removeCarga(cargas, 1).map(c => c.numero_carga)).toEqual([1, 3]);
  });
  it("não muta o array original",         () => {
    removeCarga(cargas, 0);
    expect(cargas).toHaveLength(3);
  });
  it("remove o primeiro elemento",        () =>
    expect(removeCarga(cargas, 0)[0].numero_carga).toBe(2));
  it("remove o último elemento",          () =>
    expect(removeCarga(cargas, 2)).toHaveLength(2));
});

// ── updateCarga ───────────────────────────────────────────────────────────────
describe("updateCarga", () => {
  const cargas = [
    { numero_carga: 1, placa: "ABC-1234", peso_toneladas: null },
    { numero_carga: 2, placa: "XYZ-5678", peso_toneladas: null },
  ];

  it("atualiza campo do índice correto",  () => {
    const r = updateCarga(cargas, 0, "placa", "NEW-0001");
    expect(r[0].placa).toBe("NEW-0001");
    expect(r[1].placa).toBe("XYZ-5678");
  });
  it("não afeta outras cargas",           () => {
    const r = updateCarga(cargas, 1, "peso_toneladas", 12.5);
    expect(r[0].peso_toneladas).toBeNull();
    expect(r[1].peso_toneladas).toBe(12.5);
  });
  it("não muta o array original",         () => {
    updateCarga(cargas, 0, "placa", "X");
    expect(cargas[0].placa).toBe("ABC-1234");
  });
});

// ── validateFormData ──────────────────────────────────────────────────────────
describe("validateFormData", () => {
  const base = { obra_id: "o1", data: "2024-01-01", cargas: [] };

  it("retorna null quando válido (rascunho sem cargas)", () =>
    expect(validateFormData(base, false)).toBeNull());
  it("retorna erro quando obra_id ausente",              () =>
    expect(validateFormData({ ...base, obra_id: "" }, false)).toBeTruthy());
  it("retorna erro quando data ausente",                  () =>
    expect(validateFormData({ ...base, data: "" }, false)).toBeTruthy());
  it("retorna erro ao finalizar sem cargas",              () =>
    expect(validateFormData(base, true)).toBeTruthy());
  it("retorna null ao finalizar com cargas",              () => {
    const fd = { ...base, cargas: [{ numero_carga: 1 }] };
    expect(validateFormData(fd, true)).toBeNull();
  });
});

// ── buildDataToSave ───────────────────────────────────────────────────────────
describe("buildDataToSave", () => {
  const base = { obra_id: "o1", cargas: [], status: "rascunho" };

  it("define status rascunho quando finalizar=false",   () =>
    expect(buildDataToSave(base, false).status).toBe("rascunho"));
  it("define status finalizado quando finalizar=true",  () =>
    expect(buildDataToSave(base, true).status).toBe("finalizado"));
  it("preserva outros campos",                          () =>
    expect(buildDataToSave(base, false).obra_id).toBe("o1"));
  it("não muta o formData original",                    () => {
    buildDataToSave(base, true);
    expect(base.status).toBe("rascunho");
  });
});