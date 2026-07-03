/**
 * Funções puras para EnsaioTaxaPinturaImprimacao.
 * Sem side effects, sem chamadas de API.
 * Referência: DNIT 145/2012 - ES
 */

import { filtrarObrasPorAcessoRegional } from '@/utils/regionalFilter';

// ── Estrutura inicial ─────────────────────────────────────────────────────────

export const getEnsaioInicial = (numero) => ({
  numero,
  hora: "",
  camada: "",
  material_camada: "",
  estaca: "",
  temperatura_aplicacao: null,
  peso_bandeja_amostra: null,
  peso_bandeja: null,
  peso_emulsao: null,
  taxa_aplicada: null,
  taxa_emulsao_aplicada: null,
  taxa_residual: null,
  ensaio_residuo: {
    data: "",
    tara: null,
    peso_inicial: null,
    peso_final: null,
    residuo: null,
  },
});

export const getInitialForm = () => ({
  obra_id: "",
  data_ensaio: new Date().toISOString().split('T')[0],
  rodovia: "",
  trecho: "",
  material: "",
  placa_caminhao: "",
  tipo_servico: "imprimacao",
  ensaio_realizado_por: "Afirma Evias",
  dimensoes_bandeja: { lado_1: null, lado_2: null, area: null },
  ensaios: [getEnsaioInicial(1)],
  observacoes: "",
});

// ── Cálculo da área da bandeja ────────────────────────────────────────────────

/**
 * Calcula a área da bandeja a partir dos dois lados (cm → m²).
 * @returns {number|null}
 */
export function calcularAreaBandeja(lado1, lado2) {
  if (lado1 && lado2) {
    return parseFloat((lado1 * lado2 / 10000).toFixed(4));
  }
  return null;
}

// ── Cálculo de um ensaio individual ──────────────────────────────────────────

/**
 * Recalcula todos os campos derivados de um ensaio.
 * @param {object} ensaio
 * @param {number|null} areaBandeja - área em m²
 * @returns {object} novo ensaio com campos recalculados (imutável)
 */
export function calcularEnsaio(ensaio, areaBandeja) {
  const novo = { ...ensaio, ensaio_residuo: { ...ensaio.ensaio_residuo } };

  // Peso da emulsão = Peso bandeja+amostra - Peso bandeja
  if (ensaio.peso_bandeja_amostra && ensaio.peso_bandeja) {
    novo.peso_emulsao = parseFloat((ensaio.peso_bandeja_amostra - ensaio.peso_bandeja).toFixed(2));
  }

  // Taxa aplicada = Peso emulsão / (1000 × Área)
  if (novo.peso_emulsao && areaBandeja) {
    novo.taxa_aplicada = parseFloat((novo.peso_emulsao / (1000 * areaBandeja)).toFixed(2));
  }

  // Resíduo (%) = ((Peso final - Tara) / (Peso inicial - Tara)) × 100
  const r = ensaio.ensaio_residuo;
  if (r?.peso_inicial && r?.peso_final && r?.tara) {
    novo.ensaio_residuo.residuo = parseFloat(
      (((r.peso_final - r.tara) / (r.peso_inicial - r.tara)) * 100).toFixed(2)
    );
  }

  // Taxa de emulsão aplicada = Taxa aplicada × (Resíduo / 100)
  if (novo.taxa_aplicada && novo.ensaio_residuo?.residuo) {
    novo.taxa_emulsao_aplicada = parseFloat(
      (novo.taxa_aplicada * (novo.ensaio_residuo.residuo / 100)).toFixed(4)
    );
  }

  // Taxa residual = Taxa aplicada × (Resíduo / 100)
  if (novo.taxa_aplicada && novo.ensaio_residuo?.residuo) {
    novo.taxa_residual = parseFloat(
      (novo.taxa_aplicada * (novo.ensaio_residuo.residuo / 100)).toFixed(4)
    );
  }

  return novo;
}

// ── Filtro de obras ───────────────────────────────────────────────────────────

const TIPOS_OBRA_VALIDOS = ['implantacao', 'conservacao', 'supervisao'];

/**
 * Filtra obras visíveis conforme o nível de acesso do usuário.
 * Laboratorista (user) vê apenas obras da sua regional, em andamento e de tipo válido.
 * Admin/sala técnica veem todas as obras de tipo válido.
 */
export function filtrarObrasDisponiveis(obrasData, regionaisData, userData) {
  const accessLevel = userData?.access_level || (userData?.role === 'admin' ? 'admin' : 'user');
  const tiposSet = new Set(TIPOS_OBRA_VALIDOS);
  const exigeEmAndamento = accessLevel === 'user';
  const porAcesso = filtrarObrasPorAcessoRegional(obrasData, regionaisData, userData);
  return porAcesso.filter(o =>
    tiposSet.has(o.tipo_obra) && (!exigeEmAndamento || o.status === 'em_andamento')
  );
}