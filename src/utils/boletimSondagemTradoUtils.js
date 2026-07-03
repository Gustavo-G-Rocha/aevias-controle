/**
 * Funções puras para Boletim de Sondagem a Trado.
 * Sem side effects, sem chamadas de API.
 * DNER-ME 213/94 e DNER-ME 092/94
 */

import { filtrarObrasPorAcessoRegional } from '@/utils/regionalFilter';

// ── Estruturas iniciais ────────────────────────────────────────────────────────

export const getCamadaInicial = (numero) => ({
  numero,
  prof_de: numero === 1 ? 0 : null,
  prof_ate: null,
  espessura: null,
  na: null,
  classificacao_1: "",
});

export const CAMADAS_PADRAO = [1, 2, 3, 4, 5].map(getCamadaInicial);

export const getDensidadeInicial = () => ({
  camada_ensaiada: "",
  peso_frasco_antes: null,
  peso_frasco_depois: null,
  peso_areia_deslocada: null,
  peso_areia_funil_placa: null,
  peso_areia_cavidade: null,
  massa_esp_aparente_areia: 1.2,
  volume_buraco: null,
  peso_solo_recipiente: null,
  peso_recipiente: null,
  peso_solo: null,
  densidade_aparente_solo_umido: null,
  peso_solo_umido: null,
  peso_solo_seco: null,
  peso_agua: null,
  teor_umidade: null,
  densidade_aparente_solo_seco: null,
});

export const getInitialFormData = () => ({
  obra_id: "",
  data: new Date().toISOString().split('T')[0],
  cliente: "",
  pista: "",
  bordo: "",
  rodovia: "",
  km: "",
  furo: "",
  operador: "",
  face_classificacao_1: "",
  camadas: CAMADAS_PADRAO,
  umidade_natural: {
    camada_ensaiada_1: "", camada_ensaiada_2: "",
    no_capsula_1: "", no_capsula_2: "",
    massa_capsula_1: null, massa_capsula_2: null,
    massa_cap_solo_umido_1: null, massa_cap_solo_umido_2: null,
    massa_cap_solo_seco_1: null, massa_cap_solo_seco_2: null,
    massa_agua_1: null, massa_agua_2: null,
    massa_solo_seco_1: null, massa_solo_seco_2: null,
    umidade_1: null, umidade_2: null,
  },
  umidade_natural_2: null,
  ensaio_insitu_realizado: false,
  densidades_in_situ: [getDensidadeInicial()],
  observacoes: "",
  fotos: [],
});

export const getUmidadeNatural2Inicial = () => ({
  camada_ensaiada_1: "",
  no_capsula_1: "", no_capsula_2: "",
  massa_capsula_1: null, massa_capsula_2: null,
  massa_cap_solo_umido_1: null, massa_cap_solo_umido_2: null,
  massa_cap_solo_seco_1: null, massa_cap_solo_seco_2: null,
  massa_agua_1: null, massa_agua_2: null,
  massa_solo_seco_1: null, massa_solo_seco_2: null,
  umidade_1: null, umidade_2: null,
});

// ── Cálculos de umidade ────────────────────────────────────────────────────────

/**
 * Calcula água, solo seco e umidade para um lado (1 ou 2) do ensaio de umidade.
 * @param {object} un - objeto umidade_natural
 * @param {1|2} lado
 * @returns {{ agua: number|null, soloSeco: number|null, umidade: number|null }}
 */
export function calcularUmidade(un, lado) {
  const capSoloUmido = un[`massa_cap_solo_umido_${lado}`];
  const capSoloSeco = un[`massa_cap_solo_seco_${lado}`];
  const capsula = un[`massa_capsula_${lado}`];

  if (capSoloUmido && capSoloSeco && capsula !== null) {
    const agua = parseFloat((capSoloUmido - capSoloSeco).toFixed(2));
    const soloSeco = parseFloat((capSoloSeco - capsula).toFixed(2));
    const umidade = soloSeco > 0 ? parseFloat(((agua / soloSeco) * 100).toFixed(2)) : null;
    return { agua, soloSeco, umidade };
  }
  return { agua: null, soloSeco: null, umidade: null };
}

