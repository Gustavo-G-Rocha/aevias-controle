import { VALIDADORES_PAGINA } from "@/utils/certificacaoUsinaUtils";

// Cada página referencia sua seção (key) e o validador correspondente pelo índice-base.
export const ALL_PAGES = [
  { key: "identificacao", num: "1-4", label: "Identificação e\nAspectos Legais", validatorIndex: 0 },
  { key: "saude",         num: "5",   label: "Saúde e\nSegurança",              validatorIndex: 1 },
  { key: "meio_ambiente", num: "6",   label: "Meio\nAmbiente",                   validatorIndex: 2 },
  { key: "laboratorio",   num: "7",   label: "Laboratório\ne Estrutura",         validatorIndex: 3 },
  { key: "resultado",     num: "8",   label: "Resultado",                        validatorIndex: 4 },
  { key: "fotos",         num: "📷",  label: "Relatório\nFotográfico",           validatorIndex: null },
];

const LABELS_PAGINA_IDENTIFICACAO = {
  razao_social: "Razão Social",
  localizacao: "Localização",
  interessado: "Interessado",
  responsavel_tecnico: "Responsável Técnico",
  data_vistoria: "Data da Vistoria",
  avaliador: "Avaliador",
  cnpj: "CNPJ",
  classe_usina: "Classe de Usina",
  tipo_dosagem: "Tipo de Dosagem",
  tipo_secagem: "Tipo de Secagem",
};

const LABELS_ASPECTOS_LEGAIS = {
  autorizacao_ambiental: "Autorização Ambiental",
  licenca_previa: "Licença Prévia",
  licenca_instalacao: "Licença de Instalação",
  licenca_operacao: "Licença de Operação",
};

const NOMES_SECOES = {
  saude: "Saúde e Segurança",
  meio_ambiente: "Meio Ambiente",
  laboratorio: "Laboratório e Estrutura",
  resultado: "Resultado",
};

/** Retorna true se todos os campos obrigatórios da página estão preenchidos. */
export function isPageComplete(pages, pageIndex, formData) {
  const validatorIndex = pages[pageIndex]?.validatorIndex;
  if (validatorIndex == null) return true;
  return VALIDADORES_PAGINA[validatorIndex]?.(formData) ?? true;
}

/** Retorna lista de labels dos campos obrigatórios vazios na página de Identificação. */
export function getCamposVaziosPagina0(formData) {
  const al = formData.aspectos_legais || {};
  return [
    ...Object.entries(LABELS_PAGINA_IDENTIFICACAO).filter(([k]) => !formData[k]).map(([, l]) => l),
    ...Object.entries(LABELS_ASPECTOS_LEGAIS).filter(([k]) => !al[k]).map(([, l]) => l),
  ];
}

/** Retorna lista de mensagens de campos vazios para uma página qualquer. */
export function getCamposVaziosByPage(pages, page, formData) {
  const pageKey = pages[page]?.key;
  if (pageKey === "identificacao") return getCamposVaziosPagina0(formData);
  return [`Seção "${NOMES_SECOES[pageKey] || ""}" incompleta — preencha todos os campos`];
}