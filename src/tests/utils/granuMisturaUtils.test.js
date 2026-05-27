import { describe, it, expect } from "vitest";
import {
  getInitialPeneiras,
  getInitialForm,
  calcUmidade,
  recalcPassantesPeneiras,
  calcEquivalenteMedicao,
  calcMediaEquivalente,
  calcTeorPulverulentos,
  getPeneirasExibidas,
  syncPeneirasComFaixa,
  getPeneirasKeys,
  getFaixaTrabalho,
  getEspecificacao,
  filtrarProjetosPorObra,
  buildDataToSave,
  PENEIRAS_PADRAO,
} from "@/utils/granuMisturaUtils";

// ── getInitialPeneiras ────────────────────────────────────────────────────────
describe("getInitialPeneiras", () => {
  it("retorna 14 peneiras", () => {
    expect(getInitialPeneiras()).toHaveLength(14);
  });
  it("cada peneira tem retido_g, passante_g, passante_pct como string vazia", () => {
    getInitialPeneiras().forEach(p => {
      expect(p.retido_g).toBe("");
      expect(p.passante_g).toBe("");
      expect(p.passante_pct).toBe("");
    });
  });
  it("ordem decrescente de abertura", () => {
    const p = getInitialPeneiras();
    for (let i = 1; i < p.length; i++) {
      expect(p[i - 1].abertura_mm).toBeGreaterThan(p[i].abertura_mm);
    }
  });
});

// ── getInitialForm ────────────────────────────────────────────────────────────
describe("getInitialForm", () => {
  it("obra_id vazio", () => expect(getInitialForm().obra_id).toBe(""));
  it("status rascunho", () => expect(getInitialForm().status).toBe("rascunho"));
  it("3 medições de equivalente de areia", () => {
    expect(getInitialForm().equivalente_areia.medicoes).toHaveLength(3);
  });
  it("peneiras iniciam com 14 itens", () => {
    expect(getInitialForm().peneiras).toHaveLength(14);
  });
});

// ── calcUmidade ───────────────────────────────────────────────────────────────
describe("calcUmidade", () => {
  it("calcula peso_agua e umidade_pct corretamente", () => {
    const r = calcUmidade({ peso_umido: "110", peso_seco: "100", peso_agua: "", umidade_pct: "" });
    expect(r.peso_agua).toBe("10.00");
    expect(parseFloat(r.umidade_pct)).toBeCloseTo(10, 1);
  });
  it("peso_agua vazio quando peso_umido ausente", () => {
    const r = calcUmidade({ peso_umido: "", peso_seco: "100", peso_agua: "", umidade_pct: "" });
    expect(r.peso_agua).toBe("");
    expect(r.umidade_pct).toBe("");
  });
  it("umidade_pct vazio quando peso_seco zero", () => {
    const r = calcUmidade({ peso_umido: "100", peso_seco: "0", peso_agua: "", umidade_pct: "" });
    expect(r.umidade_pct).toBe("");
  });
  it("retorna strings formatadas com 2 casas", () => {
    const r = calcUmidade({ peso_umido: "110", peso_seco: "100", peso_agua: "", umidade_pct: "" });
    expect(r.peso_agua).toMatch(/^\d+\.\d{2}$/);
    expect(r.umidade_pct).toMatch(/^\d+\.\d{2}$/);
  });
});

// ── recalcPassantesPeneiras ───────────────────────────────────────────────────
describe("recalcPassantesPeneiras", () => {
  it("retorna original quando pesoAmostra é 0", () => {
    const peneiras = [{ retido_g: "100", passante_g: "", passante_pct: "" }];
    expect(recalcPassantesPeneiras(peneiras, 0)).toBe(peneiras);
  });
  it("calcula passante_pct 100 quando retidos zero", () => {
    const peneiras = [{ retido_g: "", passante_g: "", passante_pct: "" }];
    const r = recalcPassantesPeneiras(peneiras, 500);
    expect(parseFloat(r[0].passante_pct)).toBeCloseTo(100, 1);
  });
  it("acumula retidos corretamente", () => {
    const peneiras = [
      { retido_g: "100", passante_g: "", passante_pct: "" },
      { retido_g: "200", passante_g: "", passante_pct: "" },
    ];
    const r = recalcPassantesPeneiras(peneiras, 500);
    expect(parseFloat(r[0].passante_pct)).toBeCloseTo(80, 1);
    expect(parseFloat(r[1].passante_pct)).toBeCloseTo(40, 1);
  });
  it("passante_g nunca negativo", () => {
    const peneiras = [{ retido_g: "600", passante_g: "", passante_pct: "" }];
    const r = recalcPassantesPeneiras(peneiras, 500);
    expect(parseFloat(r[0].passante_g)).toBe(0);
  });
});

