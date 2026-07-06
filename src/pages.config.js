/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 *
 * ── Code Splitting ──────────────────────────────────────────────────────
 * Pages are lazy-loaded via React.lazy() so each route becomes a separate
 * chunk. Heavy dependencies (three.js, jspdf, html2canvas, recharts,
 * react-leaflet, react-quill) are only downloaded when the page that uses
 * them is actually visited. App.jsx wraps routes in <Suspense>.
 * ────────────────────────────────────────────────────────────────────────
 */
import { lazy } from 'react';

const CertificacaoUsina = lazy(() => import('./pages/CertificacaoUsina/index'));
const RelatorioCertificacaoUsina = lazy(() => import('./pages/RelatorioCertificacaoUsina'));
const AcompanhamentoCarga = lazy(() => import('./pages/AcompanhamentoCarga'));
const AcompanhamentoUsinagem = lazy(() => import('./pages/AcompanhamentoUsinagem'));
const BoletimSondagem = lazy(() => import('./pages/BoletimSondagem'));
const ChecklistAplicacao = lazy(() => import('./pages/ChecklistAplicacao/index'));
const ChecklistConcretagem = lazy(() => import('./pages/ChecklistConcretagem/index'));
const ChecklistMRAF = lazy(() => import('./pages/ChecklistMRAF'));
const ChecklistReciclagem = lazy(() => import('./pages/ChecklistReciclagem/index'));
const ChecklistTerraplanagem = lazy(() => import('./pages/ChecklistTerraplanagem/index'));
const ChecklistUsina = lazy(() => import('./pages/ChecklistUsina/index'));
const ControleLaboratoristas = lazy(() => import('./pages/ControleLaboratoristas'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DiarioObra = lazy(() => import('./pages/DiarioObra/index'));
const EditarNC = lazy(() => import('./pages/EditarNC'));
const EnsaioCAUQ = lazy(() => import('./pages/EnsaioCAUQ/index'));
const EnsaioDensidade = lazy(() => import('./pages/EnsaioDensidade'));
const EnsaioDensidadeInSitu = lazy(() => import('./pages/EnsaioDensidadeInSitu'));
const EnsaioGranulometriaIndividual = lazy(() => import('./pages/EnsaioGranulometriaIndividual'));
const EnsaioMRAF = lazy(() => import('./pages/EnsaioMRAF'));
const EnsaioManchaPendulo = lazy(() => import('./pages/EnsaioManchaPendulo'));
const EnsaioSondagem = lazy(() => import('./pages/EnsaioSondagem'));
const EnsaioTaxaMRAF = lazy(() => import('./pages/EnsaioTaxaMRAF'));
const EnsaioTaxaPinturaImprimacao = lazy(() => import('./pages/EnsaioTaxaPinturaImprimacao'));
const EnsaioVigaBenkelman = lazy(() => import('./pages/EnsaioVigaBenkelman'));
const FaixasGranulometricas = lazy(() => import('./pages/FaixasGranulometricas'));
const GestaoNC = lazy(() => import('./pages/GestaoNC'));
const Home = lazy(() => import('./pages/Home'));
const ImpressionEtiquetas = lazy(() => import('./pages/ImpressionEtiquetas'));
const MeusEnsaios = lazy(() => import('./pages/MeusEnsaios'));
const MigracaoDados = lazy(() => import('./pages/MigracaoDados'));
const MonitorProdutividade = lazy(() => import('./pages/MonitorProdutividade'));
const NaoConformidades = lazy(() => import('./pages/NaoConformidades'));
const NovaNC = lazy(() => import('./pages/NovaNC'));
const Produtividade = lazy(() => import('./pages/Produtividade'));
const Projects = lazy(() => import('./pages/Projects'));
const Regionais = lazy(() => import('./pages/Regionais'));
const RelatorioAcompanhamentoCarga = lazy(() => import('./pages/RelatorioAcompanhamentoCarga'));
const RelatorioAcompanhamentoUsinagem = lazy(() => import('./pages/RelatorioAcompanhamentoUsinagem'));
const RelatorioCAUQ = lazy(() => import('./pages/RelatorioCAUQ'));
const RelatorioChecklist = lazy(() => import('./pages/RelatorioChecklist'));
const RelatorioChecklistAplicacao = lazy(() => import('./pages/RelatorioChecklistAplicacao'));
const RelatorioChecklistConcretagem = lazy(() => import('./pages/RelatorioChecklistConcretagem'));
const RelatorioChecklistMRAF = lazy(() => import('./pages/RelatorioChecklistMRAF'));
const RelatorioChecklistPage = lazy(() => import('./pages/RelatorioChecklistPage'));
const RelatorioChecklistReciclagem = lazy(() => import('./pages/RelatorioChecklistReciclagem'));
const RelatorioChecklistTerraplanagem = lazy(() => import('./pages/RelatorioChecklistTerraplanagem'));
const RelatorioDensidadeInSitu = lazy(() => import('./pages/RelatorioDensidadeInSitu'));
const RelatorioDiario = lazy(() => import('./pages/RelatorioDiario'));
const RelatorioEnsaio = lazy(() => import('./pages/RelatorioEnsaio'));
const RelatorioGranulometriaIndividual = lazy(() => import('./pages/RelatorioGranulometriaIndividual'));
const RelatorioManchaPendulo = lazy(() => import('./pages/RelatorioManchaPendulo'));
const RelatorioNC = lazy(() => import('./pages/RelatorioNC'));
const RelatorioSondagem = lazy(() => import('./pages/RelatorioSondagem'));
const RelatorioTaxaMRAF = lazy(() => import('./pages/RelatorioTaxaMRAF'));
const RelatorioTaxaPinturaImprimacao = lazy(() => import('./pages/RelatorioTaxaPinturaImprimacao'));
const RelatorioVigaBenkelman = lazy(() => import('./pages/RelatorioVigaBenkelman'));
const ResumosPersonalizados = lazy(() => import('./pages/ResumosPersonalizados/index'));
const SolicitacoesTransferencia = lazy(() => import('./pages/SolicitacoesTransferencia'));
const Users = lazy(() => import('./pages/Users'));
const RelatorioBoletimSondagem = lazy(() => import('./pages/RelatorioBoletimSondagem'));
const BoletimSondagemTrado = lazy(() => import('./pages/BoletimSondagemTrado'));
const RelatorioBoletimSondagemTrado = lazy(() => import('./pages/RelatorioBoletimSondagemTrado'));
const EnsaioProctor = lazy(() => import('./pages/EnsaioProctor'));
const RelatorioProctor = lazy(() => import('./pages/RelatorioProctor'));
const EnsaioRompimentoConcreto = lazy(() => import('./pages/EnsaioRompimentoConcreto'));
const RelatorioRompimentoConcreto = lazy(() => import('./pages/RelatorioRompimentoConcreto'));
const GranuMistura = lazy(() => import('./pages/GranuMistura'));
const RelatorioGranuMistura = lazy(() => import('./pages/RelatorioGranuMistura'));
const RelatoriosUnificados = lazy(() => import('./pages/RelatoriosUnificados'));
const RelatorioUnificado = lazy(() => import('./pages/RelatorioUnificado'));
const Settings = lazy(() => import('./pages/Settings'));
import __Layout from './Layout.jsx';


export const PAGES = {
    "CertificacaoUsina": CertificacaoUsina,
    "RelatorioCertificacaoUsina": RelatorioCertificacaoUsina,
    "AcompanhamentoCarga": AcompanhamentoCarga,
    "AcompanhamentoUsinagem": AcompanhamentoUsinagem,
    "BoletimSondagem": BoletimSondagem,
    "ChecklistAplicacao": ChecklistAplicacao,
    "ChecklistConcretagem": ChecklistConcretagem,
    "ChecklistMRAF": ChecklistMRAF,
    "ChecklistReciclagem": ChecklistReciclagem,
    "ChecklistTerraplanagem": ChecklistTerraplanagem,
    "ChecklistUsina": ChecklistUsina,
    "ControleLaboratoristas": ControleLaboratoristas,
    "Dashboard": Dashboard,
    "DiarioObra": DiarioObra,
    "EditarNC": EditarNC,
    "EnsaioCAUQ": EnsaioCAUQ,
    "EnsaioDensidade": EnsaioDensidade,
    "EnsaioDensidadeInSitu": EnsaioDensidadeInSitu,
    "EnsaioGranulometriaIndividual": EnsaioGranulometriaIndividual,
    "EnsaioMRAF": EnsaioMRAF,
    "EnsaioManchaPendulo": EnsaioManchaPendulo,
    "EnsaioSondagem": EnsaioSondagem,
    "EnsaioTaxaMRAF": EnsaioTaxaMRAF,
    "EnsaioTaxaPinturaImprimacao": EnsaioTaxaPinturaImprimacao,
    "EnsaioVigaBenkelman": EnsaioVigaBenkelman,
    "FaixasGranulometricas": FaixasGranulometricas,
    "GestaoNC": GestaoNC,
    "Home": Home,
    "ImpressionEtiquetas": ImpressionEtiquetas,
    "MeusEnsaios": MeusEnsaios,
    "MigracaoDados": MigracaoDados,
    "MonitorProdutividade": MonitorProdutividade,
    "NaoConformidades": NaoConformidades,
    "NovaNC": NovaNC,
    "Produtividade": Produtividade,
    "Projects": Projects,
    "Regionais": Regionais,
    "RelatorioAcompanhamentoCarga": RelatorioAcompanhamentoCarga,
    "RelatorioAcompanhamentoUsinagem": RelatorioAcompanhamentoUsinagem,
    "RelatorioCAUQ": RelatorioCAUQ,
    "RelatorioChecklist": RelatorioChecklist,
    "RelatorioChecklistAplicacao": RelatorioChecklistAplicacao,
    "RelatorioChecklistConcretagem": RelatorioChecklistConcretagem,
    "RelatorioChecklistMRAF": RelatorioChecklistMRAF,
    "RelatorioChecklistPage": RelatorioChecklistPage,
    "RelatorioChecklistReciclagem": RelatorioChecklistReciclagem,
    "RelatorioChecklistTerraplanagem": RelatorioChecklistTerraplanagem,
    "RelatorioDensidadeInSitu": RelatorioDensidadeInSitu,
    "RelatorioDiario": RelatorioDiario,
    "RelatorioEnsaio": RelatorioEnsaio,
    "RelatorioGranulometriaIndividual": RelatorioGranulometriaIndividual,
    "RelatorioManchaPendulo": RelatorioManchaPendulo,
    "RelatorioNC": RelatorioNC,
    "RelatorioSondagem": RelatorioSondagem,
    "RelatorioTaxaMRAF": RelatorioTaxaMRAF,
    "RelatorioTaxaPinturaImprimacao": RelatorioTaxaPinturaImprimacao,
    "RelatorioVigaBenkelman": RelatorioVigaBenkelman,
    "ResumosPersonalizados": ResumosPersonalizados,
    "SolicitacoesTransferencia": SolicitacoesTransferencia,
    "Users": Users,
    "RelatorioBoletimSondagem": RelatorioBoletimSondagem,
    "BoletimSondagemTrado": BoletimSondagemTrado,
    "RelatorioBoletimSondagemTrado": RelatorioBoletimSondagemTrado,
    "EnsaioProctor": EnsaioProctor,
    "RelatorioProctor": RelatorioProctor,
    "EnsaioRompimentoConcreto": EnsaioRompimentoConcreto,
    "RelatorioRompimentoConcreto": RelatorioRompimentoConcreto,
    "GranuMistura": GranuMistura,
    "RelatorioGranuMistura": RelatorioGranuMistura,
    "RelatoriosUnificados": RelatoriosUnificados,
    "RelatorioUnificado": RelatorioUnificado,
    "Settings": Settings,
}

/**
 * Páginas que usam o escopo de relatório (report-scope) em vez do layout
 * padrão com sidebar/header/bottom-nav. Manter explicitamente: se uma página
 * de relatório for renomeada, adicionar o novo nome aqui para preservar o
 * escape de layout. Não usar prefixo de string — a associação é explícita.
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

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};