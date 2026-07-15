/**
 * pages.config.js — Page routing configuration
 *
 * ⚠️  This file is NOT auto-generated. It is manually maintained.
 *     New pages are NOT auto-registered — you MUST follow the checklist
 *     below, otherwise the page will be unreachable (no build error).
 *
 * ── How to add a new page ──────────────────────────────────────────────
 *
 * 1. Create the page component in src/pages/ (e.g. src/pages/MyPage.jsx).
 *
 * 2. Add a lazy import here (alphabetical order by convention):
 *        const MyPage = lazyPage(() => import('./pages/MyPage'));
 *
 * 3. Add an entry to the PAGES object (key = route path segment):
 *        "MyPage": MyPage,
 *
 * 4. If the page is a report (uses report-scope layout, no sidebar),
 *    add its key to the REPORT_PAGES set below.
 *
 * 5. App.jsx reads pagesConfig.Pages and generates a <Route> for each
 *    key automatically — no need to edit App.jsx for standard pages.
 *    Routes outside this loop (if any) must be added manually in App.jsx.
 *
 * 6. To set the landing page, change mainPage below to the desired key.
 *
 * ── mainPage ───────────────────────────────────────────────────────────
 * Controls which page is shown when users visit "/".
 * The value must match a key in PAGES exactly.
 * ────────────────────────────────────────────────────────────────────────
 *
 * ── Code Splitting ──────────────────────────────────────────────────────
 * Pages are lazy-loaded via React.lazy() so each route becomes a separate
 * chunk. Heavy dependencies (three.js, jspdf, html2canvas, recharts,
 * react-leaflet, react-quill) are only downloaded when the page that uses
 * them is actually visited. App.jsx wraps routes in <Suspense>.
 * ────────────────────────────────────────────────────────────────────────
 */
import { lazyPage } from '@/lib/lazyPage';

