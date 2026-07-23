/**
 * Funções puras para Ensaio Proctor.
 * Sem side effects, sem chamadas de API.
 * ABNT NBR 7182:2016 — Compactação de Solos
 */

import { filtrarObrasPorAcessoRegional } from '@/utils/regionalFilter';

// ── Estruturas iniciais ────────────────────────────────────────────────────────

export const getUmidadePontoInicial = () => ({
  capsula_numero_1: "",
  capsula_solo_umido_1: "",
  capsula_solo_seco_1: "",
  peso_capsula_1: "",
  teor_umidade_1: 0,
  capsula_numero_2: "",
  capsula_solo_umido_2: "",
  capsula_solo_seco_2: "",
  peso_capsula_2: "",
  teor_umidade_2: 0,
  teor_umidade_media: 0,
});

export const getDensidadePontoInicial = () => ({
  cilindro_numero: "",
  cilindro_solo_umido: "",
  peso_cilindro: "",
  peso_solo_umido: 0,
  volume_cilindro: "",
  agua_adicionada_ml: "",
  peso_amostra_umida: "",
  peso_seco: 0,
  umidade_calculada: 0,
  dens_ap_umida: 0,
  dens_ap_seca: 0,
});

export const getCBRCilindroInicial = () => ({
  cilindro_numero: "",
  fator_anel: "",
  leituras: Array(9).fill(""),
  isc254: null,
  isc508: null,
  isc: null,
});

export const getExpansaoCilindroInicial = () => ({
  cilindro_numero: "",
  data: new Date().toISOString().split("T")[0],
  hora: "",
  altura_inicial: "",
  leitura_1dia: "",
  leitura_2dia: "",
  leitura_3dia: "",
  leitura_4dia: "",
  massa_solo_final: "",
});

export const getInitialForm = (obraId = "") => ({
  obra_id: obraId,
  project_id: "",
  data_ensaio: new Date().toISOString().split("T")[0],
  horario: "",
  laboratorista_name: "",
  cliente: "",
  contrato: "",
  rodovia: "",
  trecho: "",
  local_coleta: "",
  camada: "",
  material: "",
  procedencia: "",
  num_golpes: 12,
  energia_compactacao: "Normal",
  correcao_densidade: "higroscopica",
  umidade_higroscopica: "",
  umidades: Array(5).fill(null).map(getUmidadePontoInicial),
  densidades: Array(5).fill(null).map(getDensidadePontoInicial),
  umidade_media: 0,
  densidade_maxima_seca: "",
  umidade_otima: "",
  isc_cbr: "",
  expansao: "",
  observacoes: "",
  realizar_cbr_expansao: false,
  realizar_limites: false,
  limites: null,
  cbr_fator_anel: "",
  cbr_cilindros: Array(5).fill(null).map(getCBRCilindroInicial),
  expansao_cilindros: Array(5).fill(null).map(getExpansaoCilindroInicial),
  status: "rascunho",
});

// ── Número de golpes por energia ──────────────────────────────────────────────

export const GOLPES_POR_ENERGIA = {
  Normal: 12,
  Intermediária: 26,
  Modificada: 55,
};

// ── Cálculo de umidade de um ponto ────────────────────────────────────────────

/**
 * Calcula teor de umidade para um par de cápsulas de um ponto.
 * @param {object} u - objeto umidade do ponto
 * @returns {{ teor1: number, teor2: number, media: number }}
 */
