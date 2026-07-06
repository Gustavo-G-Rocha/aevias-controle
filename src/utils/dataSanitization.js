/**
 * Utilities para sanitização de dados em formulários
 * Garante que valores vazios são convertidos para null
 * e números são corretamente parseados
 */

/**
 * Sanitiza uma string removendo tags HTML e protocolos perigosos.
 * Defense-in-depth contra XSS — aplicado em texto livre antes de persistir.
 */
export const sanitizeText = (value) => {
  if (typeof value !== 'string' || !value) return value;
  return value
    .replace(/<[^>]*>/g, '')       // remove tags HTML
    .replace(/javascript:/gi, ''); // remove protocolo javascript:
};

/**
 * Percorre recursivamente um objeto/array sanitizando todas as strings.
 * Não modifica o objeto original.
 */
export const sanitizeTextFields = (data) => {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return sanitizeText(data);
  if (Array.isArray(data)) return data.map(sanitizeTextFields);
  if (typeof data === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = sanitizeTextFields(value);
    }
    return result;
  }
  return data;
};

export const sanitizeNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

export const sanitizeNestedNumbers = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeNestedNumbers(value);
    } else {
      result[key] = sanitizeNumber(value);
    }
  }
  return result;
};

/**
 * Sanitiza um array de agregados, convertendo campos numéricos vazios para null.
 * Extraído de EnsaioGranulometriaIndividual.
 */
export const sanitizeAgregados = (agregados) => agregados.map(ag => ({
  ...ag,
  peso_umido: sanitizeNumber(ag.peso_umido),
  peso_seco: sanitizeNumber(ag.peso_seco),
  agua: sanitizeNumber(ag.agua),
  umidade: sanitizeNumber(ag.umidade),
  granulometria: Object.fromEntries(
    Object.entries(ag.granulometria || {}).map(([k, v]) => [k, {
      retido: v ? sanitizeNumber(v.retido) : null,
      passante: v ? sanitizeNumber(v.passante) : null,
    }])
  ),
}));

/**
 * Sanitiza o objeto de equivalente de areia, convertendo campos numéricos vazios para null.
 * Extraído de EnsaioGranulometriaIndividual.
 */
export const sanitizeEquivalenteAreia = (eq) => ({
  medicoes: (eq.medicoes || []).map(m => ({
    topo_argila: sanitizeNumber(m.topo_argila),
    topo_areia: sanitizeNumber(m.topo_areia),
    equivalente: sanitizeNumber(m.equivalente),
  })),
  media: sanitizeNumber(eq.media),
});

export const sanitizeProjectData = (formData, tipoProject) => {
  const sanitizeString = (value) => value || null;
  
  switch (tipoProject) {
    case 'CARTA_TRACO_CONCRETO':
      return {
        tipo_projeto: 'CARTA_TRACO_CONCRETO',
        regional_id: formData.regional_id || null,
        name: formData.name,
        client: formData.client,
        location: formData.location || null,
        description: formData.description || null,
        status: formData.status,
        fck: sanitizeNumber(formData.carta_traco_concreto.fck),
        slump_projeto: sanitizeNumber(formData.carta_traco_concreto.slump_projeto),
        slump_minimo: sanitizeNumber(formData.carta_traco_concreto.slump_minimo),
        slump_maximo: sanitizeNumber(formData.carta_traco_concreto.slump_maximo),
        consumo_agua: sanitizeNumber(formData.carta_traco_concreto.consumo_agua),
        tipo_aditivo: sanitizeString(formData.carta_traco_concreto.tipo_aditivo),
        tipo_cimento: sanitizeString(formData.carta_traco_concreto.tipo_cimento),
        concreteira: sanitizeString(formData.carta_traco_concreto.concreteira)
      };

    case 'CAMADAS_GRANULARES':
      const sanitizedAgregados = formData.agregados.map(agregado => ({
        ...agregado,
        percentual_mistura: sanitizeNumber(agregado.percentual_mistura),
        granulometria: sanitizeNestedNumbers(agregado.granulometria)
      }));

      return {
        tipo_projeto: 'CAMADAS_GRANULARES',
        regional_id: formData.regional_id || null,
        name: formData.name,
        client: formData.client,
        location: formData.location || null,
        description: formData.description || null,
        status: formData.status,
        faixa_granulometrica_id: formData.faixa_granulometrica_id || null,
        agregados: sanitizedAgregados,
        melhorador_utilizado: sanitizeString(formData.camadas_granulares.melhorador_utilizado),
        umidade_otima: sanitizeNumber(formData.camadas_granulares.umidade_otima),
        densidade_otima: sanitizeNumber(formData.camadas_granulares.densidade_otima),
        resistencia_mpa: sanitizeNumber(formData.camadas_granulares.resistencia_mpa)
      };

    // CAUQ, MRAF, BGS
    default:
      const sanitizedAgregadosDefault = formData.agregados.map(agregado => ({
        ...agregado,
        percentual_mistura: sanitizeNumber(agregado.percentual_mistura),
        granulometria: sanitizeNestedNumbers(agregado.granulometria)
      }));

      const sanitizedLigante = {
        tipo: sanitizeString(formData.ligante.tipo),
        fornecedor: sanitizeString(formData.ligante.fornecedor),
        densidade: sanitizeNumber(formData.ligante.densidade)
      };

      return {
        tipo_projeto: formData.tipo_projeto,
        regional_id: formData.regional_id || null,
        name: formData.name,
        client: formData.client,
        location: formData.location || null,
        description: formData.description || null,
        status: formData.status,
        faixa_granulometrica_id: formData.faixa_granulometrica_id || null,
        equivalente_areia_minimo: sanitizeNumber(formData.equivalente_areia_minimo),
        agregados: sanitizedAgregadosDefault,
        ligante: sanitizedLigante,
        emulsao_utilizada: sanitizeString(formData.emulsao_utilizada),
        temperaturas: sanitizeNestedNumbers(formData.temperaturas),
        faixa_trabalho: sanitizeNestedNumbers(formData.faixa_trabalho),
        faixa_trabalho_min: sanitizeNestedNumbers(formData.faixa_trabalho_min),
        faixa_trabalho_max: sanitizeNestedNumbers(formData.faixa_trabalho_max),
        teor_ligante: sanitizeNestedNumbers(formData.teor_ligante),
        teor_ligante_residual: sanitizeNestedNumbers(formData.teor_ligante_residual),
        percentual_emulsao: sanitizeNumber(formData.percentual_emulsao),
        taxa_aplicacao_mraf: sanitizeNestedNumbers(formData.taxa_aplicacao_mraf),
        densidade_mistura_mraf: sanitizeNumber(formData.densidade_mistura_mraf),
        massa_especifica_aparente: sanitizeNumber(formData.massa_especifica_aparente),
        densidade_maxima_medida: sanitizeNumber(formData.densidade_maxima_medida),
        volume_vazios: sanitizeNestedNumbers(formData.volume_vazios),
        rtcd: sanitizeNestedNumbers(formData.rtcd),
        estabilidade: sanitizeNestedNumbers(formData.estabilidade),
        fluencia: sanitizeNestedNumbers(formData.fluencia),
        vam: sanitizeNestedNumbers(formData.vam),
        rbv: sanitizeNestedNumbers(formData.rbv),
        // BGS
        densidade_seca_max: sanitizeNumber(formData.densidade_seca_max),
        umidade_otima: sanitizeNumber(formData.umidade_otima),
      };
  }
};