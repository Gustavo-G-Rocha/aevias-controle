/**
 * reportPages.js — Registro explícito de páginas que usam o escopo de
 * relatório (report-scope) em vez do layout padrão com sidebar/header.
 *
 * Mantido separadamente de pages.config.js para evitar dependência circular
 * (pages.config.js importa Layout, que precisaria importar de volta).
 *
 * Se uma página de relatório for renomeada, adicionar o novo nome aqui
 * para preservar o escape de layout.
 */
/**
 * Prefixos de páginas de formulário/digitação onde o pull-to-refresh
 * deve ser desabilitado para não interferir na digitação do usuário.
 * Usado pelo Layout para calcular a prop `disabled` do PullToRefresh.
 */
export const FORM_PAGE_PREFIXES = [
  "Checklist",
  "Ensaio",
  "Diario",
  "Boletim",
  "Acompanhamento",
  "ControleExecucao",
];

export const isFormPage = (pageName) =>
  !!pageName && FORM_PAGE_PREFIXES.some((prefix) => pageName.startsWith(prefix));

export const REPORT_PAGES = new Set([
  "RelatorioCertificacaoUsina",
  "RelatorioAcompanhamentoCarga",
  "RelatorioAcompanhamentoUsinagem",
  "RelatorioCAUQ",
  "RelatorioChecklist",
  "RelatorioChecklistAplicacao",
  "RelatorioChecklistConcretagem",
  "RelatorioChecklistMRAF",
  "RelatorioChecklistPage",
  "RelatorioChecklistReciclagem",
  "RelatorioChecklistTerraplanagem",
  "RelatorioDensidadeInSitu",
  "RelatorioDiario",
  "RelatorioEnsaio",
  "RelatorioGranulometriaIndividual",
  "RelatorioManchaPendulo",
  "RelatorioNC",
  "RelatorioSondagem",
  "RelatorioTaxaMRAF",
  "RelatorioTaxaPinturaImprimacao",
  "RelatorioTaxaInsumos",
  "RelatorioVigaBenkelman",
  "RelatorioBoletimSondagem",
  "RelatorioBoletimSondagemTrado",
  "RelatorioProctor",
  "RelatorioRompimentoConcreto",
  "RelatorioGranuMistura",
  "RelatorioUnificado",
  "RelatorioControleExecucaoServicos",
]);