// ── calcEquivalenteMedicao ────────────────────────────────────────────────────
describe("calcEquivalenteMedicao", () => {
  it("calcula (topo_areia/topo_argila)*100", () => {
    const r = calcEquivalenteMedicao({ topo_argila: "10", topo_areia: "8", equivalente: "" });
    expect(parseFloat(r.equivalente)).toBeCloseTo(80, 1);
  });
  it("equivalente vazio quando topo_argila é 0", () => {
    const r = calcEquivalenteMedicao({ topo_argila: "0", topo_areia: "8", equivalente: "" });
    expect(r.equivalente).toBe("");
  });
  it("equivalente vazio quando ambos ausentes", () => {
    const r = calcEquivalenteMedicao({ topo_argila: "", topo_areia: "", equivalente: "" });
    expect(r.equivalente).toBe("");
  });
  it("formata com 2 casas decimais", () => {
    const r = calcEquivalenteMedicao({ topo_argila: "3", topo_areia: "2", equivalente: "" });
    expect(r.equivalente).toMatch(/^\d+\.\d{2}$/);
  });
});

// ── calcMediaEquivalente ──────────────────────────────────────────────────────
describe("calcMediaEquivalente", () => {
  it("calcula média de medições válidas", () => {
    const medicoes = [{ equivalente: "80.00" }, { equivalente: "90.00" }, { equivalente: "" }];
    expect(parseFloat(calcMediaEquivalente(medicoes))).toBeCloseTo(85, 1);
  });
  it("retorna '' para lista vazia", () => expect(calcMediaEquivalente([])).toBe(""));
  it("retorna '' quando nenhuma medição tem equivalente válido", () => {
    expect(calcMediaEquivalente([{ equivalente: "" }])).toBe("");
  });
  it("funciona com 1 medição válida", () => {
    expect(parseFloat(calcMediaEquivalente([{ equivalente: "75.00" }]))).toBeCloseTo(75, 1);
  });
});

// ── calcTeorPulverulentos ─────────────────────────────────────────────────────
describe("calcTeorPulverulentos", () => {
  it("calcula ((pi-pf)/pi)*100", () => {
    const r = calcTeorPulverulentos({ peso_inicial: "200", peso_apos_lavagem: "180", teor_pct: "" });
    expect(parseFloat(r.teor_pct)).toBeCloseTo(10, 1);
  });
  it("teor_pct vazio quando peso_inicial é 0", () => {
    const r = calcTeorPulverulentos({ peso_inicial: "0", peso_apos_lavagem: "180", teor_pct: "" });
    expect(r.teor_pct).toBe("");
  });
  it("teor_pct vazio quando peso_apos_lavagem ausente", () => {
    const r = calcTeorPulverulentos({ peso_inicial: "200", peso_apos_lavagem: "", teor_pct: "" });
    expect(r.teor_pct).toBe("");
  });
  it("formata com 2 casas", () => {
    const r = calcTeorPulverulentos({ peso_inicial: "100", peso_apos_lavagem: "95", teor_pct: "" });
    expect(r.teor_pct).toMatch(/^\d+\.\d{2}$/);
  });
});

