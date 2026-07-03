// Estado inicial e defaults do formulário de Certificação de Usina.
// Extraído de pages/CertificacaoUsina/index.jsx para reduzir o tamanho da página.

const DEFAULT_ASPECTOS_LEGAIS = {
  autorizacao_ambiental: "Sim",
  licenca_previa: "Sim",
  licenca_instalacao: "Sim",
  licenca_operacao: "Sim",
};

const DEFAULT_SAUDE_SEGURANCA = {
  treinamentos: { nr10_eletricistas: "Conforme", nr11_nr12_operadores: "Conforme", nr18_integracao: "Conforme", nr35_altura: "Conforme", fispq_quimicos: "Conforme" },
  epis: { aprovados_ministerio: "Conforme", compativeis_atividades: "Conforme", sendo_cautelados: "Conforme", extintores_npt021: "Conforme" },
  acessos: { dimensionados_seguros: "Conforme", material_resistente: "Conforme", travessao_superior: "Conforme", sem_superficie_plana: "Conforme", rodape_travessao_intermediario: "Conforme", largura_060m: "Conforme" },
  escadas_marinheiro: { gaiolas_protecao: "Conforme", corrimao_montantes: "Conforme", largura_040_060m: "Conforme", altura_max_10m: "Conforme", altura_max_6m_plataformas: "Conforme", espacamento_barras_025_030m: "Conforme", espacamento_piso_primeira_barra: "Conforme", distancia_estrutura_015m: "Conforme", diametro_barras: "Conforme", barras_antideslizamento: "Conforme" },
  gaiolas_protecao: { diametro_065_080m: "Conforme", barras_verticais_espacamento: "Conforme", vaos_arcos: "Conforme" },
  instalacoes_eletricas: { condutores_resistencia_mecanica: "Conforme", condutores_protecao_rompimento: "Conforme", condutores_localizacao: "Conforme", condutores_transito: "Conforme", condutores_sem_riscos: "Conforme", condutores_material_nao_propaga_fogo: "Conforme", quadros_porta_fechada: "Conforme", quadros_sinalizacao_choque: "Conforme", quadros_conservacao: "Conforme", quadros_identificacao_circuitos: "Conforme", quadros_protecao_sobretensao: "Conforme", dispositivos_sem_zona_perigosa: "Conforme", dispositivos_emergencia: "Conforme", dispositivos_sem_acionamento_involuntario: "Conforme", dispositivos_sem_burla: "Conforme", dispositivos_sem_funcionamento_automatico: "Conforme" },
  sistemas_seguranca: { protecoes_fixas_moveis: "Conforme", engrenagens_protegidas: "Conforme" },
  protecoes: { funcoes_vida_util: "Conforme", materiais_contencao: "Conforme", fixacao_estabilidade: "Conforme", sem_esmagamento: "Conforme", sem_arestas_cortantes: "Conforme", resistem_condicoes_ambientais: "Conforme", dificulta_burla: "Conforme", higiene_limpeza: "Conforme", impedem_acesso_perigo: "Conforme", intertravamento_protegidos: "Conforme" },
  nr35_trabalho_altura: { treinamento_nr35: "Conforme", aso_apto_altura: "Conforme", analise_risco: "Conforme", permissao_trabalho: "Conforme", cinto_talabarte: "Conforme" },
  nr10_eletricidade: { prontuarios_75kw: "Conforme", esquema_unifilar: "Conforme", dispositivo_dr_nbr5410: "Conforme", aterramento: "Conforme", treinamento_nr10: "Conforme" },
};

const DEFAULT_MEIO_AMBIENTE = {
  ruidos: { medicao_semestral_nbr10151: "Conforme", horarios_intensidade_municipio: "Conforme", manutencao_maquinas: "Conforme" },
  emissao_atmosferica: { medicao_poluentes_chamine: "Conforme", resolucao_sema_016_2014: "Conforme", monitoramento_fumaca_preta: "Conforme", filtro_material_particulado: "Conforme" },
  efluentes_liquidos: { fossa_septica_nbr7229: "Conforme", manutencao_fossas: "Conforme", oleo_lubrificante_tambores: "Conforme", oleo_recicladoras_licenciadas: "Conforme", efluentes_conama_357: "Conforme", armazenamento_combustiveis: "Conforme", sem_sinais_vazamentos: "Conforme" },
  residuos_solidos: { coleta_seletiva: "Conforme", transporte_licenciado: "Conforme", destinacao_licenciada: "Conforme", licencas_arquivadas: "Conforme", mtr_emitidas: "Conforme" },
  contaminacao_produtos_perigosos: { plano_atendimento_emergencias: "Conforme", fispqs_disponiveis: "Conforme", funcionarios_treinados_fispqs: "Conforme", kits_emergencia: "Conforme" },
  consideracoes_gerais: { autorizacao_supressao_vegetacao: "Conforme", vegetacao_remanescente: "Conforme", estruturas_contencao: "Conforme", outorga_captacao: "Conforme", ddsma: "Conforme", apr_aspectos_ambientais: "Conforme" },
};

const DEFAULT_LABORATORIO_EQUIPAMENTOS = {
  balanca_10kg: "Possui", balanca_4_1kg: "Possui", banho_maria: "Possui", cesto_adesividade: "Possui",
  kit_pesagem_hidrostatica: "Possui", compactador_marshall: "Possui", conjunto_peneiras: "Possui",
  conjunto_equiv_areia: "Possui", conjunto_rice: "Possui", estufa: "Possui", extensometro_fluometro: "Possui",
  extrator_cp_marshall: "Possui", molde_estabilidade: "Possui", molde_resistencia: "Possui",
  prensa_marshall: "Possui", refluxo_soxhlet: "Possui", rotarex: "Possui", soquete_marshall: "Possui",
  termometro_infravermelho: "Possui", termometro_bimetalico: "Possui", anel_bola: "Possui",
  ductilometro: "Possui", viscosimetro_brookfield: "Possui",
};

const DEFAULT_LABORATORIO_PROFISSIONAIS = {
  laboratorista_possui: true,
  auxiliar_laboratorio_possui: true,
  encarregado_laboratorio_possui: true,
};

export const getInitialFormData = () => ({
  obra_id: "",
  razao_social: "",
  interessado: "",
  responsavel_tecnico: "",
  telefone: "",
  email: "",
  data_vistoria: new Date().toISOString().split("T")[0],
  avaliador: "",
  cnpj: "",
  validade: "",
  localizacao: "",
  marca_usina: "",
  numero_serie: "",
  fornecimento_agregado: "",
  mineralogia: "",
  classe_usina: "",
  tipo_dosagem: "",
  tipo_secagem: "",
  aspectos_legais: { ...DEFAULT_ASPECTOS_LEGAIS },
  saude_seguranca: DEFAULT_SAUDE_SEGURANCA,
  meio_ambiente: DEFAULT_MEIO_AMBIENTE,
  laboratorio: {
    equipamentos: { ...DEFAULT_LABORATORIO_EQUIPAMENTOS },
    profissionais: { ...DEFAULT_LABORATORIO_PROFISSIONAIS },
  },
  afeicao: {},
  estrutura_fisica: {},
  usina_asfalto: {},
  ensaios_validacao: {},
  resultado_classe: "",
  observacoes_resultado: "",
  observacoes_gerais: "",
  fotos: [],
  status: "rascunho",
  approved: null,
  rejection_reason: null,
});

export default getInitialFormData;