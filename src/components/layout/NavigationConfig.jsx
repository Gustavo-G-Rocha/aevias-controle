import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  Grid,
  FlaskConical,
  Book,
  FileText,
  HardHat,
  Construction,
  Wrench,
  Gauge,
  BarChart3,
  TrendingUp,
  Factory,
  Bug,
  ClipboardList,
} from "lucide-react";

export const MAIN_NAVIGATION = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    allowedLevels: ["admin", "gestor_contrato", "sala_tecnica_afirmaevias", "cliente", "cliente_supervisor"],
  },
  {
    title: "Regionais",
    url: createPageUrl("Regionais"),
    icon: Grid,
    allowedLevels: ["admin", "gestor_contrato", "sala_tecnica_afirmaevias", "user", "funcionarios_cliente", "cliente", "cliente_supervisor"],
  },
  {
    title: "Relatório Consolidado Regional",
    url: createPageUrl("RelatoriosUnificados"),
    icon: FileText,
    allowedLevels: ["admin", "gestor_contrato", "sala_tecnica_afirmaevias"],
  },
  {
    title: "Reportar Erros",
    url: createPageUrl("ReportarErro"),
    icon: Bug,
    allowedLevels: ["admin", "gestor_contrato", "sala_tecnica_afirmaevias", "user", "funcionarios_cliente", "cliente", "cliente_supervisor"],
  },
];

export const ADMIN_NAVIGATION = [
  { title: "Usuários", url: createPageUrl("Users"), icon: Users, allowedLevels: ["admin", "gestor_contrato", "sala_tecnica_afirmaevias", "cliente", "cliente_supervisor"] },
  // Acesso direto à lista de rascunhos/finalizados de Fresagem e Lançamento
  // de CBUQ — antes só era possível chegar via "Ensaios Realizados" e filtro
  // manual de tipo, o que impedia abrir um rascunho existente pelo menu.
  { title: "Fresagem e Lançamento de CBUQ", url: `${createPageUrl("MeusEnsaios")}?tipo=RegistroFresagemCBUQ`, icon: ClipboardList, allowedLevels: ["admin", "gestor_contrato", "sala_tecnica_afirmaevias"] },
  { title: "Produtividade", url: createPageUrl("Produtividade"), icon: BarChart3, allowedLevels: ["admin", "gestor_contrato", "sala_tecnica_afirmaevias"] },
  { title: "Controle Laboratoristas", url: createPageUrl("ControleLaboratoristas"), icon: Users, allowedLevels: ["admin"] },
  { title: "Faixas Granulométricas", url: createPageUrl("FaixasGranulometricas"), icon: Grid, allowedLevels: ["admin"] },
  { title: "Migração de Dados", url: createPageUrl("MigracaoDados"), icon: Grid, allowedLevels: ["admin"] },
  { title: "Monitor de Produtividade", url: createPageUrl("MonitorProdutividade"), icon: TrendingUp, allowedLevels: ["admin"] },
  { title: "Configurações", url: createPageUrl("Settings"), icon: Settings, allowedLevels: ["admin", "gestor_contrato", "sala_tecnica_afirmaevias", "user", "funcionarios_cliente", "cliente", "cliente_supervisor"] },
];

