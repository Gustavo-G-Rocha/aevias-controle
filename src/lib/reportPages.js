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
  "RelatorioVigaBenkelman",
  "RelatorioBoletimSondagem",
  "RelatorioBoletimSondagemTrado",
  "RelatorioProctor",
  "RelatorioRompimentoConcreto",
  "RelatorioGranuMistura",
  "RelatorioUnificado",
]);