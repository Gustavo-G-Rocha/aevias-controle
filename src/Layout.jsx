import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import PullToRefresh from "@/components/PullToRefresh";
import { ACCESS_LEVELS, getUserAccessLevel } from "@/lib/layoutConstants";

import { useLayoutData } from "@/components/layout/useLayoutData";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import CreateEnsaioDialog from "@/components/layout/CreateEnsaioDialog";
import { REPORT_PAGES } from "@/pages.config";

const AppLayout = ({ children }) => {
  const [isCreateEnsaioOpen, setIsCreateEnsaioOpen] = useState(false);
  const [naoConformidadesOpen, setNaoConformidadesOpen] = useState(false);
  const [minhasObrasOpen, setMinhasObrasOpen] = useState(false);

  const { user, obrasDoUsuario, loadingUser, pendingTransfers } = useLayoutData();

  const userAccessLevel = getUserAccessLevel(user);
  const isAdmin = userAccessLevel === ACCESS_LEVELS.ADMIN || user?.role === ACCESS_LEVELS.ADMIN;
  const isSalaTecnica = userAccessLevel === ACCESS_LEVELS.SALA_TECNICA;
  const isGestorContrato = userAccessLevel === ACCESS_LEVELS.GESTOR_CONTRATO;
  const isCliente = userAccessLevel === ACCESS_LEVELS.CLIENTE;
  const canManageSystem = isAdmin;
  const canCreateRecords = !loadingUser && (isAdmin || (!isSalaTecnica && !isGestorContrato && !isCliente));

  return (
    <SidebarProvider>
      <Dialog open={isCreateEnsaioOpen} onOpenChange={setIsCreateEnsaioOpen}>
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
            isAdmin={isAdmin}
            isSalaTecnica={isSalaTecnica}
            isGestorContrato={isGestorContrato}
            isCliente={isCliente}
          />

          <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
            <MobileHeader user={user} canCreateRecords={canCreateRecords} />

            <div className="flex-1 flex flex-col">
              <PullToRefresh>
                <div className="pb-16 lg:pb-0 overflow-x-hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
                  {children}
                </div>
              </PullToRefresh>
            </div>
            <BottomNav />
          </main>
        </div>

        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ color: 'var(--color-text)' }}>Iniciar Novo Registro</DialogTitle>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Selecione o tipo de registro que deseja criar</p>
          </DialogHeader>
          <CreateEnsaioDialog
            onSelect={() => setIsCreateEnsaioOpen(false)}
            user={user}
            obrasDoUsuario={obrasDoUsuario}
          />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default function Layout({ children, currentPageName }) {
  if (currentPageName && REPORT_PAGES.has(currentPageName)) {
    return <div className="report-scope">{children}</div>;
  }
  return <AppLayout>{children}</AppLayout>;
}