// Ensaios compartilhados entre Supervisão e Gerenciamento
const ENSAIOS_SUPERVISAO = [
  { title: "Checklist de Usina", url: createPageUrl("ChecklistUsina"), icon: FileText },
  { title: "Checklist de Aplicação", url: createPageUrl("ChecklistAplicacao"), icon: FileText },
  { title: "Checklist de MRAF", url: createPageUrl("ChecklistMRAF"), icon: FileText },
  { title: "Checklist de Concretagem", url: createPageUrl("ChecklistConcretagem"), icon: FileText },
  { title: "Checklist de Terraplanagem", url: createPageUrl("ChecklistTerraplanagem"), icon: FileText },
  { title: "Checklist de Reciclagem", url: createPageUrl("ChecklistReciclagem"), icon: FileText },
  { title: "Ensaio de CAUQ", url: createPageUrl("EnsaioCAUQ"), icon: FlaskConical },
  { title: "Acompanhamento de Usinagem", url: createPageUrl("AcompanhamentoUsinagem"), icon: FlaskConical },
  { title: "Taxa de Pintura/Imprimação", url: createPageUrl("EnsaioTaxaPinturaImprimacao"), icon: FlaskConical },
  { title: "Rompimento Concreto", url: createPageUrl("EnsaioRompimentoConcreto"), icon: FlaskConical },
  { title: "Mancha + Pêndulo", url: createPageUrl("EnsaioManchaPendulo"), icon: Gauge },
  { title: "Sondagem", url: createPageUrl("EnsaioSondagem"), icon: Gauge },
  { title: "Viga Benkelman", url: createPageUrl("EnsaioVigaBenkelman"), icon: Gauge },
  { title: "Taxa MRAF", url: createPageUrl("EnsaioTaxaMRAF"), icon: FlaskConical },
  // Itens únicos da aba Conservação (sem repetir os já listados acima).
  { title: "Ensaio MRAF", url: createPageUrl("EnsaioMRAF"), icon: FlaskConical },
  { title: "Granulometria Individual", url: createPageUrl("EnsaioGranulometriaIndividual"), icon: FlaskConical },
  { title: "Granulometria da Mistura", url: createPageUrl("GranuMistura"), icon: FlaskConical },
  { title: "Taxa de Insumos", url: createPageUrl("EnsaioTaxaInsumos"), icon: FlaskConical },
  { title: "Acompanhamento de Cargas", url: createPageUrl("AcompanhamentoCarga"), icon: FlaskConical },
  { title: "Densidade In Situ", url: createPageUrl("EnsaioDensidadeInSitu"), icon: Gauge },
  { title: "Ensaio Proctor", url: createPageUrl("EnsaioProctor"), icon: FlaskConical },
];

