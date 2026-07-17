/**
 * Fonte única de títulos de página, consumida pelo MobileBackHeader.
 * Chave = segmento da rota (case-insensitive). Páginas sem entrada não
 * exibem título no header mobile.
 */
const PAGE_TITLES = {
  AcompanhamentoCarga: "Acompanhamento de Aplicação",
  AcompanhamentoUsinagem: "Acompanhamento de Usinagem",
  BoletimSondagem: "Boletim de Sondagem",
  BoletimSondagemTrado: "Boletim de Sondagem a Trado",
  CertificacaoUsina: "Certificação de Usina",
  ChecklistAplicacao: "Checklist de Aplicação",
  ChecklistConcretagem: "Checklist de Concretagem",
  ChecklistMRAF: "Checklist MRAF",
  ChecklistReciclagem: "Checklist de Reciclagem",
  ChecklistTerraplanagem: "Checklist de Terraplanagem",
  ChecklistUsina: "Checklist de Usina",
  ControleLaboratoristas: "Controle de Laboratoristas",
  Dashboard: "Dashboard",
  DiarioObra: "Diário de Obra",
  EditarNC: "Editar NC",
  EnsaioCAUQ: "Ensaio CAUQ",
  EnsaioDensidade: "Ensaio de Densidade",
  EnsaioDensidadeInSitu: "Densidade In Situ",
  EnsaioGranulometriaIndividual: "Granulometria Individual",
  EnsaioManchaPendulo: "Macrotextura e Microtextura",
  EnsaioMRAF: "Ensaio MRAF",
  EnsaioProctor: "Ensaio Proctor",
  EnsaioRompimentoConcreto: "Rompimento de Concreto",
  EnsaioSondagem: "Ensaio de Sondagem",
  EnsaioTaxaMRAF: "Taxa MRAF",
  EnsaioTaxaPinturaImprimacao: "Taxa de Pintura e Imprimação",
  FaixasGranulometricas: "Faixas Granulométricas",
  GestaoNC: "Gestão de NCs",
  GranuMistura: "Granulometria da Mistura",
  "historico-auditoria": "Trilha de Auditoria",
  HistoricoAuditoria: "Trilha de Auditoria",
  ImpressionEtiquetas: "Impressão de Etiquetas",
  MigracaoDados: "Migração de Dados",
  MonitorProdutividade: "Monitor de Produtividade",
  NaoConformidades: "Não Conformidades",
  NovaNC: "Nova NC",
  Produtividade: "Produtividade",
  RelatoriosUnificados: "Relatórios Unificados",
  ReportarErro: "Reportar Erro",
  ResumosPersonalizados: "Resumos Personalizados",
  Settings: "Configurações",
  SolicitacoesTransferencia: "Solicitações de Transferência",
  Users: "Usuários",
};

const LOOKUP = Object.fromEntries(
  Object.entries(PAGE_TITLES).map(([k, v]) => [k.toLowerCase(), v])
);

export function getPageTitle(pathname) {
  const segment = (pathname || "").split("/")[1] || "";
  return LOOKUP[segment.toLowerCase()] || null;
}