export function calcularTeorUmidade(u) {
  const p4_1 = parseFloat(u.capsula_solo_umido_1);
  const p5_1 = parseFloat(u.capsula_solo_seco_1);
  const p6_1 = parseFloat(u.peso_capsula_1);
  const p4_2 = parseFloat(u.capsula_solo_umido_2);
  const p5_2 = parseFloat(u.capsula_solo_seco_2);
  const p6_2 = parseFloat(u.peso_capsula_2);

  let teor1 = 0, teor2 = 0;
  if (!isNaN(p4_1) && !isNaN(p5_1) && !isNaN(p6_1)) {
    const pss = p5_1 - p6_1;
    teor1 = pss > 0 ? (p4_1 - p5_1) / pss * 100 : 0;
  }
  if (!isNaN(p4_2) && !isNaN(p5_2) && !isNaN(p6_2)) {
    const pss = p5_2 - p6_2;
    teor2 = pss > 0 ? (p4_2 - p5_2) / pss * 100 : 0;
  }

  const count = (teor1 > 0 ? 1 : 0) + (teor2 > 0 ? 1 : 0);
  const media = count > 0 ? (teor1 + teor2) / count : 0;

  return {
    teor1: parseFloat(teor1.toFixed(2)),
    teor2: parseFloat(teor2.toFixed(2)),
    media: parseFloat(media.toFixed(2)),
  };
}

// ── Recálculo de densidades ────────────────────────────────────────────────────

/**
 * Recalcula todos os 5 pontos de densidade.
 * Função pura — não produz side effects.
 */
export function recalcDensidades(densidades, umidade_higroscopica, correcao, umidades, umidade_media) {
  return densidades.map((d, index) => {
    const p1 = parseFloat(d.cilindro_solo_umido);
    const p2 = parseFloat(d.peso_cilindro);
    const v  = parseFloat(d.volume_cilindro);

    if (isNaN(p1) || isNaN(p2) || isNaN(v) || v <= 0) return d;

    const pesoSoloUmido = p1 - p2;
    const gammaW = pesoSoloUmido / v;

    let pesoSeco = 0;
    let umidadeCalc = 0;
    let tW = 0;

    if (correcao === "higroscopica") {
      const uhigro = umidades[0]?.teor_umidade_media || parseFloat(umidade_higroscopica) || 0;
      const pesoAmUmida = parseFloat(d.peso_amostra_umida);
      if (!isNaN(uhigro) && uhigro > 0 && !isNaN(pesoAmUmida) && pesoAmUmida > 0) {
        pesoSeco = (pesoAmUmida / (100 + uhigro)) * 100;
        const aguaAdd = parseFloat(d.agua_adicionada_ml);
        if (!isNaN(aguaAdd) && pesoSeco > 0) {
          umidadeCalc = (aguaAdd / pesoSeco) * 100 + uhigro;
        }
      }
      tW = umidades[0]?.teor_umidade_media || 0;
    } else {
      tW = umidades[index]?.teor_umidade_media || umidade_media || 0;
    }

    const wParaSeca = correcao === "higroscopica" ? umidadeCalc : tW;
    const gammaS = wParaSeca > 0 ? gammaW / (1 + wParaSeca / 100) : 0;

    return {
      ...d,
      peso_solo_umido: parseFloat(pesoSoloUmido.toFixed(2)),
      peso_seco: parseFloat(pesoSeco.toFixed(2)),
      umidade_calculada: parseFloat(umidadeCalc.toFixed(2)),
      dens_ap_umida: parseFloat(gammaW.toFixed(3)),
      dens_ap_seca: parseFloat(gammaS.toFixed(3)),
    };
  });
}

// ── Sanitização para salvar ───────────────────────────────────────────────────

/**
 * Converte strings vazias/inválidas para null (campos numéricos).
 */
export const sanitizeNum = (v) =>
  (v === '' || v === null || v === undefined) ? null : isNaN(Number(v)) ? null : Number(v);

/**
 * Sanitiza o objeto form completo antes de enviar para a API.
 */