// ── getPeneirasExibidas ───────────────────────────────────────────────────────
describe("getPeneirasExibidas", () => {
  it("retorna PENEIRAS_PADRAO quando sem faixa", () => {
    expect(getPeneirasExibidas(null, null, "CAUQ")).toEqual(PENEIRAS_PADRAO);
  });
  it("retorna peneiras da faixaSelecionada quando material=OUTRO", () => {
    const faixa = { peneiras: [{ astm: "#4", abertura: "4.75" }, { astm: "#8", abertura: "2.36" }] };
    const r = getPeneirasExibidas(null, faixa, "OUTRO");
    expect(r).toHaveLength(2);
    expect(r[0].abertura_mm).toBeGreaterThan(r[1].abertura_mm);
  });
  it("retorna peneiras da faixaGran quando material=CAUQ", () => {
    const faixa = { peneiras: [{ astm: "#4", abertura: "4.75" }] };
    const r = getPeneirasExibidas(faixa, null, "CAUQ");
    expect(r).toHaveLength(1);
    expect(r[0].abertura_mm).toBe(4.75);
  });
});

// ── syncPeneirasComFaixa ──────────────────────────────────────────────────────
describe("syncPeneirasComFaixa", () => {
  it("retorna peneirasAtuais quando faixa não tem peneiras", () => {
    const original = [{ abertura_mm: 9.5, retido_g: "50" }];
    expect(syncPeneirasComFaixa(null, original)).toBe(original);
    expect(syncPeneirasComFaixa({}, original)).toBe(original);
  });
  it("preserva dados de peneiras existentes", () => {
    const faixa = { peneiras: [{ astm: "#4", abertura: "4.75" }] };
    const atual = [{ abertura_mm: 4.75, astm: "#4", retido_g: "100", passante_g: "400", passante_pct: "80.00" }];
    const r = syncPeneirasComFaixa(faixa, atual);
    expect(r[0].retido_g).toBe("100");
  });
  it("cria nova peneira quando não existe nas atuais", () => {
    const faixa = { peneiras: [{ astm: "#4", abertura: "4.75" }] };
    const r = syncPeneirasComFaixa(faixa, []);
    expect(r[0].retido_g).toBe("");
  });
  it("ordena por abertura decrescente", () => {
    const faixa = { peneiras: [{ astm: "#8", abertura: "2.36" }, { astm: "#4", abertura: "4.75" }] };
    const r = syncPeneirasComFaixa(faixa, []);
    expect(r[0].abertura_mm).toBeGreaterThan(r[1].abertura_mm);
  });
});

// ── getPeneirasKeys ───────────────────────────────────────────────────────────
describe("getPeneirasKeys", () => {
  it("retorna pKey correto para abertura conhecida", () => {
    expect(getPeneirasKeys(9.5).pKey).toBe("peneira_9_5mm");
    expect(getPeneirasKeys(0.075).pKey).toBe("peneira_0_075mm");
  });
  it("retorna pKeyAlt para abertura 2.0", () => {
    expect(getPeneirasKeys(2.0).pKeyAlt).toBe("peneira_2_00mm");
  });
  it("retorna null pKeyAlt para abertura sem alternativa", () => {
    expect(getPeneirasKeys(9.5).pKeyAlt).toBeNull();
  });
});

// ── getFaixaTrabalho ──────────────────────────────────────────────────────────
describe("getFaixaTrabalho", () => {
  it("retorna {min: null, max: null} sem projeto", () => {
    expect(getFaixaTrabalho(null, "peneira_9_5mm", null)).toEqual({ min: null, max: null });
  });
  it("retorna min/max do projeto para chave conhecida", () => {
    const proj = {
      faixa_trabalho_min: { peneira_9_5mm: 40 },
      faixa_trabalho_max: { peneira_9_5mm: 70 },
    };
    expect(getFaixaTrabalho(proj, "peneira_9_5mm", null)).toEqual({ min: 40, max: 70 });
  });
  it("usa pKeyAlt quando pKey não encontrado", () => {
    const proj = {
      faixa_trabalho_min: { peneira_2_00mm: 30 },
      faixa_trabalho_max: { peneira_2_00mm: 60 },
    };
    expect(getFaixaTrabalho(proj, "peneira_2_0mm", "peneira_2_00mm")).toEqual({ min: 30, max: 60 });
  });
});

