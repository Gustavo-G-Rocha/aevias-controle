import { Suspense } from 'react';
import { TablePageSkeleton } from '@/components/skeletons/PageSkeletons';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import AndroidBackHandler from '@/components/layout/AndroidBackHandler'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import TwoFactorGate from '@/components/auth/TwoFactorGate';
import { useTheme } from '@/hooks/useTheme';
import { lazyWithRetry as lazy } from '@/lib/lazyWithRetry';

// Páginas importadas de forma lazy para não entrar no bundle inicial.
// Usuários autenticados nunca acessam as rotas de auth, e os relatórios/
// páginas auxiliares só são baixados quando navegados.
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const HistoricoAuditoria = lazy(() => import('@/pages/HistoricoAuditoria'));
const EnsaioTaxaInsumos = lazy(() => import('@/pages/EnsaioTaxaInsumos'));
const RelatorioTaxaInsumos = lazy(() => import('@/pages/RelatorioTaxaInsumos'));
const ReportarErro = lazy(() => import('@/pages/ReportarErro'));
const VerificarAssinatura = lazy(() => import('@/pages/VerificarAssinatura'));
const DocumentacaoSistema = lazy(() => import('@/pages/DocumentacaoSistema'));
const AuditorTecnico = lazy(() => import('@/pages/AuditorTecnico'));

// Fallback leve exibido enquanto o chunk da página lazy é baixado.
// O Layout (sidebar/header/bottom-nav) já está renderizado — só o conteúdo suspende.
const PageLoadingFallback = () => <TablePageSkeleton />;

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => {
  const content = <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>;
  return Layout
    ? <Layout currentPageName={currentPageName}>{content}</Layout>
    : content;
};

function AuthenticatedApp() {
  return (
    <Routes>
      {/* Public auth routes (lazy — envolvidas em Suspense próprio) */}
      <Route path="/login" element={<Suspense fallback={<PageLoadingFallback />}><Login /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<PageLoadingFallback />}><Register /></Suspense>} />
      <Route path="/forgot-password" element={<Suspense fallback={<PageLoadingFallback />}><ForgotPassword /></Suspense>} />
      <Route path="/reset-password" element={<Suspense fallback={<PageLoadingFallback />}><ResetPassword /></Suspense>} />
      <Route path="/verificar-assinatura" element={<Suspense fallback={<PageLoadingFallback />}><VerificarAssinatura /></Suspense>} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<TwoFactorGate />}>
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="/EnsaioTaxaInsumos" element={
          <LayoutWrapper currentPageName="EnsaioTaxaInsumos">
            <EnsaioTaxaInsumos />
          </LayoutWrapper>
        } />
        <Route path="/RelatorioTaxaInsumos" element={
          <LayoutWrapper currentPageName="RelatorioTaxaInsumos">
            <RelatorioTaxaInsumos />
          </LayoutWrapper>
        } />
        <Route path="/historico-auditoria" element={
          <LayoutWrapper currentPageName="HistoricoAuditoria">
            <HistoricoAuditoria />
          </LayoutWrapper>
        } />
        <Route path="/DocumentacaoSistema" element={
          <LayoutWrapper currentPageName="DocumentacaoSistema">
            <DocumentacaoSistema />
          </LayoutWrapper>
        } />
        <Route path="/AuditorTecnico" element={
          <LayoutWrapper currentPageName="AuditorTecnico">
            <AuditorTecnico />
          </LayoutWrapper>
        } />
        <Route path="/ReportarErro" element={
          <LayoutWrapper currentPageName="ReportarErro">
            <ReportarErro />
          </LayoutWrapper>
        } />
        <Route path="*" element={<PageNotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};


function App() {
  // Mantém a classe .dark sincronizada com a preferência do usuário em runtime.
  useTheme();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AndroidBackHandler />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;