// ========================================
// MAPEAMENTO FIXO E FINAL DE PENEIRAS DNIT/ASTM
// ========================================
export const PENEIRAS_PADRAO = {
  "75":    { key: 'peneira_75_0mm',   nome: '75.0 mm',  astm: '3"'      },
  "63":    { key: 'peneira_63_0mm',   nome: '63.0 mm',  astm: '2 1/2"'  },
  "50":    { key: 'peneira_50_0mm',   nome: '50.0 mm',  astm: '2"'      },
  "37.5":  { key: 'peneira_37_5mm',   nome: '37.5 mm',  astm: '1 1/2"'  },
  "25":    { key: 'peneira_25_0mm',   nome: '25.0 mm',  astm: '1"'      },
  "19":    { key: 'peneira_19_0mm',   nome: '19.0 mm',  astm: '3/4"'    },
  "16":    { key: 'peneira_16_0mm',   nome: '16.0 mm',  astm: '5/8"'    },
  "12.5":  { key: 'peneira_12_5mm',   nome: '12.5 mm',  astm: '1/2"'    },
  "9.5":   { key: 'peneira_9_5mm',    nome: '9.5 mm',   astm: '3/8"'    },
  "6.3":   { key: 'peneira_6_3mm',    nome: '6.3 mm',   astm: '1/4"'    },
  "4.75":  { key: 'peneira_4_75mm',   nome: '4.75 mm',  astm: 'Nº 4'    },
  "2.36":  { key: 'peneira_2_36mm',   nome: '2.36 mm',  astm: 'Nº 8'    },
  "2":     { key: 'peneira_2_0mm',    nome: '2.0 mm',   astm: 'Nº 10'   },
  "1.18":  { key: 'peneira_1_18mm',   nome: '1.18 mm',  astm: 'Nº 16'   },
  "0.6":   { key: 'peneira_0_6mm',    nome: '0.6 mm',   astm: 'Nº 30'   },
  "0.42":  { key: 'peneira_0_42mm',   nome: '0.42 mm',  astm: 'Nº 40'   },
  "0.3":   { key: 'peneira_0_3mm',    nome: '0.3 mm',   astm: 'Nº 50'   },
  "0.18":  { key: 'peneira_0_18mm',   nome: '0.18 mm',  astm: 'Nº 80'   },
  "0.15":  { key: 'peneira_0_15mm',   nome: '0.15 mm',  astm: 'Nº 100'  },
  "0.075": { key: 'peneira_0_075mm',  nome: '0.075 mm', astm: 'Nº 200'  },
};

/**
 * Normaliza uma string de abertura de peneira e extrai o número.
 * Ex: "6,3 mm" → 6.3 | "75.0" → 75 | "abc" → null
 */
export const extrairAberturaNumero = (aberturaString) => {
  const normalized = aberturaString.toString().replace(',', '.');
  const match = normalized.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
};

/**
 * Retorna a entrada padrão de peneira para uma string de abertura,
 * ou null se não encontrada.
 */
export const obterPeneiraPadrao = (aberturaString) => {
  const aberturaNum = extrairAberturaNumero(aberturaString);
  if (aberturaNum === null) return null;
  const chave = String(aberturaNum);
  return PENEIRAS_PADRAO[chave] ?? null;
};

/**
 * Mapeia um objeto peneira da faixa granulométrica para o formato
 * usado em `peneirasDisponiveis`.
 * Retorna null se a peneira não existir no padrão.
 */
export const mapPeneiraFaixaToDisponivel = (p) => {
  const peneiraPadrao = obterPeneiraPadrao(p.abertura);
  if (!peneiraPadrao) return null;
  return {
    key: peneiraPadrao.key,
    nome: peneiraPadrao.nome,
    astm: peneiraPadrao.astm,
    especificacao_min: p.min,
    especificacao_max: p.max,
  };
};

/**
 * Estado inicial vazio do formulário de projeto.
 */
