/**
 * Utilitários para Certificação de Usinas
 */

export const OPCOES_CONFORME = ["Conforme", "Não conforme"];
export const OPCOES_SIM_NAO = ["Sim", "Não"];
export const OPCOES_POSSUI = ["Possui", "Não possui"];

export const CLASSES_USINA = ["Classe I", "Classe II", "Classe III"];

// Labels das peneiras usadas na certificação — devem bater EXATAMENTE com PENEIRAS_CONFIG
export const PENEIRAS_GRANULOMETRIA = [
  '1.1/2"', '1"', '3/4"', '1/2"', '3/8"', 'Nº 4', 'Nº 8', 'Nº 40', 'Nº 80', 'Nº 200',
];

/** Inicializa array de linhas para tabela de ensaios de validação */
export function initEnsaioValidacaoRows(count = 4) {
  return Array.from({ length: count }, () => ({
    projeto: null,
    obtido: null,
    erro: null,
    desvio_padrao: null,
  }));
}

/** Inicializa linhas de granulometria (peneiras fixas) */
export function initGranulometriaRows() {
  return PENEIRAS_GRANULOMETRIA.map((peneira) => ({
    peneira,
    projeto: null,
    obtido: null,
    erro: null,
  }));
}

/** Calcula erro percentual = ((obtido - projeto) / projeto) * 100 */
export function calcularErro(projeto, obtido) {
  if (projeto == null || obtido == null) return null;
  const p = parseFloat(projeto);
  const o = parseFloat(obtido);
  if (isNaN(p) || isNaN(o) || p === 0) return null;
  return parseFloat((((o - p) / p) * 100).toFixed(4));
}

/** Calcula desvio padrão amostral (divide por n-1) de um array de números */
export function calcularDesvioPadrao(valores) {
  const nums = valores.filter((v) => v != null && !isNaN(parseFloat(v))).map(parseFloat);
  if (nums.length < 2) return null;
  const media = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variancia = nums.reduce((acc, v) => acc + (v - media) ** 2, 0) / (nums.length - 1);
  return parseFloat(Math.sqrt(variancia).toFixed(4));
}

/** Contagem de conformes/não conformes numa seção flat */
export function contarConformidades(secao) {
  if (!secao || typeof secao !== 'object') return { conforme: 0, nao_conforme: 0, total: 0 };
  let conforme = 0;
  let nao_conforme = 0;
  Object.values(secao).forEach((v) => {
    if (v === 'Conforme') conforme++;
    else if (v === 'Não conforme') nao_conforme++;
  });
  return { conforme, nao_conforme, total: conforme + nao_conforme };
}

/** Valida campos obrigatórios mínimos do formulário */
export function validarCertificacao(formData, saveStatus) {
  if (saveStatus === 'rascunho') return { valid: true };
  if (!formData.data_vistoria) return { valid: false, message: 'Informe a data da vistoria.' };
  if (!formData.razao_social?.trim()) return { valid: false, message: 'Informe a razão social.' };
  if (!formData.obra_id) return { valid: false, message: 'Selecione uma obra.' };
  return { valid: true };
}

// ─── Validação por página (para liberar navegação) ───────────────────────────

function allFilled(obj, keys) {
  return keys.every((k) => obj[k] != null && obj[k] !== '');
}

function allNestedFilled(obj, sections) {
  return sections.every(([section, keys]) =>
    keys.every((k) => (obj[section] || {})[k] != null && (obj[section] || {})[k] !== '')
  );
}

// Página 0: Descrição, Classe/Tipo, Aspectos Legais
export function validarPagina0(formData) {
  const campos = ['razao_social', 'localizacao', 'interessado', 'responsavel_tecnico',
    'data_vistoria', 'avaliador', 'cnpj', 'classe_usina', 'tipo_dosagem', 'tipo_secagem'];
  if (!allFilled(formData, campos)) return false;
  const al = formData.aspectos_legais || {};
  const aspectoKeys = ['autorizacao_ambiental', 'licenca_previa', 'licenca_instalacao', 'licenca_operacao'];
  if (!allFilled(al, aspectoKeys)) return false;
  return true;
}

