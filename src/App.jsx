import { Suspense } from 'react';
import LoadingState from '@/components/LoadingState';
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
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import HistoricoAuditoria from '@/pages/HistoricoAuditoria';
import EnsaioTaxaInsumos from '@/pages/EnsaioTaxaInsumos';
import RelatorioTaxaInsumos from '@/pages/RelatorioTaxaInsumos';
import ReportarErro from '@/pages/ReportarErro';
import VerificarAssinatura from '@/pages/VerificarAssinatura';

// Fallback leve exibido enquanto o chunk da página lazy é baixado.
// O Layout (sidebar/header/bottom-nav) já está renderizado — só o conteúdo suspende.
const PageLoadingFallback = () => <LoadingState />;

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
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verificar-assinatura" element={<VerificarAssinatura />} />

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