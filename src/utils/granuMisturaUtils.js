/**
 * Funções puras para GranuMistura.
 * Sem dependências de React ou Base44.
 */

// ── Constantes ────────────────────────────────────────────────────────────────

export const PENEIRAS_PADRAO = [
  { astm: "1\"",   abertura_mm: 25.0 },
  { astm: "3/4\"", abertura_mm: 19.0 },
  { astm: "1/2\"", abertura_mm: 12.5 },
  { astm: "3/8\"", abertura_mm: 9.5  },
  { astm: "#4",    abertura_mm: 4.75 },
  { astm: "#8",    abertura_mm: 2.36 },
  { astm: "#10",   abertura_mm: 2.0  },
  { astm: "#16",   abertura_mm: 1.18 },
  { astm: "#30",   abertura_mm: 0.6  },
  { astm: "#40",   abertura_mm: 0.42 },
  { astm: "#50",   abertura_mm: 0.3  },
  { astm: "#80",   abertura_mm: 0.18 },
  { astm: "#100",  abertura_mm: 0.15 },
  { astm: "#200",  abertura_mm: 0.075 },
];

export const ABERTURA_KEY_MAP = {
  75.0:  "peneira_75_0mm",  63.0: "peneira_63_0mm",  50.0: "peneira_50_0mm",
  37.5:  "peneira_37_5mm",  25.0: "peneira_25_0mm",  19.0: "peneira_19_0mm",
  16.0:  "peneira_16_0mm",  12.5: "peneira_12_5mm",   9.5: "peneira_9_5mm",
  4.75:  "peneira_4_75mm",  2.36: "peneira_2_36mm",   2.0: "peneira_2_0mm",
  1.18:  "peneira_1_18mm",  0.6:  "peneira_0_6mm",   0.42: "peneira_0_42mm",
  0.3:   "peneira_0_3mm",   0.18: "peneira_0_18mm",  0.15: "peneira_0_15mm",
  0.075: "peneira_0_075mm",
};

export const ABERTURA_ALT_KEY_MAP = {
  2.0:  "peneira_2_00mm",
  25.0: "peneira_25_00mm",
  19.0: "peneira_19_00mm",
};

// ── Estado inicial ────────────────────────────────────────────────────────────

export const getInitialPeneiras = () =>
  PENEIRAS_PADRAO.map(p => ({ ...p, retido_g: "", passante_g: "", passante_pct: "" }));

export const getInitialForm = () => ({
  obra_id: "",
  numero_projeto: "",
  data_ensaio: new Date().toISOString().split("T")[0],
  horario: "",
  laboratorista_name: "",
  rodovia: "",
  trecho: "",
  camada: "",
  material: "",
  local_coleta: "",
  pedreira: "",
  faixa: "",
  peso_amostra: "",
  peneiras: getInitialPeneiras(),
  umidade: { peso_umido: "", peso_seco: "", peso_agua: "", umidade_pct: "" },
  equivalente_areia: {
    medicoes: [
      { topo_argila: "", topo_areia: "", equivalente: "" },
      { topo_argila: "", topo_areia: "", equivalente: "" },
      { topo_argila: "", topo_areia: "", equivalente: "" },
    ],
    media: "",
  },
  materiais_pulverulentos: { peso_inicial: "", peso_apos_lavagem: "", teor_pct: "" },
  observacoes: "",
  status: "rascunho",
});

// ── Cálculos de umidade ───────────────────────────────────────────────────────

/**
 * Recalcula peso_agua e umidade_pct a partir dos pesos.
 */
export function calcUmidade(umidadeObj) {
  const p1 = parseFloat(umidadeObj.peso_umido) || 0;
  const p2 = parseFloat(umidadeObj.peso_seco)  || 0;
  return {
    ...umidadeObj,
    peso_agua:   p1 && p2 ? (p1 - p2).toFixed(2) : "",
    umidade_pct: p1 && p2 && p2 > 0 ? ((p1 - p2) / p2 * 100).toFixed(2) : "",
  };
}

// ── Cálculos de granulometria ────────────────────────────────────────────────

/**
 * Recalcula passante_g e passante_pct para todas as peneiras.
 * @param {object[]} peneiras
 * @param {number|string} pesoAmostra
 * @returns {object[]} nova lista de peneiras com passantes atualizados
 */
export function recalcPassantesPeneiras(peneiras, pesoAmostra) {
  const pesoNum = parseFloat(pesoAmostra) || 0;
  if (pesoNum <= 0) return peneiras;
  let retidoAcum = 0;
  return peneiras.map(p => {
    retidoAcum += parseFloat(p.retido_g) || 0;
    const passG = Math.max(0, pesoNum - retidoAcum);
    return {
      ...p,
      passante_g:   passG.toFixed(2),
      passante_pct: (passG / pesoNum * 100).toFixed(2),
    };
  });
}

// ── Cálculos de equivalente de areia ─────────────────────────────────────────

/**
 * Recalcula equivalente de areia para uma única medição.
 */
export function calcEquivalenteMedicao(medicao) {
  const h1 = parseFloat(medicao.topo_argila) || 0;
  const h2 = parseFloat(medicao.topo_areia)  || 0;
  return {
    ...medicao,
    equivalente: h1 && h2 && h1 > 0 ? ((h2 / h1) * 100).toFixed(2) : "",
  };
}

/**
 * Recalcula a média das medições de equivalente de areia.
 */
export function calcMediaEquivalente(medicoes) {
  const validos = medicoes.filter(m => m.equivalente !== "");
  if (!validos.length) return "";
  return (validos.reduce((s, m) => s + parseFloat(m.equivalente), 0) / validos.length).toFixed(2);
}

