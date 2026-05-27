/**
 * Cálculos e formatações para Ensaio Taxa MRAF
 * Funções puras para validação, cálculo e formatação de dados
 */

/**
 * Retorna template inicial de um ensaio vazio
 */
export const getEnsaioInicial = (numero) => ({
  numero,
  estaca: "",
  posicao: "",
  peso_bandeja_amostra: null,
  peso_bandeja: null,
  peso_amostra: null,
  taxa_mraf_aplicada: null,
  teor_ligante: null,
  taxa_ligante: null,
  residuo_emulsao: null,
  taxa_emulsao: null,
  taxa_agregado: null,
});

/**
 * Calcula todos os valores de um ensaio automaticamente
 * PA = P1 - P2
 * Tₓ = PA / (1000 * A)
 * T_L = (Tₓ * L) / (100 + L)
 * T_E = T_L / R
 * T_A = Tₓ - T_L
 */
export const calcularEnsaio = (ensaio, areaBandeja) => {
  const e = { ...ensaio };

  // PA = P1 - P2
  if (e.peso_bandeja_amostra != null && e.peso_bandeja != null) {
    e.peso_amostra = parseFloat((e.peso_bandeja_amostra - e.peso_bandeja).toFixed(2));
  } else {
    e.peso_amostra = null;
  }

  // Tₓ = PA / (1000 * A)
  if (e.peso_amostra != null && areaBandeja) {
    e.taxa_mraf_aplicada = parseFloat((e.peso_amostra / (1000 * areaBandeja)).toFixed(3));
  } else {
    e.taxa_mraf_aplicada = null;
  }

  // T_L = (Tₓ * L) / (100 + L)
  if (e.taxa_mraf_aplicada != null && e.teor_ligante != null) {
    e.taxa_ligante = parseFloat(((e.taxa_mraf_aplicada * e.teor_ligante) / (100 + e.teor_ligante)).toFixed(3));
  } else {
    e.taxa_ligante = null;
  }

  // T_E = T_L / R
  if (e.taxa_ligante != null && e.residuo_emulsao != null && e.residuo_emulsao !== 0) {
    e.taxa_emulsao = parseFloat((e.taxa_ligante / (e.residuo_emulsao / 100)).toFixed(3));
  } else {
    e.taxa_emulsao = null;
  }

  // T_A = Tₓ - T_L
  if (e.taxa_mraf_aplicada != null && e.taxa_ligante != null) {
    e.taxa_agregado = parseFloat((e.taxa_mraf_aplicada - e.taxa_ligante).toFixed(3));
  } else {
    e.taxa_agregado = null;
  }

  return e;
};

/**
 * Calcula médias dos ensaios válidos
 */
export const calcularMedias = (ensaios) => {
  const validos = ensaios.filter(e => e.taxa_mraf_aplicada != null);
  if (validos.length === 0) {
    return {
      media_taxa_emulsao: null,
      media_taxa_agregado: null,
      media_taxa_mraf: null
    };
  }

  const comEmulsao = validos.filter(e => e.taxa_emulsao != null);
  const comAgregado = validos.filter(e => e.taxa_agregado != null);

  const media_taxa_emulsao = comEmulsao.length > 0
    ? parseFloat((comEmulsao.reduce((s, e) => s + e.taxa_emulsao, 0) / comEmulsao.length).toFixed(3))
    : null;

  const media_taxa_agregado = comAgregado.length > 0
    ? parseFloat((comAgregado.reduce((s, e) => s + e.taxa_agregado, 0) / comAgregado.length).toFixed(3))
    : null;

  const media_taxa_mraf = parseFloat((validos.reduce((s, e) => s + e.taxa_mraf_aplicada, 0) / validos.length).toFixed(3));

  return {
    media_taxa_emulsao,
    media_taxa_agregado,
    media_taxa_mraf
  };
};

/**
 * Verifica se ensaio está não conforme em relação à taxa mínima
 */
export const isNaoConforme = (taxaMraf, taxaMinima) => {
  return taxaMinima != null && taxaMraf != null && taxaMraf < taxaMinima;
};

/**
 * Calcula área da bandeja em m² (converte de cm²)
 */
export const calcularAreaBandeja = (lado1, lado2) => {
  if (!lado1 || !lado2) return null;
  return parseFloat(((lado1 * lado2) / 10000).toFixed(4));
};

/**
 * Formata taxa para 1 casa decimal
 */
export const formatarTaxa = (valor) => {
  return valor != null ? valor.toFixed(1) : '-';
};

/**
 * Formata peso para 2 casas decimais
 */
export const formatarPeso = (valor) => {
  return valor != null ? valor.toFixed(2) : '-';
};