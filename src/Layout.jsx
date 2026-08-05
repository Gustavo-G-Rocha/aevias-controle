import React, { useState, useCallback, useLayoutEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TabNavigationProvider } from "@/components/layout/TabNavigationContext";
import PullToRefresh from "@/components/PullToRefresh";
import { ACCESS_LEVELS, getUserAccessLevel, getTabZone, SESSION_KEYS } from "@/lib/layoutConstants";
import { isFormPage } from "@/lib/reportPages";

import { useLayoutData } from "@/components/layout/useLayoutData";
import AppSidebar from "@/components/layout/AppSidebar";
import BottomNav from "@/components/layout/BottomNav";
import CreateEnsaioDialog from "@/components/layout/CreateEnsaioDialog";
import { CreateEnsaioDialogProvider } from "@/components/layout/CreateEnsaioDialogContext";
import MobileBackHeader from "@/components/layout/MobileBackHeader";
import PageTransition from "@/components/layout/PageTransition";
import OfflineStatusBar from "@/components/offline/OfflineStatusBar";
import NotificationProvider from "@/components/notifications/NotificationProvider";
import NotificationBell from "@/components/notifications/NotificationBell";
import SidebarToggle from "@/components/layout/SidebarToggle";
import ReportBackBar from "@/components/layout/ReportBackBar";
import { REPORT_PAGES } from "@/lib/reportPages";

const AppLayout = ({ children, currentPageName }) => {
  const [isCreateEnsaioOpen, setIsCreateEnsaioOpen] = useState(false);
  const [naoConformidadesOpen, setNaoConformidadesOpen] = useState(false);
  const [minhasObrasOpen, setMinhasObrasOpen] = useState(false);

  const { user, obrasDoUsuario, loadingUser, pendingTransfers } = useLayoutData();
  const navigate = useNavigate();
  const location = useLocation();
  const prevZoneRef = useRef(null);

  // ── Scroll position restoration per tab zone ──
  // Saves the scroll position of the previous tab zone before switching,
  // and restores the saved position when returning to a zone. This keeps
  // the user's place on long lists when bouncing between bottom tabs.
  useLayoutEffect(() => {
    const currentZone = getTabZone(location.pathname);
    if (!currentZone) {
      prevZoneRef.current = null;
      return;
    }

    if (prevZoneRef.current && prevZoneRef.current !== currentZone) {
      try {
        sessionStorage.setItem(
          `${SESSION_KEYS.TAB_SCROLL_PREFIX}${prevZoneRef.current}`,
          String(window.scrollY)
        );
      } catch { /* storage indisponível no APK */ }
    }

    try {
      const saved = sessionStorage.getItem(`${SESSION_KEYS.TAB_SCROLL_PREFIX}${currentZone}`);
      if (saved !== null) {
        requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10) || 0));
      } else {
        window.scrollTo(0, 0);
      }
    } catch { /* storage indisponível */ }

    prevZoneRef.current = currentZone;
  }, [location.pathname, location.search]);

  const handleEnsaioSelect = useCallback((url) => {
    if (!url) return;
    // Navega imediatamente. O Dialog é irmão da árvore do app (não envolve
    // os children), então o teardown do portal Radix e a troca de rota
    // operam em subárvores independentes — sem conflito de "removeChild".
    navigate(url);
    setIsCreateEnsaioOpen(false);
  }, [navigate]);

  const userAccessLevel = getUserAccessLevel(user);
  const isAdmin = userAccessLevel === ACCESS_LEVELS.ADMIN || user?.role === ACCESS_LEVELS.ADMIN;
  const isSalaTecnica = userAccessLevel === ACCESS_LEVELS.SALA_TECNICA;
  const _isGestorContrato = userAccessLevel === ACCESS_LEVELS.GESTOR_CONTRATO;
  const _isCliente = userAccessLevel === ACCESS_LEVELS.CLIENTE || userAccessLevel === ACCESS_LEVELS.CLIENTE_SUPERVISOR;
  const canManageSystem = isAdmin;
  const canCreateRecords = !loadingUser && (isAdmin || isSalaTecnica || userAccessLevel === ACCESS_LEVELS.USER || userAccessLevel === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE || userAccessLevel === ACCESS_LEVELS.CLIENTE_SUPERVISOR);

  return (
    <SidebarProvider>
      <TabNavigationProvider>
      <CreateEnsaioDialogProvider onOpen={setIsCreateEnsaioOpen}>
      <NotificationProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
        <AppSidebar
          user={user}
          userAccessLevel={userAccessLevel}
          canCreateRecords={canCreateRecords}
          canManageSystem={canManageSystem}
          pendingTransfers={pendingTransfers}
          minhasObrasOpen={minhasObrasOpen}
          setMinhasObrasOpen={setMinhasObrasOpen}
          naoConformidadesOpen={naoConformidadesOpen}
          setNaoConformidadesOpen={setNaoConformidadesOpen}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <SidebarToggle />
          <MobileBackHeader />
          <div className="hidden lg:block fixed top-4 right-4 z-50 print:hidden">
            <NotificationBell variant="desktop" />
          </div>
          <div className="flex-1 flex flex-col">
            <PullToRefresh disabled={isFormPage(currentPageName)}>
              <PageTransition
                className="pb-16 lg:pb-0 overflow-x-hidden"
                style={{ paddingTop: "env(safe-area-inset-top)" }}
              >
                {children}
              </PageTransition>
            </PullToRefresh>
          </div>
          <BottomNav
            userAccessLevel={userAccessLevel}
            canManageSystem={canManageSystem}
            pendingTransfers={pendingTransfers} />
          <OfflineStatusBar />
        </main>
      </div>

      {/* Diálogo "Iniciar Novo Registro" como nó separado da árvore do app.
          Antes o <Dialog> envolvia toda a layout (sidebar + main + motion.div
          keyed por pathname). Ao navegar a partir do diálogo, o re-key do
          motion.div (desmonta/monta a página) acontecia na mesma commit em que
          o Radix fechava o portal do DialogContent — ambos dentro da subárvore
          do Dialog — causando "Failed to execute 'removeChild' on 'Node'".
          Agora o Diálogo é irmão da árvore do app, então o teardown do portal
          e a troca de rota operam em subárvores React independentes. */}
      <Dialog open={isCreateEnsaioOpen} onOpenChange={setIsCreateEnsaioOpen}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] overflow-hidden"
        >
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ color: 'var(--color-text)' }}>Iniciar Novo Registro</DialogTitle>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Selecione o tipo de registro que deseja criar</p>
          </DialogHeader>
          <CreateEnsaioDialog
            onSelect={handleEnsaioSelect}
            user={user}
            obrasDoUsuario={obrasDoUsuario}
          />
        </DialogContent>
      </Dialog>
      </NotificationProvider>
      </CreateEnsaioDialogProvider>
      </TabNavigationProvider>
    </SidebarProvider>
  );
};

export default function Layout({ children, currentPageName }) {
  if (currentPageName && REPORT_PAGES.has(currentPageName)) {
    return <div className="report-scope"><ReportBackBar />{children}</div>;
  }
  return <AppLayout currentPageName={currentPageName}>{children}</AppLayout>;
}