// ── getEspecificacao ──────────────────────────────────────────────────────────
describe("getEspecificacao", () => {
  it("retorna {min:null,max:null} sem faixa", () => {
    expect(getEspecificacao(null, "peneira_9_5mm", null)).toEqual({ min: null, max: null });
  });
  it("retorna min/max para chave conhecida", () => {
    const faixa = { peneiras: [{ abertura: "9.5", min: 50, max: 80 }] };
    expect(getEspecificacao(faixa, "peneira_9_5mm", null)).toEqual({ min: 50, max: 80 });
  });
  it("usa pKeyAlt quando pKey não tem abertura mapeada", () => {
    const faixa = { peneiras: [{ abertura: "2.0", min: 30, max: 60 }] };
    expect(getEspecificacao(faixa, "peneira_2_0mm", "peneira_2_00mm")).toEqual({ min: 30, max: 60 });
  });
  it("retorna {min:null,max:null} quando peneira não está na faixa", () => {
    const faixa = { peneiras: [{ abertura: "19.0", min: 90, max: 100 }] };
    expect(getEspecificacao(faixa, "peneira_9_5mm", null)).toEqual({ min: null, max: null });
  });
});

// ── filtrarProjetosPorObra ────────────────────────────────────────────────────
describe("filtrarProjetosPorObra", () => {
  const obras = [{ id: "o1", regional_id: "r1" }];
  const regionais = [{ id: "r1", project_ids: ["p1", "p2"] }];
  const projects = [
    { id: "p1", tipo_projeto: "CAUQ" },
    { id: "p2", tipo_projeto: "MRAF" },
    { id: "p3", tipo_projeto: "CAUQ" },
  ];

  it("retorna [] quando obra não encontrada", () => {
    expect(filtrarProjetosPorObra("x", "CAUQ", obras, regionais, projects)).toEqual([]);
  });
  it("retorna [] quando regional sem project_ids", () => {
    const reg = [{ id: "r1" }];
    expect(filtrarProjetosPorObra("o1", "CAUQ", obras, reg, projects)).toEqual([]);
  });
  it("filtra por tipo de material quando CAUQ/MRAF/BGS", () => {
    const r = filtrarProjetosPorObra("o1", "CAUQ", obras, regionais, projects);
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("p1");
  });
  it("não filtra por tipo quando material é OUTRO", () => {
    const r = filtrarProjetosPorObra("o1", "OUTRO", obras, regionais, projects);
    expect(r).toHaveLength(2);
  });
});

// ── buildDataToSave ───────────────────────────────────────────────────────────
describe("buildDataToSave", () => {
  const base = {
    obra_id: "o1",
    peneiras: [{ astm: "#4", abertura_mm: 4.75, retido_g: "50", passante_g: "450", passante_pct: "90" }],
    laboratorista_name: "",
    approved: null,
  };
  const user = { full_name: "João" };

  it("converte retido_g para número", () => {
    const r = buildDataToSave(base, "rascunho", null, user);
    expect(r.peneiras[0].retido_g).toBe(50);
  });
  it("converte string vazia em null para peneira", () => {
    const fd = { ...base, peneiras: [{ astm: "#4", abertura_mm: 4.75, retido_g: "", passante_g: "", passante_pct: "" }] };
    const r = buildDataToSave(fd, "rascunho", null, user);
    expect(r.peneiras[0].retido_g).toBeNull();
  });
  it("usa nome do usuário quando laboratorista_name vazio", () => {
    const r = buildDataToSave(base, "rascunho", null, user);
    expect(r.laboratorista_name).toBe("João");
  });
  it("define status como rascunho", () => {
    const r = buildDataToSave(base, "rascunho", null, user);
    expect(r.status).toBe("rascunho");
  });
  it("define status como finalizado", () => {
    const r = buildDataToSave(base, "finalizado", null, user);
    expect(r.status).toBe("finalizado");
  });
  it("reseta approved ao finalizar quando reprovado", () => {
    const fd = { ...base, approved: false };
    const r = buildDataToSave(fd, "finalizado", "edit1", user);
    expect(r.approved).toBeNull();
    expect(r.rejection_reason).toBeNull();
    expect(r.was_rejected).toBe(true);
  });
  it("não reseta approved ao salvar rascunho quando reprovado", () => {
    const fd = { ...base, approved: false };
    const r = buildDataToSave(fd, "rascunho", "edit1", user);
    expect(r.approved).toBe(false);
  });
});