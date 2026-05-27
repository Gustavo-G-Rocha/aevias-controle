import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FilePlus, FolderOpen, FileText, BarChart3, ArrowLeftRight, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { DialogTrigger } from "@/components/ui/dialog";
import { createPageUrl } from "@/utils";
import { ACCESS_LEVELS } from "@/lib/layoutConstants";
import { MAIN_NAVIGATION, ADMIN_NAVIGATION } from "./NavigationConfig";
import UserMenu from "./UserMenu";

const NavLink = ({ to, children, className }) => {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Link to={to} className={className} onClick={() => { if (isMobile) setOpenMobile(false); }}>
      {children}
    </Link>
  );
};

const NavItem = ({ item, isActive, pendingTransfers, isGestorContrato, isSalaTecnica }) => {
  const showBadge = item.showBadge && pendingTransfers > 0 && (isGestorContrato || isSalaTecnica);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild className={`hover:bg-white/10 transition-all duration-200 rounded-lg mb-1 ${isActive ? "bg-white/15" : ""}`}>
        <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2.5 relative">
          <item.icon className="w-5 h-5 text-[#BFCF99]" />
          <span className="font-medium text-white/90">{item.title}</span>
          {showBadge && (
            <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingTransfers}</Badge>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default function AppSidebar({
  user, userAccessLevel, canCreateRecords, canManageSystem,
  pendingTransfers, minhasObrasOpen, setMinhasObrasOpen,
  naoConformidadesOpen, setNaoConformidadesOpen,
  isAdmin, isSalaTecnica, isGestorContrato, isCliente,
}) {
  const location = useLocation();
  const isActive = (url) => location.pathname === url;

  const showNaoConformidades = [ACCESS_LEVELS.ADMIN, ACCESS_LEVELS.GESTOR_CONTRATO, ACCESS_LEVELS.SALA_TECNICA, ACCESS_LEVELS.CLIENTE].includes(userAccessLevel);
  const showMinhasObras = Object.values(ACCESS_LEVELS).includes(userAccessLevel);
  const gestaoNavigation = ADMIN_NAVIGATION.filter(i => !i.allowedLevels || i.allowedLevels.includes(userAccessLevel));

  return (
    <Sidebar className="border-r border-white/10 bg-[#00233B]">
      <SidebarHeader className="border-b border-white/10 p-4">
        <div className="flex items-center justify-center">
          <picture>
            <source srcSet="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a7599ee3fb9205cfb852ec/b2878d2bd_image.png" />
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a7599ee3fb9205cfb852ec/b2878d2bd_image.png" alt="Afirmaevias Logo" className="h-16 w-auto dark:hidden" width="auto" height="64" loading="lazy" />
          </picture>
          <picture>
            <source srcSet="https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/7d9853579_LogoDarkmode.jpg" />
            <img src="https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/7d9853579_LogoDarkmode.jpg" alt="Afirmaevias Logo" className="h-16 w-auto hidden dark:block" width="auto" height="64" loading="lazy" />
          </picture>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        {canCreateRecords && (
          <DialogTrigger asChild>
            <Button className="w-full bg-white/15 border border-white/20 text-white hover:bg-white/25 mb-4 hidden lg:flex">
              <FilePlus className="w-5 h-5 mr-2 text-[#BFCF99]" />
              Novo Registro
            </Button>
          </DialogTrigger>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-white/50 uppercase tracking-wider px-3 py-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAVIGATION.filter(i => !i.allowedLevels || i.allowedLevels.includes(userAccessLevel)).map((item) => (
                <NavItem key={item.title} item={item} isActive={isActive(item.url)} pendingTransfers={pendingTransfers} isGestorContrato={isGestorContrato} isSalaTecnica={isSalaTecnica} />
              ))}

              {/* Minhas Obras — expansível */}
              {showMinhasObras && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="hover:bg-white/10 transition-all duration-200 rounded-lg mb-1 cursor-pointer" onClick={() => setMinhasObrasOpen(p => !p)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 w-full">
                        <FolderOpen className="w-5 h-5 text-[#BFCF99]" />
                        <span className="font-medium text-white/90 flex-1">Minhas Obras</span>
                        {minhasObrasOpen ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronRight className="w-4 h-4 text-white/50" />}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {minhasObrasOpen && (
                    <>
                      {[
                        { to: createPageUrl("Projects"), icon: FolderOpen, label: "Projetos" },
                        { to: createPageUrl("MeusEnsaios"), icon: FileText, label: "Ensaios Realizados" },
                        { to: createPageUrl("ResumosPersonalizados"), icon: BarChart3, label: "Resumos" },
                        { to: createPageUrl("SolicitacoesTransferencia"), icon: ArrowLeftRight, label: "Transferências", badge: pendingTransfers > 0 && (isGestorContrato || isSalaTecnica) },
                      ].map(({ to, icon: Icon, label, badge }) => (
                        <SidebarMenuItem key={label}>
                          <SidebarMenuButton asChild className={`hover:bg-black/5 transition-all duration-200 rounded-lg mb-1 ${isActive(to) ? "bg-black/10" : ""}`}>
                            <NavLink to={to} className="flex items-center gap-3 pl-10 pr-3 py-2.5">
                              <Icon className="w-4 h-4 text-[#BFCF99]" />
                              <span className="font-medium text-white/80 text-sm">{label}</span>
                              {badge && <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingTransfers}</Badge>}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                      {(isGestorContrato || isAdmin) && (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild className={`hover:bg-black/5 transition-all duration-200 rounded-lg mb-1 ${isActive("/ImpressionEtiquetas") ? "bg-black/10" : ""}`}>
                            <NavLink to="/ImpressionEtiquetas" className="flex items-center gap-3 pl-10 pr-3 py-2.5">
                             <FileText className="w-4 h-4 text-[#BFCF99]" />
                             <span className="font-medium text-white/80 text-sm">Impressão de Etiquetas</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                      {(isGestorContrato || isSalaTecnica || isAdmin) && (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild className={`hover:bg-black/5 transition-all duration-200 rounded-lg mb-1 ${isActive("/RelatoriosUnificados") ? "bg-black/10" : ""}`}>
                            <NavLink to="/RelatoriosUnificados" className="flex items-center gap-3 pl-10 pr-3 py-2.5">
                             <FileText className="w-4 h-4 text-[#BFCF99]" />
                             <span className="font-medium text-white/80 text-sm">Relatórios Unificados</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Não Conformidades — expansível */}
              {showNaoConformidades && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="hover:bg-white/10 transition-all duration-200 rounded-lg mb-1 cursor-pointer" onClick={() => setNaoConformidadesOpen(p => !p)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 w-full">
                        <AlertTriangle className="w-5 h-5 text-[#BFCF99]" />
                        <span className="font-medium text-white/90 flex-1">Não Conformidades</span>
                        {naoConformidadesOpen ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronRight className="w-4 h-4 text-white/50" />}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {naoConformidadesOpen && (
                    <>
                      {[
                        { to: createPageUrl("NaoConformidades"), icon: BarChart3, label: "Dashboard de NCs" },
                        { to: createPageUrl("GestaoNC"), icon: FileText, label: "Gestão de NCs" },
                      ].map(({ to, icon: Icon, label }) => (
                        <SidebarMenuItem key={label}>
                          <SidebarMenuButton asChild className={`hover:bg-black/5 transition-all duration-200 rounded-lg mb-1 ${isActive(to) ? "bg-black/10" : ""}`}>
                            <NavLink to={to} className="flex items-center gap-3 pl-10 pr-3 py-2.5">
                              <Icon className="w-4 h-4 text-[#BFCF99]" />
                              <span className="font-medium text-white/80 text-sm">{label}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                      {(isGestorContrato || isAdmin) && (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild className={`hover:bg-black/5 transition-all duration-200 rounded-lg mb-1 ${isActive(createPageUrl("NovaNC")) ? "bg-black/10" : ""}`}>
                            <NavLink to={createPageUrl("NovaNC")} className="flex items-center gap-3 pl-10 pr-3 py-2.5">
                              <AlertTriangle className="w-4 h-4 text-[#BFCF99]" />
                              <span className="font-medium text-white/80 text-sm">Nova NC</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </>
                  )}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração / Gestão */}
        {(canManageSystem || isGestorContrato || isSalaTecnica || isCliente) && gestaoNavigation.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-white/50 uppercase tracking-wider px-3 py-2">
              {canManageSystem ? "Administração" : "Gestão"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {gestaoNavigation.map((item) => (
                  <NavItem key={item.title} item={item} isActive={isActive(item.url)} pendingTransfers={pendingTransfers} isGestorContrato={isGestorContrato} isSalaTecnica={isSalaTecnica} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4">
        <UserMenu
          user={user}
          isAdmin={isAdmin}
          isSalaTecnica={isSalaTecnica}
          isGestorContrato={isGestorContrato}
          isCliente={isCliente}
        />
      </SidebarFooter>
    </Sidebar>
  );
}