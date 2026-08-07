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
  useSidebar } from
"@/components/ui/sidebar";
import { createPageUrl } from "@/utils";
import { ACCESS_LEVELS } from "@/lib/layoutConstants";
import { MAIN_NAVIGATION, ADMIN_NAVIGATION } from "./NavigationConfig";
import UserMenu from "./UserMenu";
import { useCreateEnsaioDialog } from "./CreateEnsaioDialogContext";

const NavLink = ({ to, children, className }) => {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Link to={to} className={className} onClick={() => {if (isMobile) setOpenMobile(false);}}>
      {children}
    </Link>);
};

// Classes reutilizáveis
const activeItemCls = "!bg-card [&_span]:!text-black [&_svg]:!text-black";
const inactiveIconStyle = { color: 'var(--color-sidebar-text-muted)' };
const inactiveTextStyle = { color: 'var(--color-sidebar-text)' };

const NavItem = ({ item, isActive, pendingTransfers, isGestorContrato, isSalaTecnica, onItemClick }) => {
  const showBadge = item.showBadge && pendingTransfers > 0 && (isGestorContrato || isSalaTecnica);
  return (
    <SidebarMenuItem onClick={onItemClick}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={`rounded-xl mb-0.5 h-auto ${isActive ? activeItemCls : ''}`}>
        <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2.5">
          <item.icon className="w-4 h-4 flex-shrink-0" style={isActive ? undefined : inactiveIconStyle} />
          <span className="font-semibold text-xs" style={isActive ? undefined : inactiveTextStyle}>{item.title}</span>
          {showBadge &&
          <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingTransfers}</Badge>
          }
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>);
};

const SubNavItem = ({ to, icon: Icon, label, badge, pendingTransfers, isActive, onItemClick }) => (
  <SidebarMenuItem onClick={onItemClick}>
    <SidebarMenuButton asChild isActive={isActive} className={`rounded-xl mb-0.5 h-auto ${isActive ? activeItemCls : ''}`}>
      <NavLink to={to} className="flex items-center gap-3 pl-10 pr-3 py-2.5">
        <Icon className="w-4 h-4 flex-shrink-0" style={isActive ? undefined : inactiveIconStyle} />
        <span className="font-semibold text-xs" style={isActive ? undefined : inactiveTextStyle}>{label}</span>
        {badge && <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingTransfers}</Badge>}
      </NavLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