export const ENSAIOS_POR_TIPO_OBRA = [
  {
    nome: "Supervisão",
    icon: HardHat,
    tipo_obra: "supervisao",
    ensaios: ENSAIOS_SUPERVISAO,
  },
  {
    nome: "Gerenciamento",
    icon: ClipboardList,
    tipo_obra: "gerenciamento",
    ensaios: [
      { title: "Controle de Execução de Serviços", url: createPageUrl("ControleExecucaoServicos"), icon: ClipboardList },
      { title: "Fresagem e Lançamento de CBUQ", url: createPageUrl("RegistroFresagemCBUQ"), icon: ClipboardList },
    ],
  },
  {
    nome: "Implantação",
    icon: Construction,
    tipo_obra: "implantacao",
    ensaios: [
      { title: "Ensaio MRAF", url: createPageUrl("EnsaioMRAF"), icon: FlaskConical },
      { title: "Acompanhamento de Usinagem", url: createPageUrl("AcompanhamentoUsinagem"), icon: FlaskConical },
      { title: "Taxa de Pintura/Imprimação", url: createPageUrl("EnsaioTaxaPinturaImprimacao"), icon: FlaskConical },
      { title: "Granulometria Individual", url: createPageUrl("EnsaioGranulometriaIndividual"), icon: FlaskConical },
      { title: "Granulometria da Mistura", url: createPageUrl("GranuMistura"), icon: FlaskConical },
      { title: "Rompimento Concreto", url: createPageUrl("EnsaioRompimentoConcreto"), icon: FlaskConical },
      { title: "Mancha + Pêndulo", url: createPageUrl("EnsaioManchaPendulo"), icon: Gauge },
      { title: "Densidade In Situ", url: createPageUrl("EnsaioDensidadeInSitu"), icon: Gauge },
      { title: "Sondagem", url: createPageUrl("EnsaioSondagem"), icon: Gauge },
      { title: "Viga Benkelman", url: createPageUrl("EnsaioVigaBenkelman"), icon: Gauge },
      { title: "Taxa MRAF", url: createPageUrl("EnsaioTaxaMRAF"), icon: FlaskConical },
      { title: "Ensaio Proctor", url: createPageUrl("EnsaioProctor"), icon: FlaskConical },
      { title: "Taxa de Insumos", url: createPageUrl("EnsaioTaxaInsumos"), icon: FlaskConical },
    ],
  },
  {
    nome: "Conservação",
    icon: Wrench,
    tipo_obra: "conservacao",
    setores: [
      {
        nome: "Usina",
        ensaios: [
          { title: "Ensaio de CAUQ", url: createPageUrl("EnsaioCAUQ"), icon: FlaskConical },
          { title: "Acompanhamento de Usinagem", url: createPageUrl("AcompanhamentoUsinagem"), icon: FlaskConical },
          { title: "Rompimento Concreto", url: createPageUrl("EnsaioRompimentoConcreto"), icon: FlaskConical },
          { title: "Granulometria Individual", url: createPageUrl("EnsaioGranulometriaIndividual"), icon: FlaskConical },
          { title: "Granulometria da Mistura", url: createPageUrl("GranuMistura"), icon: FlaskConical },
          { title: "Sondagem", url: createPageUrl("EnsaioSondagem"), icon: Gauge },
        ],
      },
      {
        nome: "MRAF",
        ensaios: [
          { title: "Ensaio MRAF", url: createPageUrl("EnsaioMRAF"), icon: FlaskConical },
          { title: "Taxa MRAF", url: createPageUrl("EnsaioTaxaMRAF"), icon: FlaskConical },
          { title: "Mancha + Pêndulo", url: createPageUrl("EnsaioManchaPendulo"), icon: Gauge },
          { title: "Granulometria Individual", url: createPageUrl("EnsaioGranulometriaIndividual"), icon: FlaskConical },
          { title: "Granulometria da Mistura", url: createPageUrl("GranuMistura"), icon: FlaskConical },
        ],
      },
      {
        nome: "Campo",
        ensaios: [
          { title: "Ensaio de CAUQ", url: createPageUrl("EnsaioCAUQ"), icon: FlaskConical },
          { title: "Taxa de Pintura/Imprimação", url: createPageUrl("EnsaioTaxaPinturaImprimacao"), icon: FlaskConical },
          { title: "Taxa de Insumos", url: createPageUrl("EnsaioTaxaInsumos"), icon: FlaskConical },
          { title: "Acompanhamento de Cargas", url: createPageUrl("AcompanhamentoCarga"), icon: FlaskConical },
          { title: "Viga Benkelman", url: createPageUrl("EnsaioVigaBenkelman"), icon: Gauge },
          { title: "Densidade In Situ", url: createPageUrl("EnsaioDensidadeInSitu"), icon: Gauge },
          { title: "Ensaio Proctor", url: createPageUrl("EnsaioProctor"), icon: FlaskConical },
          { title: "Mancha + Pêndulo", url: createPageUrl("EnsaioManchaPendulo"), icon: Gauge },
        ],
      },
    ],
  },
  {
    nome: "Sondagem",
    icon: Gauge,
    tipo_obra: "sondagem",
    ensaios: [
      { title: "Boletim de Sondagem (PI)", url: createPageUrl("BoletimSondagem"), icon: FileText },
      { title: "Boletim de Sondagem a Trado", url: createPageUrl("BoletimSondagemTrado"), icon: FileText },
      { title: "Ensaio Proctor", url: createPageUrl("EnsaioProctor"), icon: FlaskConical },
    ],
  },
  {
    nome: "Levantamentos",
    icon: FileText,
    tipo_obra: "levantamentos",
    ensaios: [
      { title: "Mancha + Pêndulo", url: createPageUrl("EnsaioManchaPendulo"), icon: Gauge },
      { title: "Viga Benkelman", url: createPageUrl("EnsaioVigaBenkelman"), icon: Gauge },
    ],
  },
  {
    nome: "Homologação de Usinas",
    icon: Factory,
    tipo_obra: "homologacao_usinas",
    ensaios: [
      { title: "Certificação de Usina", url: createPageUrl("CertificacaoUsina"), icon: FileText },
    ],
  },
];

export const DIARIO_OBRA = {
  title: "Diário de Obra",
  url: createPageUrl("DiarioObra"),
  icon: Book,
  description: "Registro diário de atividades",
};