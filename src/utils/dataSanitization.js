/**
 * Utilities para sanitização de dados em formulários
 * Garante que valores vazios são convertidos para null
 * e números são corretamente parseados
 */

/**
 * Lista de tags HTML perigosas que devem ser removidas inteiramente
 * (incluindo conteúdo). Estas tags podem executar código ou carregar
 * recursos externos — nunca são legítimas em texto livre do usuário.
 */
const DANGEROUS_TAGS = [
  'script', 'iframe', 'object', 'embed', 'style', 'svg', 'math',
  'template', 'noscript', 'noframes', 'applet', 'xml',
];

/** Tags perigosas que aparecem como elementos vazios/self-closing. */
const DANGEROUS_VOID_TAGS = [
  'link', 'meta', 'base', 'form', 'input', 'button',
];

const DANGEROUS_TAGS_PATTERN = DANGEROUS_TAGS.join('|');
const DANGEROUS_VOID_TAGS_PATTERN = DANGEROUS_VOID_TAGS.join('|');

/**
 * Sanitiza uma string removendo estruturas HTML/JS perigosas.
 *
 * Política: TEXTO PURO por padrão. Nenhum HTML é permitido em campos
 * de texto livre. Tags perigosas (script, iframe, etc.) são removidas
 * integralmente com seu conteúdo. Demais caracteres (incluindo `<` e `>`
 * que não formam tags perigosas) são preservados como texto literal —
 * o React escapa automaticamente na renderização via `{}`.
 *
 * Defense-in-depth contra XSS armazenado e SSTI.
 *
 * @param {string} value - String a sanitizar
 * @param {{maxLength?: number}} options - Limite de tamanho (padrão 10000)
 * @returns {string} String sanitizada
 */
export const sanitizeText = (value, options = {}) => {
  if (typeof value !== 'string' || !value) return value;

  const { maxLength = 10000 } = options;

  let result = value;

  // 1. Remover caracteres de controle (exceto \t \n \r) — previne bypass
  //    via encoding alternativo e normaliza para UTF-8 limpo.
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Remover blocos de tags perigosas COM conteúdo (script, iframe, etc.)
  //    Captura tag de abertura + conteúdo + tag de fechamento.
  result = result.replace(
    new RegExp(`<\\s*(${DANGEROUS_TAGS_PATTERN})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi'),
    ''
  );

  // 3. Remover tags perigosas sem fechamento (self-closing ou órfãs)
  const allDangerousTags = [...DANGEROUS_TAGS, ...DANGEROUS_VOID_TAGS].join('|');
  result = result.replace(
    new RegExp(`<\\s*(?:${allDangerousTags})\\b[^>]*>`, 'gi'),
    ''
  );
  result = result.replace(
    new RegExp(`<\\s*\\/\\s*(?:${DANGEROUS_TAGS_PATTERN})\\s*>`, 'gi'),
    ''
  );

  // 4. Remover atributos de evento (onerror=, onclick=, onload=, etc.)
  //    Cobre valores entre aspas duplas, simples e sem aspas.
  result = result.replace(
    /\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)?/gi,
    ''
  );

  // 5. Remover protocolos perigosos
  result = result.replace(/javascript:/gi, '');
  result = result.replace(/vbscript:/gi, '');
  result = result.replace(/data:text\/html/gi, '');

  // 6. Neutralizar sintaxe de template engine (SSTI defense-in-depth)
  //    {{ }} → { {  e  <% %> → < % % >
  result = result.replace(/\{\{/g, '{ {').replace(/\}\}/g, '} }');
  result = result.replace(/<%/g, '< %').replace(/%>/g, '% >');

  // 7. Limite de tamanho — defense-in-depth contra payloads excessivos
  if (result.length > maxLength) {
    result = result.substring(0, maxLength);
  }

  return result;
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