export default function AppSidebar({
  user, userAccessLevel, canCreateRecords, canManageSystem,
  pendingTransfers, minhasObrasOpen, setMinhasObrasOpen,
  naoConformidadesOpen, setNaoConformidadesOpen,
}) {
  const { openCreateEnsaio } = useCreateEnsaioDialog();
  const isAdmin = userAccessLevel === ACCESS_LEVELS.ADMIN || user?.role === ACCESS_LEVELS.ADMIN;
  const isSalaTecnica = userAccessLevel === ACCESS_LEVELS.SALA_TECNICA;
  const isGestorContrato = userAccessLevel === ACCESS_LEVELS.GESTOR_CONTRATO;
  const isCliente = userAccessLevel === ACCESS_LEVELS.CLIENTE || userAccessLevel === ACCESS_LEVELS.CLIENTE_SUPERVISOR;

  const location = useLocation();
  const isActive = (url) => {
    if (location.pathname === url) return true;
    if (url === '/Dashboard' && location.pathname === '/') return true;
    return false;
  };

  const showNaoConformidades = [ACCESS_LEVELS.ADMIN, ACCESS_LEVELS.GESTOR_CONTRATO, ACCESS_LEVELS.SALA_TECNICA, ACCESS_LEVELS.CLIENTE, ACCESS_LEVELS.CLIENTE_SUPERVISOR].includes(userAccessLevel);
  const showMinhasObras = Object.values(ACCESS_LEVELS).includes(userAccessLevel);
  const gestaoNavigation = ADMIN_NAVIGATION.filter((i) => !i.allowedLevels || i.allowedLevels.includes(userAccessLevel));

  return (
    <Sidebar className="border-r-0 rounded-r-[28px] rounded-l-none" style={{ backgroundColor: 'var(--color-sidebar-bg)', '--sidebar-accent': '#ffffff', '--sidebar-accent-foreground': '#00233B' }}>
      <SidebarHeader className="flex-shrink-0 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-sidebar-border)' }}>
        <div className="flex items-center justify-center">
          <img src="https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/2754f7c59_AE_-_Logo_Hor_Negativo.png"
            alt="Afirmaevias Logo"
            className="h-16 w-auto brightness-200 contrast-110 rounded-[32px] py-3 px-3"
            width="480"
            height="200"
            loading="lazy" />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 pb-6">
        {canCreateRecords &&
          <Button
            type="button"
            onClick={openCreateEnsaio}
            aria-haspopup="dialog"
            className="w-full mb-4 hidden lg:flex font-semibold tracking-wide text-xs"
            style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}>
            <FilePlus className="w-5 h-5 mr-2" style={{ color: 'var(--color-primary)' }} />
            Novo Registro
          </Button>
        }

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider px-3 py-2" style={{ color: 'var(--color-sidebar-text-muted)' }}>
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAVIGATION.filter((i) => !i.allowedLevels || i.allowedLevels.includes(userAccessLevel)).map((item) =>
              <NavItem
                key={item.title}
                item={item}
                isActive={isActive(item.url)}
                pendingTransfers={pendingTransfers}
                isGestorContrato={isGestorContrato}
                isSalaTecnica={isSalaTecnica}
              />
              )}

              {/* Minhas Obras — expansível */}
              {showMinhasObras &&
              <>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="transition-all duration-200 rounded-xl mb-0.5 cursor-pointer hover:bg-[var(--color-sidebar-hover)]" onClick={() => setMinhasObrasOpen((p) => !p)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 w-full">
                        <FolderOpen className="w-4 h-4 flex-shrink-0" style={inactiveIconStyle} />
                        <span className="font-medium flex-1 text-xs" style={inactiveTextStyle}>Minhas Obras</span>
                        {minhasObrasOpen ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={inactiveIconStyle} /> : <ChevronRight className="w-4 h-4 flex-shrink-0" style={inactiveIconStyle} />}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {minhasObrasOpen &&
                <>
                      {[
                  { to: createPageUrl("Projects"), icon: FolderOpen, label: "Projetos" },
                  { to: createPageUrl("MeusEnsaios"), icon: FileText, label: "Ensaios Realizados" },
                  { to: createPageUrl("ResumosPersonalizados"), icon: BarChart3, label: "Resumos" },
                  { to: createPageUrl("SolicitacoesTransferencia"), icon: ArrowLeftRight, label: "Transferências", badge: pendingTransfers > 0 && (isGestorContrato || isSalaTecnica) }].
                  map(({ to, icon, label, badge }) =>
                    <SubNavItem
                      key={label}
                      to={to}
                      icon={icon}
                      label={label}
                      badge={badge}
                      pendingTransfers={pendingTransfers}
                      isActive={isActive(to)}
                    />
                  )}
                      {(isGestorContrato || isAdmin) &&
                        <SubNavItem to="/ImpressionEtiquetas" icon={FileText} label="Impressão de Etiquetas" isActive={isActive("/ImpressionEtiquetas")} />
                  }
                    </>
                }
                </>
              }

              {/* Não Conformidades — expansível */}
              {showNaoConformidades &&
              <>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="transition-all duration-200 rounded-xl mb-0.5 cursor-pointer hover:bg-[var(--color-sidebar-hover)]" onClick={() => setNaoConformidadesOpen((p) => !p)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 w-full">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={inactiveIconStyle} />
                        <span className="font-medium flex-1 text-xs" style={inactiveTextStyle}>Não Conformidades</span>
                        {naoConformidadesOpen ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={inactiveIconStyle} /> : <ChevronRight className="w-4 h-4 flex-shrink-0" style={inactiveIconStyle} />}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {naoConformidadesOpen &&
                <>
                      {[
                  { to: createPageUrl("NaoConformidades"), icon: BarChart3, label: "Dashboard de NCs" },
                  { to: createPageUrl("GestaoNC"), icon: FileText, label: "Gestão de NCs" }].
                  map(({ to, icon, label }) =>
                    <SubNavItem key={label} to={to} icon={icon} label={label} isActive={isActive(to)} />
                  )}
                             {(isGestorContrato || isAdmin) &&
                        <SubNavItem to={createPageUrl("NovaNC")} icon={AlertTriangle} label="Nova NC" isActive={isActive(createPageUrl("NovaNC"))} />
                  }
                    </>
                }
                </>
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração / Gestão */}
        {(canManageSystem || isGestorContrato || isSalaTecnica || isCliente || userAccessLevel === ACCESS_LEVELS.CLIENTE_SUPERVISOR) && gestaoNavigation.length > 0 &&
        <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider px-3 py-2" style={{ color: 'var(--color-sidebar-text-muted)' }}>
              {canManageSystem ? "Administração" : "Gestão"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {gestaoNavigation.map((item) =>
              <NavItem key={item.title} item={item} isActive={isActive(item.url)} pendingTransfers={pendingTransfers} isGestorContrato={isGestorContrato} isSalaTecnica={isSalaTecnica} />
              )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        }
      </SidebarContent>

      <SidebarFooter className="p-4" style={{ borderTop: '1px solid var(--color-sidebar-border)' }}>
        <UserMenu
          user={user}
          isAdmin={isAdmin}
          isSalaTecnica={isSalaTecnica}
          isGestorContrato={isGestorContrato}
          isCliente={isCliente} />
      </SidebarFooter>
    </Sidebar>);
}