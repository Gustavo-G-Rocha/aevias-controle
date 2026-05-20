import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import PullToRefresh from "@/components/PullToRefresh";
import { REPORT_PAGES, ACCESS_LEVELS, getUserAccessLevel } from "@/lib/layoutConstants";

import { useLayoutData } from "@/components/layout/useLayoutData";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import CreateEnsaioDialog from "@/components/layout/CreateEnsaioDialog";

const AppLayout = ({ children }) => {
  const location = useLocation();
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
        <div className="min-h-screen flex w-full bg-[#F2F1EF] overflow-x-hidden">
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

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="flex-1 flex flex-col"
              >
                <PullToRefresh>
                  <div className="pb-16 lg:pb-0 lg:pt-0 overflow-x-hidden" style={{ paddingTop: "calc(3rem + env(safe-area-inset-top))" }}>
                    {children}
                  </div>
                </PullToRefresh>
              </motion.div>
            </AnimatePresence>
            <BottomNav />
          </main>
        </div>

        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden bg-[#F2F1EF]/80 backdrop-blur-xl border-white/20 text-[#00233B]">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#00233B]">Iniciar Novo Registro</DialogTitle>
            <p className="text-sm text-[#00233B]/80">Selecione o tipo de registro que deseja criar</p>
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
  if (REPORT_PAGES.has(currentPageName)) {
    return <>{children}</>;
  }
  return <AppLayout>{children}</AppLayout>;
}