export const INITIAL_FORM_DATA = {
  tipo_projeto: "CAUQ",
  regional_id: "",
  name: "",
  client: "",
  location: "",
  description: "",
  faixa_granulometrica_id: "",
  equivalente_areia_minimo: "",
  agregados: [],
  ligante: { tipo: "", fornecedor: "", densidade: "" },
  emulsao_utilizada: "",
  temperaturas: {
    mistura: { min: "", max: "" },
    compactacao: { min: "", max: "" },
    espalhamento: { min: "", max: "" },
  },
  faixa_trabalho: {},
  faixa_trabalho_min: {},
  faixa_trabalho_max: {},
  teor_ligante: { min: "", max: "", otimo: "" },
  teor_ligante_residual: { min: "", max: "", otimo: "" },
  percentual_emulsao: "",
  taxa_aplicacao_mraf: { min: "", max: "", otimo: "" },
  densidade_mistura_mraf: "",
  massa_especifica_aparente: "",
  densidade_maxima_medida: "",
  volume_vazios: { min: "", max: "", otimo: "" },
  rtcd: { min: "" },
  estabilidade: { min: "", projeto: "" },
  fluencia: { min: "", max: "", projeto: "" },
  vam: { min: "", projeto: "" },
  rbv: { min: "", max: "", projeto: "" },
  carta_traco_concreto: {
    fck: "",
    slump_projeto: "",
    slump_minimo: "",
    slump_maximo: "",
    consumo_agua: "",
    tipo_aditivo: "",
    tipo_cimento: "",
    concreteira: "",
  },
  camadas_granulares: {
    melhorador_utilizado: "",
    umidade_otima: "",
    densidade_otima: "",
    resistencia_mpa: "",
  },
  // BGS
  densidade_seca_max: "",
  umidade_otima: "",
  faixa_trabalho_bgs: {},
  status: "ativo",
};

/**
 * Hidrata o formulário a partir de um projeto existente.
 * Função pura: recebe project, retorna formData.
 */
export const mapProjectToFormData = (project) => {
  const isCartaTraco =
    project.tipo_projeto === 'CARTA_TRACO_CONCRETO' || project._isCartaTraco === true;
  const isCamadasGranulares = project.tipo_projeto === "CAMADAS_GRANULARES";

  return {
    tipo_projeto: project.tipo_projeto || "CAUQ",
    regional_id: project.regional_id || "",
    name: project.name || "",
    client: project.client || "",
    location: project.location || "",
    description: project.description || "",
    faixa_granulometrica_id: project.faixa_granulometrica_id || "",
    equivalente_areia_minimo: project.equivalente_areia_minimo || "",
    agregados: project.agregados || [],
    ligante: project.ligante || { tipo: "", fornecedor: "", densidade: "" },
    emulsao_utilizada: project.emulsao_utilizada || "",
    temperaturas: project.temperaturas || {
      mistura: { min: "", max: "" },
      compactacao: { min: "", max: "" },
      espalhamento: { min: "", max: "" },
    },
    faixa_trabalho: project.faixa_trabalho || {},
    faixa_trabalho_min: project.faixa_trabalho_min || {},
    faixa_trabalho_max: project.faixa_trabalho_max || {},
    teor_ligante: project.teor_ligante || { min: "", max: "", otimo: "" },
    teor_ligante_residual: project.teor_ligante_residual || { min: "", max: "", otimo: "" },
    percentual_emulsao: project.percentual_emulsao || "",
    taxa_aplicacao_mraf: project.taxa_aplicacao_mraf || { min: "", max: "", otimo: "" },
    densidade_mistura_mraf: project.densidade_mistura_mraf || "",
    massa_especifica_aparente: project.massa_especifica_aparente || "",
    densidade_maxima_medida: project.densidade_maxima_medida || "",
    volume_vazios: project.volume_vazios || { min: "", max: "", otimo: "" },
    rtcd: project.rtcd || { min: "" },
    estabilidade: project.estabilidade || { min: "", projeto: "" },
    fluencia: project.fluencia || { min: "", max: "", projeto: "" },
    vam: project.vam || { min: "", projeto: "" },
    rbv: project.rbv || { min: "", max: "", projeto: "" },
    carta_traco_concreto: isCartaTraco
      ? {
          fck: project.fck || "",
          slump_projeto: project.slump_projeto || "",
          slump_minimo: project.slump_minimo || "",
          slump_maximo: project.slump_maximo || "",
          consumo_agua: project.consumo_agua || "",
          tipo_aditivo: project.tipo_aditivo || "",
          tipo_cimento: project.tipo_cimento || "",
          concreteira: project.concreteira || "",
        }
      : { ...INITIAL_FORM_DATA.carta_traco_concreto },
    camadas_granulares: isCamadasGranulares
      ? {
          melhorador_utilizado: project.melhorador_utilizado || "",
          umidade_otima: project.umidade_otima || "",
          densidade_otima: project.densidade_otima || "",
          resistencia_mpa: project.resistencia_mpa || "",
        }
      : { ...INITIAL_FORM_DATA.camadas_granulares },
    // BGS
    densidade_seca_max: project.densidade_seca_max || "",
    umidade_otima: project.umidade_otima || "",
    faixa_trabalho_bgs: project.faixa_trabalho_bgs || {},
    status: project.status || "ativo",
  };
};

/**
 * Resolve o tipo de faixa_trabalho a partir do tipo ('min', 'max', ou outro).
 */
export const resolveFaixaTrabalhoType = (type) => {
  if (type === 'min') return 'faixa_trabalho_min';
  if (type === 'max') return 'faixa_trabalho_max';
  return 'faixa_trabalho';
};