export function sanitizeFormForSave(form) {
  const numFieldsU = [
    'capsula_solo_umido_1','capsula_solo_seco_1','peso_capsula_1',
    'teor_umidade_1','teor_umidade_2','teor_umidade_media',
    'capsula_solo_umido_2','capsula_solo_seco_2','peso_capsula_2',
  ];

  const cleanUmidades = form.umidades.map(u => ({
    ...u,
    ...Object.fromEntries(numFieldsU.map(f => [f, sanitizeNum(u[f])])),
  }));

  const cleanDensidades = form.densidades.map(d => ({
    ...d,
    cilindro_solo_umido: sanitizeNum(d.cilindro_solo_umido),
    peso_cilindro: sanitizeNum(d.peso_cilindro),
    volume_cilindro: sanitizeNum(d.volume_cilindro),
    agua_adicionada_ml: sanitizeNum(d.agua_adicionada_ml),
    peso_amostra_umida: sanitizeNum(d.peso_amostra_umida),
  }));

  const cleanCBR = (form.cbr_cilindros || []).map(c => ({
    ...c,
    fator_anel: sanitizeNum(c.fator_anel),
    isc254: sanitizeNum(c.isc254),
    isc508: sanitizeNum(c.isc508),
    isc: sanitizeNum(c.isc),
    leituras: (c.leituras || []).map(l => sanitizeNum(l) ?? 0),
  }));

  const cleanExpansao = (form.expansao_cilindros || []).map(e => ({
    ...e,
    altura_inicial: sanitizeNum(e.altura_inicial),
    leitura_1dia: sanitizeNum(e.leitura_1dia),
    leitura_2dia: sanitizeNum(e.leitura_2dia),
    leitura_3dia: sanitizeNum(e.leitura_3dia),
    leitura_4dia: sanitizeNum(e.leitura_4dia),
    massa_solo_final: sanitizeNum(e.massa_solo_final),
    diferenca: sanitizeNum(e.diferenca),
    expansao_pct: sanitizeNum(e.expansao_pct),
  }));

  // Limites (caracterização LL/LP/granulometria): campos numéricos digitados
  // como texto chegam vazios ("") quando o laboratorista preenche só parte do
  // ensaio — o schema rejeita string vazia em campo number e o salvamento
  // inteiro falhava. Converte vazios para null, como nas demais seções.
  const numFieldsLimites = [
    'higro_solo_umido_capsula_1', 'higro_solo_umido_capsula_2',
    'higro_solo_seco_capsula_1', 'higro_solo_seco_capsula_2',
    'higro_peso_capsula_1', 'higro_peso_capsula_2',
    'amostra_total_umida', 'amostra_total_seca',
    'amostra_parcial_umida', 'amostra_parcial_seca',
  ];
  const cleanLimites = form.limites
    ? {
        ...form.limites,
        ...Object.fromEntries(numFieldsLimites.map(f => [f, sanitizeNum(form.limites[f])])),
      }
    : form.limites;

  return {
    ...form,
    limites: cleanLimites,
    umidades: cleanUmidades,
    densidades: cleanDensidades,
    cbr_cilindros: cleanCBR,
    expansao_cilindros: cleanExpansao,
    cbr_fator_anel: sanitizeNum(form.cbr_fator_anel),
    umidade_higroscopica: sanitizeNum(form.umidade_higroscopica),
    densidade_maxima_seca: sanitizeNum(form.densidade_maxima_seca),
    umidade_otima: sanitizeNum(form.umidade_otima),
    isc_cbr: sanitizeNum(form.isc_cbr),
    expansao: sanitizeNum(form.expansao),
    num_golpes: sanitizeNum(form.num_golpes),
    umidade_media: sanitizeNum(form.umidade_media),
  };
}

// ── Filtro de obras ────────────────────────────────────────────────────────────

/**
 * Filtra obras visíveis para o usuário.
 * Admin/sala técnica/gestor veem todas; laboratorista (role=user) só vê as da sua regional.
 */
export function filtrarObrasProctor(obrasData, regionaisData, userData) {
  return filtrarObrasPorAcessoRegional(obrasData, regionaisData, userData);
}

// ── Validação de campos obrigatórios ──────────────────────────────────────────

export const REQUIRED_FIELDS = [
  { field: 'obra_id',      label: 'Obra' },
  { field: 'rodovia',      label: 'Rodovia' },
  { field: 'trecho',       label: 'Trecho' },
  { field: 'local_coleta', label: 'Local de Coleta' },
  { field: 'camada',       label: 'Camada' },
  { field: 'material',     label: 'Material' },
  { field: 'procedencia',  label: 'Procedência' },
];

/**
 * Retorna lista de campos obrigatórios não preenchidos.
 */
export function getEmptyRequiredFields(form) {
  return REQUIRED_FIELDS.filter(f => !form[f.field]);
}