// ── Cálculos de materiais pulverulentos ──────────────────────────────────────

/**
 * Recalcula teor_pct de materiais pulverulentos.
 */
export function calcTeorPulverulentos(mpObj) {
  const pi = parseFloat(mpObj.peso_inicial)       || 0;
  const pf = parseFloat(mpObj.peso_apos_lavagem)  || 0;
  return {
    ...mpObj,
    teor_pct: pi && pf && pi > 0 ? ((pi - pf) / pi * 100).toFixed(2) : "",
  };
}

// ── Faixa granulométrica ──────────────────────────────────────────────────────

/**
 * Retorna as peneiras a exibir na tabela com base na faixa ativa.
 */
export function getPeneirasExibidas(faixaGran, faixaSelecionada, material) {
  const faixa = material === "OUTRO" ? faixaSelecionada : faixaGran;
  if (!faixa?.peneiras) return PENEIRAS_PADRAO;
  return faixa.peneiras
    .map(fp => ({ astm: fp.astm, abertura_mm: parseFloat(fp.abertura) }))
    .sort((a, b) => b.abertura_mm - a.abertura_mm);
}

/**
 * Sincroniza a lista de peneiras do formulário com as peneiras da faixa selecionada.
 */
export function syncPeneirasComFaixa(faixa, peneirasAtuais) {
  if (!faixa?.peneiras) return peneirasAtuais;
  const novasPeneiras = faixa.peneiras
    .map(fp => ({ astm: fp.astm, abertura_mm: parseFloat(fp.abertura) }))
    .sort((a, b) => b.abertura_mm - a.abertura_mm);
  return novasPeneiras.map(np => {
    const existente = peneirasAtuais.find(p => Math.abs(p.abertura_mm - np.abertura_mm) < 0.01);
    return existente || { ...np, retido_g: "", passante_g: "", passante_pct: "" };
  });
}

/**
 * Resolve a chave de objeto de faixa de trabalho para uma peneira pelo valor de abertura.
 */
export function getPeneirasKeys(abertura_mm) {
  return {
    pKey:    ABERTURA_KEY_MAP[abertura_mm] || `peneira_${String(abertura_mm).replace(/\./g, "_")}mm`,
    pKeyAlt: ABERTURA_ALT_KEY_MAP[abertura_mm] || null,
  };
}

/**
 * Retorna { min, max } da faixa de trabalho do projeto para uma peneira.
 */
export function getFaixaTrabalho(project, pKey, pKeyAlt) {
  if (!project?.faixa_trabalho_min && !project?.faixa_trabalho_max) return { min: null, max: null };
  const min = project.faixa_trabalho_min?.[pKey] ?? (pKeyAlt ? project.faixa_trabalho_min?.[pKeyAlt] : null);
  const max = project.faixa_trabalho_max?.[pKey] ?? (pKeyAlt ? project.faixa_trabalho_max?.[pKeyAlt] : null);
  return { min, max };
}

/**
 * Retorna { min, max } da especificação da faixa granulométrica para uma peneira.
 * Compara via mapa invertido: pKey/pKeyAlt → abertura em mm → busca na faixa.
 */
export function getEspecificacao(faixa, pKey, pKeyAlt) {
  if (!faixa) return { min: null, max: null };
  // Monta mapa invertido: chave → abertura_mm (número)
  const invertido = {};
  Object.entries(ABERTURA_KEY_MAP).forEach(([mm, k]) => { invertido[k] = parseFloat(mm); });
  Object.entries(ABERTURA_ALT_KEY_MAP).forEach(([mm, k]) => { invertido[k] = parseFloat(mm); });
  const targetMm = invertido[pKey] ?? (pKeyAlt ? invertido[pKeyAlt] : null);
  if (targetMm === null || targetMm === undefined) return { min: null, max: null };
  const peneira = faixa.peneiras?.find(p => Math.abs(parseFloat(p.abertura) - targetMm) < 0.01);
  return peneira ? { min: peneira.min, max: peneira.max } : { min: null, max: null };
}

// ── Filtros ───────────────────────────────────────────────────────────────────

/**
 * Filtra projetos por obra/regional e material.
 */
export function filtrarProjetosPorObra(obraId, material, obras, regionais, projects) {
  const obra = obras.find(o => o.id === obraId);
  if (!obra) return [];
  const regional = regionais.find(r => r.id === obra.regional_id);
  if (!regional?.project_ids) return [];
  let projs = projects.filter(p => regional.project_ids.includes(p.id));
  if (["CAUQ", "MRAF", "BGS"].includes(material)) {
    projs = projs.filter(p => p.tipo_projeto === material);
  }
  return projs;
}

// ── Sanitização para persistência ────────────────────────────────────────────

/**
 * Monta o objeto final para persistência, convertendo strings em números onde necessário.
 */
export function buildDataToSave(formData, saveStatus, editingId, user) {
  return {
    ...formData,
    peneiras: formData.peneiras.map(p => ({
      astm:         p.astm,
      abertura_mm:  p.abertura_mm,
      retido_g:     p.retido_g     ? parseFloat(p.retido_g)     : null,
      passante_g:   p.passante_g   ? parseFloat(p.passante_g)   : null,
      passante_pct: p.passante_pct ? parseFloat(p.passante_pct) : null,
    })),
    status: saveStatus,
    laboratorista_name: formData.laboratorista_name || user?.laboratorista_name || user?.full_name,
    ...(editingId && formData.approved === false && saveStatus === "finalizado"
      ? { approved: null, rejection_reason: null, was_rejected: true }
      : {}),
  };
}