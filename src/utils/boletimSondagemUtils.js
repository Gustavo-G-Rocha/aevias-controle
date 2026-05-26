/**
 * Funções puras do Boletim de Sondagem.
 * Sem dependências de React, SDK ou estado.
 */

export const getCamadaInicial = (numero) => ({
  numero,
  prof_de: numero === 1 ? 0 : null,
  prof_ate: null,
  espessura: null,
  na: null,
  classificacao_1: "",
  classificacao_2: null,
});

export const CAMADAS_PADRAO = [1, 2, 3, 4, 5].map(getCamadaInicial);

export const getDensidadeInicial = () => ({
  camada_ensaiada: "",
  peso_frasco_antes: null, peso_frasco_depois: null,
  peso_areia_deslocada: null, peso_areia_funil_placa: null,
  peso_areia_cavidade: null,
  massa_esp_aparente_areia: 1.2,
  volume_buraco: null,
  peso_solo_recipiente: null, peso_recipiente: null, peso_solo: null,
  densidade_aparente_solo_umido: null,
  peso_solo_umido: null, peso_solo_seco: null, peso_agua: null,
  teor_umidade: null, densidade_aparente_solo_seco: null,
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
  camadas: CAMADAS_PADRAO.map(c => ({ ...c, classificacao_2: null })),
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

/**
 * Calcula massa de água, solo seco e umidade para um lado (1 ou 2) do ensaio de umidade natural.
 */
export const calcularUmidade = (un, lado) => {
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
};

/**
 * Calcula todos os campos derivados de um ensaio de densidade in situ.
 */
export const calcularDensidade = (d) => {
  const areiaDeslocada = d.peso_areia_funil_placa !== null && d.peso_frasco_antes !== null && d.peso_frasco_depois !== null
    ? parseFloat((d.peso_frasco_antes - d.peso_frasco_depois).toFixed(2))
    : null;
  const areiaCavidade = areiaDeslocada !== null && d.peso_areia_funil_placa !== null
    ? parseFloat((areiaDeslocada - d.peso_areia_funil_placa).toFixed(2))
    : null;
  const volumeBuraco = areiaCavidade !== null && d.massa_esp_aparente_areia
    ? parseFloat((areiaCavidade / d.massa_esp_aparente_areia).toFixed(3))
    : null;
  const pesoSolo = d.peso_solo_recipiente !== null && d.peso_recipiente !== null
    ? parseFloat((d.peso_solo_recipiente - d.peso_recipiente).toFixed(2))
    : null;
  const densidadeUmida = pesoSolo !== null && volumeBuraco
    ? parseFloat((pesoSolo / volumeBuraco).toFixed(3))
    : null;
  const pesoAgua = d.peso_solo_umido !== null && d.peso_solo_seco !== null
    ? parseFloat((d.peso_solo_umido - d.peso_solo_seco).toFixed(2))
    : null;
  const teorUmidade = pesoAgua !== null && d.peso_solo_seco
    ? parseFloat(((pesoAgua / d.peso_solo_seco) * 100).toFixed(2))
    : null;
  const densidadeSeca = densidadeUmida !== null && teorUmidade !== null
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
};

/**
 * Calcula a umidade média (%) a partir de dois valores de umidade.
 * Retorna null se nenhum valor estiver disponível.
 */
export const calcularUmidadeMedia = (u1, u2) => {
  if (u1 !== null && u1 !== undefined && u2 !== null && u2 !== undefined) {
    return parseFloat(((u1 + u2) / 2).toFixed(2));
  }
  if (u1 !== null && u1 !== undefined) return parseFloat(u1.toFixed(2));
  return null;
};

/**
 * Reconstrói o array de densidades a partir de um boletim salvo,
 * mantendo compatibilidade retroativa com o campo legado densidade_in_situ.
 */
export const normalizarDensidades = (boletim) => {
  if (boletim.densidades_in_situ?.length > 0) return boletim.densidades_in_situ;
  if (boletim.densidade_in_situ) return [{ ...getDensidadeInicial(), ...boletim.densidade_in_situ }];
  return [getDensidadeInicial()];
};

/**
 * Recalcula a espessura e propagação de profundidades em um array de camadas
 * após a alteração de um campo.
 */
export const recalcularCamadas = (camadas, index, field, value) => {
  const newCamadas = camadas.map(c => ({ ...c }));
  newCamadas[index] = { ...newCamadas[index], [field]: value };

  if (field === 'prof_de' && index === 0) {
    const { prof_de, prof_ate } = newCamadas[0];
    newCamadas[0].espessura = prof_de !== null && prof_ate !== null
      ? parseFloat((prof_ate - prof_de).toFixed(2)) : null;
  }

  if (field === 'prof_ate') {
    const { prof_de, prof_ate } = newCamadas[index];
    newCamadas[index].espessura = prof_de !== null && prof_ate !== null
      ? parseFloat((prof_ate - prof_de).toFixed(2)) : null;
    if (index + 1 < newCamadas.length) {
      newCamadas[index + 1].prof_de = prof_ate;
      const nextAte = newCamadas[index + 1].prof_ate;
      newCamadas[index + 1].espessura = prof_ate !== null && nextAte !== null
        ? parseFloat((nextAte - prof_ate).toFixed(2)) : null;
    }
  }

  if (field === 'prof_ate_2') {
    const { prof_de_2, prof_ate_2 } = newCamadas[index];
    newCamadas[index].espessura_2 = prof_de_2 !== null && prof_ate_2 !== null
      ? parseFloat((prof_ate_2 - prof_de_2).toFixed(2)) : null;
    if (index + 1 < newCamadas.length) {
      newCamadas[index + 1].prof_de_2 = prof_ate_2;
      const nextAte2 = newCamadas[index + 1].prof_ate_2;
      newCamadas[index + 1].espessura_2 = prof_ate_2 !== null && nextAte2 !== null
        ? parseFloat((nextAte2 - prof_ate_2).toFixed(2)) : null;
    }
  }

  if (field === 'prof_de_2') {
    const { prof_de_2, prof_ate_2 } = newCamadas[index];
    newCamadas[index].espessura_2 = prof_de_2 !== null && prof_ate_2 !== null
      ? parseFloat((prof_ate_2 - prof_de_2).toFixed(2)) : null;
  }

  return newCamadas;
};

/**
 * Remove uma camada pelo índice e reprocessa os prof_de/espessura das restantes.
 */
export const removerCamadaDoArray = (camadas, index) => {
  if (camadas.length <= 1) return camadas;
  const newCamadas = camadas.filter((_, i) => i !== index).map((c, i) => ({ ...c, numero: i + 1 }));
  for (let i = index; i < newCamadas.length; i++) {
    newCamadas[i].prof_de = i === 0 ? 0 : (newCamadas[i - 1].prof_ate ?? null);
    const { prof_de, prof_ate } = newCamadas[i];
    newCamadas[i].espessura = prof_de !== null && prof_ate !== null
      ? parseFloat((prof_ate - prof_de).toFixed(2)) : null;
  }
  return newCamadas;
};