/**
 * Retorna a umidade média representativa de um bloco umidade_natural.
 * @param {object} un - objeto com umidade_1 e umidade_2
 * @returns {number|null}
 */
export function calcularUmidadeMedia(u1, u2) {
  if (u1 == null && u2 == null) return null;
  if (u1 != null && u2 != null) return parseFloat(((u1 + u2) / 2).toFixed(2));
  return u1 ?? u2;
}

// ── Cálculo de densidade in situ ───────────────────────────────────────────────

/**
 * Calcula todos os campos derivados de uma medição de densidade in situ.
 * @param {object} d - objeto de uma densidades_in_situ
 * @returns {object} com campos calculados
 */
export function calcularDensidade(d) {
  const areiaDeslocada =
    d.peso_areia_funil_placa != null && d.peso_frasco_antes != null && d.peso_frasco_depois != null
      ? parseFloat((d.peso_frasco_antes - d.peso_frasco_depois).toFixed(2))
      : null;

  const areiaCavidade =
    areiaDeslocada != null && d.peso_areia_funil_placa != null
      ? parseFloat((areiaDeslocada - d.peso_areia_funil_placa).toFixed(2))
      : null;

  const volumeBuraco =
    areiaCavidade != null && d.massa_esp_aparente_areia
      ? parseFloat((areiaCavidade / d.massa_esp_aparente_areia).toFixed(3))
      : null;

  const pesoSolo =
    d.peso_solo_recipiente != null && d.peso_recipiente != null
      ? parseFloat((d.peso_solo_recipiente - d.peso_recipiente).toFixed(2))
      : null;

  const densidadeUmida =
    pesoSolo != null && volumeBuraco
      ? parseFloat((pesoSolo / volumeBuraco).toFixed(3))
      : null;

  const pesoAgua =
    d.peso_solo_umido != null && d.peso_solo_seco != null
      ? parseFloat((d.peso_solo_umido - d.peso_solo_seco).toFixed(2))
      : null;

  const teorUmidade =
    pesoAgua != null && d.peso_solo_seco
      ? parseFloat(((pesoAgua / d.peso_solo_seco) * 100).toFixed(2))
      : null;

  const densidadeSeca =
    densidadeUmida != null && teorUmidade != null
      ? parseFloat((densidadeUmida / (1 + teorUmidade / 100)).toFixed(3))
      : null;

  return {
    peso_areia_deslocada: areiaDeslocada,
    peso_areia_cavidade: areiaCavidade,
    volume_buraco: volumeBuraco,
    peso_solo: pesoSolo,
    densidade_aparente_solo_umido: densidadeUmida,
    peso_agua: pesoAgua,
    teor_umidade: teorUmidade,
    densidade_aparente_solo_seco: densidadeSeca,
  };
}

// ── Filtro de obras ────────────────────────────────────────────────────────────

/**
 * Filtra obras disponíveis para sondagem a trado conforme nível de acesso do usuário.
 * @param {Array} obrasData
 * @param {Array} regionaisData
 * @param {object} currentUser - { email, access_level, role }
 * @returns {Array}
 */
export function filtrarObrasParaTrado(obrasData, regionaisData, currentUser) {
  const accessLevel = currentUser.access_level || (currentUser.role === 'admin' ? 'admin' : 'user');
  const exigeEmAndamento = accessLevel === 'user';
  const porAcesso = filtrarObrasPorAcessoRegional(obrasData, regionaisData, currentUser);
  return porAcesso.filter(
    o => o.tipo_obra === 'sondagem' && (!exigeEmAndamento || o.status === 'em_andamento')
  );
}