// Página 1: Saúde e Segurança — todos os checkboxes preenchidos
export function validarPagina1(formData) {
  const ss = formData.saude_seguranca || {};
  return allNestedFilled(ss, [
    ['treinamentos', ['nr10_eletricistas','nr11_nr12_operadores','nr18_integracao','nr35_altura','fispq_quimicos']],
    ['epis', ['aprovados_ministerio','compativeis_atividades','sendo_cautelados','extintores_npt021']],
    ['acessos', ['dimensionados_seguros','material_resistente','travessao_superior','sem_superficie_plana','rodape_travessao_intermediario','largura_060m']],
    ['escadas_marinheiro', ['gaiolas_protecao','corrimao_montantes','largura_040_060m','altura_max_10m','altura_max_6m_plataformas','espacamento_barras_025_030m','espacamento_piso_primeira_barra','distancia_estrutura_015m','diametro_barras','barras_antideslizamento']],
    ['gaiolas_protecao', ['diametro_065_080m','barras_verticais_espacamento','vaos_arcos']],
    ['instalacoes_eletricas', ['condutores_resistencia_mecanica','condutores_protecao_rompimento','condutores_localizacao','condutores_transito','condutores_sem_riscos','condutores_material_nao_propaga_fogo','quadros_porta_fechada','quadros_sinalizacao_choque','quadros_conservacao','quadros_identificacao_circuitos','quadros_protecao_sobretensao','dispositivos_sem_zona_perigosa','dispositivos_emergencia','dispositivos_sem_acionamento_involuntario','dispositivos_sem_burla','dispositivos_sem_funcionamento_automatico']],
    ['sistemas_seguranca', ['protecoes_fixas_moveis','engrenagens_protegidas']],
    ['protecoes', ['funcoes_vida_util','materiais_contencao','fixacao_estabilidade','sem_esmagamento','sem_arestas_cortantes','resistem_condicoes_ambientais','dificulta_burla','higiene_limpeza','impedem_acesso_perigo','intertravamento_protegidos']],
    ['nr35_trabalho_altura', ['treinamento_nr35','aso_apto_altura','analise_risco','permissao_trabalho','cinto_talabarte']],
    ['nr10_eletricidade', ['prontuarios_75kw','esquema_unifilar','dispositivo_dr_nbr5410','aterramento','treinamento_nr10']],
  ]);
}

// Página 2: Meio Ambiente — todos os checkboxes preenchidos
export function validarPagina2(formData) {
  const ma = formData.meio_ambiente || {};
  return allNestedFilled(ma, [
    ['ruidos', ['medicao_semestral_nbr10151','horarios_intensidade_municipio','manutencao_maquinas']],
    ['emissao_atmosferica', ['medicao_poluentes_chamine','resolucao_sema_016_2014','monitoramento_fumaca_preta','filtro_material_particulado']],
    ['efluentes_liquidos', ['fossa_septica_nbr7229','manutencao_fossas','oleo_lubrificante_tambores','oleo_recicladoras_licenciadas','efluentes_conama_357','armazenamento_combustiveis','sem_sinais_vazamentos']],
    ['residuos_solidos', ['coleta_seletiva','transporte_licenciado','destinacao_licenciada','licencas_arquivadas','mtr_emitidas']],
    ['contaminacao_produtos_perigosos', ['plano_atendimento_emergencias','fispqs_disponiveis','funcionarios_treinados_fispqs','kits_emergencia']],
    ['consideracoes_gerais', ['autorizacao_supressao_vegetacao','vegetacao_remanescente','estruturas_contencao','outorga_captacao','ddsma','apr_aspectos_ambientais']],
  ]);
}

// Página 3: Laboratório — todos os equipamentos e profissionais respondidos
const EQUIPAMENTOS_KEYS = [
  'balanca_10kg','balanca_4_1kg','banho_maria','cesto_adesividade','kit_pesagem_hidrostatica',
  'compactador_marshall','conjunto_peneiras','conjunto_equiv_areia','conjunto_rice','estufa',
  'extensometro_fluometro','extrator_cp_marshall','molde_estabilidade','molde_resistencia',
  'prensa_marshall','refluxo_soxhlet','rotarex','soquete_marshall','termometro_infravermelho',
  'termometro_bimetalico','anel_bola','ductilometro','viscosimetro_brookfield',
];
export function validarPagina3(formData) {
  const equip = (formData.laboratorio || {}).equipamentos || {};
  if (!allFilled(equip, EQUIPAMENTOS_KEYS)) return false;
  const prof = (formData.laboratorio || {}).profissionais || {};
  const profKeys = ['laboratorista_possui','auxiliar_laboratorio_possui','encarregado_laboratorio_possui'];
  if (!allFilled(prof, profKeys)) return false;
  return true;
}

// Página 4: Resultado — classe selecionada
export function validarPagina4(formData) {
  return !!formData.resultado_classe;
}

export const VALIDADORES_PAGINA = [
  validarPagina0,
  validarPagina1,
  validarPagina2,
  validarPagina3,
  validarPagina4,
];