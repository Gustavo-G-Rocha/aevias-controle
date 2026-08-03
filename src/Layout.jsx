import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import PullToRefresh from "@/components/PullToRefresh";
import { ACCESS_LEVELS, getUserAccessLevel } from "@/lib/layoutConstants";
import { isFormPage } from "@/lib/reportPages";

import { useLayoutData } from "@/components/layout/useLayoutData";
import AppSidebar from "@/components/layout/AppSidebar";
import BottomNav from "@/components/layout/BottomNav";
import CreateEnsaioDialog from "@/components/layout/CreateEnsaioDialog";
import { CreateEnsaioDialogProvider } from "@/components/layout/CreateEnsaioDialogContext";
import MobileBackHeader from "@/components/layout/MobileBackHeader";
import PageTransition from "@/components/layout/PageTransition";
import OfflineStatusBar from "@/components/offline/OfflineStatusBar";
import NotificationAgent from "@/components/notifications/NotificationAgent";
import SidebarToggle from "@/components/layout/SidebarToggle";
import ReportBackBar from "@/components/layout/ReportBackBar";
import { REPORT_PAGES } from "@/lib/reportPages";

const AppLayout = ({ children, currentPageName }) => {
  const [isCreateEnsaioOpen, setIsCreateEnsaioOpen] = useState(false);
  const [naoConformidadesOpen, setNaoConformidadesOpen] = useState(false);
  const [minhasObrasOpen, setMinhasObrasOpen] = useState(false);

  const { user, obrasDoUsuario, loadingUser, pendingTransfers } = useLayoutData();
  const navigate = useNavigate();

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
      <CreateEnsaioDialogProvider onOpen={setIsCreateEnsaioOpen}>
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
          <NotificationAgent />
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
      </CreateEnsaioDialogProvider>
    </SidebarProvider>
  );
};

export default function Layout({ children, currentPageName }) {
  if (currentPageName && REPORT_PAGES.has(currentPageName)) {
    return <div className="report-scope"><ReportBackBar />{children}</div>;
  }
  return <AppLayout currentPageName={currentPageName}>{children}</AppLayout>;
}