const CertificacaoUsina = lazyPage(() => import('./pages/CertificacaoUsina/index'));
const RelatorioCertificacaoUsina = lazyPage(() => import('./pages/RelatorioCertificacaoUsina'));
const AcompanhamentoCarga = lazyPage(() => import('./pages/AcompanhamentoCarga'));
const AcompanhamentoUsinagem = lazyPage(() => import('./pages/AcompanhamentoUsinagem'));
const BoletimSondagem = lazyPage(() => import('./pages/BoletimSondagem'));
const ChecklistAplicacao = lazyPage(() => import('./pages/ChecklistAplicacao/index'));
const ChecklistConcretagem = lazyPage(() => import('./pages/ChecklistConcretagem/index'));
const ChecklistMRAF = lazyPage(() => import('./pages/ChecklistMRAF'));
const ChecklistReciclagem = lazyPage(() => import('./pages/ChecklistReciclagem/index'));
const ChecklistTerraplanagem = lazyPage(() => import('./pages/ChecklistTerraplanagem/index'));
const ChecklistUsina = lazyPage(() => import('./pages/ChecklistUsina/index'));
const ControleLaboratoristas = lazyPage(() => import('./pages/ControleLaboratoristas'));
const Dashboard = lazyPage(() => import('./pages/Dashboard'));
const DiarioObra = lazyPage(() => import('./pages/DiarioObra/index'));
const EditarNC = lazyPage(() => import('./pages/EditarNC'));
const EnsaioCAUQ = lazyPage(() => import('./pages/EnsaioCAUQ/index'));
const EnsaioDensidade = lazyPage(() => import('./pages/EnsaioDensidade'));
const EnsaioDensidadeInSitu = lazyPage(() => import('./pages/EnsaioDensidadeInSitu'));
const EnsaioGranulometriaIndividual = lazyPage(() => import('./pages/EnsaioGranulometriaIndividual'));
const EnsaioMRAF = lazyPage(() => import('./pages/EnsaioMRAF'));
const EnsaioManchaPendulo = lazyPage(() => import('./pages/EnsaioManchaPendulo'));
const EnsaioSondagem = lazyPage(() => import('./pages/EnsaioSondagem'));
const EnsaioTaxaMRAF = lazyPage(() => import('./pages/EnsaioTaxaMRAF'));
const EnsaioTaxaPinturaImprimacao = lazyPage(() => import('./pages/EnsaioTaxaPinturaImprimacao'));
const EnsaioVigaBenkelman = lazyPage(() => import('./pages/EnsaioVigaBenkelman'));
const FaixasGranulometricas = lazyPage(() => import('./pages/FaixasGranulometricas'));
const GestaoNC = lazyPage(() => import('./pages/GestaoNC'));
const Home = lazyPage(() => import('./pages/Home'));
const ImpressionEtiquetas = lazyPage(() => import('./pages/ImpressionEtiquetas'));
const MeusEnsaios = lazyPage(() => import('./pages/MeusEnsaios'));
const MigracaoDados = lazyPage(() => import('./pages/MigracaoDados'));
const MonitorProdutividade = lazyPage(() => import('./pages/MonitorProdutividade'));
const NaoConformidades = lazyPage(() => import('./pages/NaoConformidades'));
const NovaNC = lazyPage(() => import('./pages/NovaNC'));
const Produtividade = lazyPage(() => import('./pages/Produtividade'));
const Projects = lazyPage(() => import('./pages/Projects'));
const Regionais = lazyPage(() => import('./pages/Regionais'));
const RelatorioAcompanhamentoCarga = lazyPage(() => import('./pages/RelatorioAcompanhamentoCarga'));
const RelatorioAcompanhamentoUsinagem = lazyPage(() => import('./pages/RelatorioAcompanhamentoUsinagem'));
const RelatorioCAUQ = lazyPage(() => import('./pages/RelatorioCAUQ'));
const RelatorioChecklist = lazyPage(() => import('./pages/RelatorioChecklist'));
const RelatorioChecklistAplicacao = lazyPage(() => import('./pages/RelatorioChecklistAplicacao'));
const RelatorioChecklistConcretagem = lazyPage(() => import('./pages/RelatorioChecklistConcretagem'));
const RelatorioChecklistMRAF = lazyPage(() => import('./pages/RelatorioChecklistMRAF'));
const RelatorioChecklistPage = lazyPage(() => import('./pages/RelatorioChecklistPage'));
const RelatorioChecklistReciclagem = lazyPage(() => import('./pages/RelatorioChecklistReciclagem'));
const RelatorioChecklistTerraplanagem = lazyPage(() => import('./pages/RelatorioChecklistTerraplanagem'));
const RelatorioDensidadeInSitu = lazyPage(() => import('./pages/RelatorioDensidadeInSitu'));
const RelatorioDiario = lazyPage(() => import('./pages/RelatorioDiario'));
const RelatorioEnsaio = lazyPage(() => import('./pages/RelatorioEnsaio'));
const RelatorioGranulometriaIndividual = lazyPage(() => import('./pages/RelatorioGranulometriaIndividual'));
const RelatorioManchaPendulo = lazyPage(() => import('./pages/RelatorioManchaPendulo'));
const RelatorioNC = lazyPage(() => import('./pages/RelatorioNC'));
const RelatorioSondagem = lazyPage(() => import('./pages/RelatorioSondagem'));
const RelatorioTaxaMRAF = lazyPage(() => import('./pages/RelatorioTaxaMRAF'));
const RelatorioTaxaPinturaImprimacao = lazyPage(() => import('./pages/RelatorioTaxaPinturaImprimacao'));
const RelatorioVigaBenkelman = lazyPage(() => import('./pages/RelatorioVigaBenkelman'));
const ResumosPersonalizados = lazyPage(() => import('./pages/ResumosPersonalizados/index'));
const SolicitacoesTransferencia = lazyPage(() => import('./pages/SolicitacoesTransferencia'));
const Users = lazyPage(() => import('./pages/Users'));
const RelatorioBoletimSondagem = lazyPage(() => import('./pages/RelatorioBoletimSondagem'));
const BoletimSondagemTrado = lazyPage(() => import('./pages/BoletimSondagemTrado'));
const RelatorioBoletimSondagemTrado = lazyPage(() => import('./pages/RelatorioBoletimSondagemTrado'));
const EnsaioProctor = lazyPage(() => import('./pages/EnsaioProctor'));
const RelatorioProctor = lazyPage(() => import('./pages/RelatorioProctor'));
const EnsaioRompimentoConcreto = lazyPage(() => import('./pages/EnsaioRompimentoConcreto'));
const RelatorioRompimentoConcreto = lazyPage(() => import('./pages/RelatorioRompimentoConcreto'));
const GranuMistura = lazyPage(() => import('./pages/GranuMistura'));
const RelatorioGranuMistura = lazyPage(() => import('./pages/RelatorioGranuMistura'));
const RelatoriosUnificados = lazyPage(() => import('./pages/RelatoriosUnificados'));
const RelatorioUnificado = lazyPage(() => import('./pages/RelatorioUnificado'));
const Settings = lazyPage(() => import('./pages/Settings'));
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

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};